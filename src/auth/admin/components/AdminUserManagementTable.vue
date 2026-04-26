<template>
  <div class="admin-user-management-table-c">
    <div class="table-controls">
      <div class="search-box">
        <input 
          v-model="searchEmail" 
          type="text" 
          :placeholder="t.searchByEmail" 
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch">
          <font-awesome-icon icon="magnifying-glass" />
        </button>
      </div>
    </div>

    <div class="table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>{{ t.name }}</th>
            <th>Email</th>
            <th>{{ t.tier }}</th>
            <th>{{ t.chatUsage }}</th>
            <th>{{ t.ocrUsage }}</th>
            <th>{{ t.actions }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="isLoading">
            <tr v-for="i in 5" :key="i">
              <td v-for="j in 6" :key="j">
                <UISkeletonLoader height="20px" />
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="user in users" :key="user.email">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="tier-badge">{{ user.tier }}</span>
              </td>
              <td>{{ user.aiChatUsage }} / {{ user.aiChatLimit }}</td>
              <td>{{ user.receiptScanUsage }} / {{ user.receiptScanLimit }}</td>
              <td>
                <div class="action-buttons">
                  <button class="tier-btn" @click="promptUpdateTier(user)" :title="t.updateTier">
                    <font-awesome-icon icon="user-gear" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="6" class="no-data">{{ t.noUsersFound }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Update Tier Modal -->
    <div v-if="isTierModalOpen" class="modal-overlay" @click.self="isTierModalOpen = false">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h3>{{ t.updateTierTitle }}</h3>
          <button class="close-btn" @click="isTierModalOpen = false">
            <font-awesome-icon icon="xmark" />
          </button>
        </div>
        <div class="modal-body">
          <p><strong>{{ selectedUser?.email }}</strong></p>
          <div class="form-group">
            <label>{{ t.newTierLabel }}</label>
            <select v-model="newTier">
              <option v-for="plan in plans" :key="plan.id" :value="plan.id.toString()">
                {{ plan.name }} (#{{ plan.id }})
              </option>
              <option value="1">Free / Basic (1)</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="isTierModalOpen = false">{{ t.cancel }}</button>
          <button class="save-btn" @click="handleUpdateTier" :disabled="isUpdating">
            {{ isUpdating ? t.updating : t.update }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import type { PropType } from 'vue'
import { accountService } from '@/services/api/account/account.service'
import type { AccountUserUsageResponse } from '@/services/api/account/account.models'
import type { AdminPlan } from '@/services/api/adminPlans/adminPlans.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

export default defineComponent({
  name: 'AdminUserManagementTable',
  components: {
    UISkeletonLoader
  },
  props: {
    selectedLanguage: {
      type: String,
      default: 'English'
    },
    plans: {
      type: Array as PropType<AdminPlan[]>,
      default: () => []
    }
  },
  setup(props) {
    const users = ref<AccountUserUsageResponse[]>([])
    const searchEmail = ref('')
    const isTierModalOpen = ref(false)
    const selectedUser = ref<AccountUserUsageResponse | null>(null)
    const newTier = ref('')
    const isUpdating = ref(false)
    const isLoading = ref(true)

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        name: isTr ? 'İsim' : 'Name',
        tier: isTr ? 'Seviye' : 'Tier',
        chatUsage: isTr ? 'Chat Kullanımı' : 'Chat Usage',
        ocrUsage: isTr ? 'OCR Kullanımı' : 'OCR Usage',
        actions: isTr ? 'Aksiyonlar' : 'Actions',
        searchByEmail: isTr ? 'Email ile ara...' : 'Search by email...',
        noUsersFound: isTr ? 'Kullanıcı bulunamadı.' : 'No users found.',
        updateTier: isTr ? 'Seviyeyi Güncelle' : 'Update Tier',
        updateTierTitle: isTr ? 'Kullanıcı Seviyesini Güncelle' : 'Update User Tier',
        newTierLabel: isTr ? 'Yeni Seviye (Plan)' : 'New Tier (Plan)',
        cancel: isTr ? 'İptal' : 'Cancel',
        update: isTr ? 'Güncelle' : 'Update',
        updating: isTr ? 'Güncelleniyor...' : 'Updating...'
      }
    })

    const fetchUsers = async () => {
      isLoading.value = true
      try {
        users.value = await accountService.getAdminUsages(searchEmail.value)
      } catch (error) {
        console.error('Error fetching admin usages:', error)
      } finally {
        isLoading.value = false
      }
    }

    const handleSearch = () => {
      fetchUsers()
    }

    const promptUpdateTier = (user: AccountUserUsageResponse) => {
      selectedUser.value = user
      // If the tier is already a number-like string, use it, otherwise default to "1"
      newTier.value = /^\d+$/.test(user.tier) ? user.tier : '1'
      isTierModalOpen.value = true
    }

    const handleUpdateTier = async () => {
      if (!selectedUser.value) return
      isUpdating.value = true
      try {
        await accountService.updateTier({
          email: selectedUser.value.email,
          tier: newTier.value
        })
        isTierModalOpen.value = false
        await fetchUsers()
      } catch (error) {
        console.error('Error updating tier:', error)
      } finally {
        isUpdating.value = false
      }
    }

    onMounted(() => {
      fetchUsers()
    })

    return {
      users,
      searchEmail,
      isTierModalOpen,
      selectedUser,
      newTier,
      isUpdating,
      isLoading,
      t,
      handleSearch,
      promptUpdateTier,
      handleUpdateTier
    }
  }
})
</script>

<style scoped lang="scss">
.admin-user-management-table-c {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.table-controls {
  display: flex;
  justify-content: flex-end;
}

.search-box {
  display: flex;
  gap: 8px;
  input {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--background-color-soft);
    color: var(--header-text-color);
    width: 250px;
  }
  button {
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    background: var(--primary-green-color);
    color: white;
    cursor: pointer;
  }
}

.table-container {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    padding: 12px 16px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--normal-text-color);
    border-bottom: 1px solid var(--border-color);
  }

  td {
    padding: 12px 16px;
    font-size: 14px;
    color: var(--header-text-color);
    border-bottom: 1px solid var(--border-color);
  }

  .no-data {
    text-align: center;
    padding: 40px;
    color: var(--normal-text-color);
  }
}

.tier-badge {
  background: var(--primary-green-color);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.tier-btn {
  background: var(--background-color-soft);
  border: 1px solid var(--border-color);
  color: var(--header-text-color);
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--hover-color);
    color: var(--primary-green-color);
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 100%;
  max-width: 400px;
  background: var(--background-color);
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  h3 { margin: 0; font-size: 18px; }
  .close-btn { background: transparent; border: none; font-size: 18px; cursor: pointer; color: var(--normal-text-color); }
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    label { font-size: 13px; font-weight: 600; }
    select {
      padding: 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-color-soft);
      color: var(--header-text-color);
    }
  }
}

.modal-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: var(--background-color-soft);

  button {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
  }

  .cancel-btn { background: transparent; border: 1px solid var(--border-color); color: var(--header-text-color); }
  .save-btn { background: var(--primary-green-color); border: none; color: white; }
}

.glass-card {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>

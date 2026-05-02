<template>
  <div class="admin-plan-table">
    <div class="table-container">
      <table class="plan-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>{{ t.name }}</th>
            <th>{{ t.price }}</th>
            <th>{{ t.ocrLimit }}</th>
            <th>{{ t.sttLimit }}</th>
            <th>{{ t.status }}</th>
            <th>{{ t.actions }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plan in plans" :key="plan.id">
            <td data-label="ID">#{{ plan.id }}</td>
            <td class="plan-name-cell" :data-label="t.name">
              <span class="plan-name">{{ plan.name }}</span>
              <span class="plan-desc">{{ plan.description }}</span>
            </td>
            <td class="price-cell" :data-label="t.price">
              <span class="price-value">{{ plan.monthlyPrice }}</span>
              <span class="currency">{{ plan.priceCurrency }}</span>
              <span class="period">/mo</span>
            </td>
            <td :data-label="t.ocrLimit">{{ plan.monthlyOcrLimit }}</td>
            <td :data-label="t.sttLimit">{{ plan.monthlySttLimit }}</td>
            <td :data-label="t.status">
              <span :class="['status-tag', plan.isActive ? 'active' : 'inactive']">
                {{ plan.isActive ? t.active : t.inactive }}
              </span>
            </td>
            <td :data-label="t.actions">
              <div class="action-buttons">
                <button class="action-btn users" @click="viewUsers(plan)" :title="t.viewUsers">
                  <font-awesome-icon icon="user-group" />
                </button>
                <button class="action-btn edit" @click="$emit('edit', plan)" :title="t.edit">
                  <font-awesome-icon icon="pen-to-square" />
                </button>
                <button class="action-btn delete" @click="$emit('delete', plan.id)" :title="t.delete">
                  <font-awesome-icon icon="trash-can" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Plan Users Modal -->
    <div v-if="isUsersModalOpen" class="modal-overlay" @click.self="isUsersModalOpen = false">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h3>{{ t.usersOfPlan }}: {{ selectedPlan?.name }}</h3>
          <button class="close-btn" @click="isUsersModalOpen = false">
            <font-awesome-icon icon="xmark" />
          </button>
        </div>
        <div class="modal-body">
          <div v-if="isLoadingUsers" class="loader">
            <UISkeletonLoader v-for="i in 5" :key="i" height="50px" style="margin-bottom: 12px" border-radius="8px" />
          </div>
          <div v-else-if="planUsers.length > 0" class="user-grid">
            <div v-for="user in planUsers" :key="user.email" class="user-card">
              <div class="user-main">
                <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                <span class="user-email">{{ user.email }}</span>
              </div>
              <div class="user-usage">
                <span>OCR: {{ user.ocrRequestsThisMonth }}</span>
                <span>STT: {{ user.sttRequestsThisMonth }}</span>
              </div>
            </div>
          </div>
          <p v-else class="no-data">{{ t.noUsersFound }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import type { PropType } from 'vue'
import { adminPlansService } from '@/services/api/adminPlans/adminPlans.service'
import type { AdminPlan, AdminUserUsage } from '@/services/api/adminPlans/adminPlans.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

export default defineComponent({
  name: 'AdminPlanTable',
  components: {
    UISkeletonLoader
  },
  props: {
    plans: {
      type: Array as PropType<AdminPlan[]>,
      required: true
    },
    selectedLanguage: {
      type: String,
      default: 'English'
    }
  },
  emits: ['edit', 'delete'],
  setup(props) {
    const isUsersModalOpen = ref(false)
    const selectedPlan = ref<AdminPlan | null>(null)
    const planUsers = ref<AdminUserUsage[]>([])
    const isLoadingUsers = ref(false)

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        name: isTr ? 'İsim' : 'Name',
        description: isTr ? 'Açıklama' : 'Description',
        price: isTr ? 'Fiyat' : 'Price',
        ocrLimit: isTr ? 'OCR Limiti' : 'OCR Limit',
        sttLimit: isTr ? 'STT Limiti' : 'STT Limit',
        status: isTr ? 'Durum' : 'Status',
        active: isTr ? 'Aktif' : 'Active',
        inactive: isTr ? 'Pasif' : 'Inactive',
        actions: isTr ? 'İşlemler' : 'Actions',
        edit: isTr ? 'Düzenle' : 'Edit',
        delete: isTr ? 'Sil' : 'Delete',
        viewUsers: isTr ? 'Kullanıcıları Gör' : 'View Users',
        usersOfPlan: isTr ? 'Plana Dahil Kullanıcılar' : 'Users of Plan',
        noUsersFound: isTr ? 'Kullanıcı bulunamadı.' : 'No users found.'
      }
    })

    const viewUsers = async (plan: AdminPlan) => {
      selectedPlan.value = plan
      isUsersModalOpen.value = true
      isLoadingUsers.value = true
      try {
        planUsers.value = await adminPlansService.getPlanUsers(plan.id)
      } catch (error) {
        console.error('Error fetching plan users:', error)
      } finally {
        isLoadingUsers.value = false
      }
    }

    return { t, isUsersModalOpen, selectedPlan, planUsers, isLoadingUsers, viewUsers }
  }
})
</script>

<style scoped lang="scss">
.admin-plan-table {
  width: 100%;
}

.table-container {
  overflow-x: auto;
}

.plan-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    padding: 16px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--normal-text-color);
    letter-spacing: 0.05em;
    background: var(--background-color-soft);
  }

  td {
    padding: 16px;
    font-size: 14px;
    color: var(--header-text-color);
    border-bottom: 1px solid var(--border-color);
  }

  @media (max-width: 768px) {
    thead {
      display: none;
    }

    tr {
      display: block;
      padding: 12px;
      border-bottom: 2px solid var(--border-color);
      background: var(--background-color-soft);
      margin-bottom: 12px;
      border-radius: 12px;

      &:last-child {
        border-bottom: none;
      }
    }

    td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0 !important;
      border-bottom: 1px solid var(--border-color);
      text-align: right;

      &:last-child {
        border-bottom: none;
      }

      &::before {
        content: attr(data-label);
        font-weight: 800;
        font-size: 10px;
        text-transform: uppercase;
        color: var(--normal-text-color);
        opacity: 0.7;
        margin-right: 16px;
        text-align: left;
      }
    }
  }
}

.plan-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .plan-name { font-weight: 500; color: var(--primary-green-color); }
  .plan-desc { font-size: 12px; color: var(--normal-text-color); opacity: 0.8; max-width: 250px; }
}

.price-cell {
  .price-value { font-weight: 500; font-size: 16px; }
  .currency { font-size: 12px; font-weight: 500; margin-left: 2px; }
  .period { font-size: 12px; color: var(--normal-text-color); }
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  
  &.active { background: rgba(16, 185, 129, 0.1); color: var(--primary-green-color); }
  &.inactive { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--background-color-soft);
  color: var(--header-text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover { transform: translateY(-1px); }
  &.users:hover { color: #3b82f6; border-color: #3b82f6; }
  &.edit:hover { color: var(--primary-green-color); border-color: var(--primary-green-color); }
  &.delete:hover { color: #ef4444; border-color: #ef4444; }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  width: 90%;
  max-width: 550px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 { margin: 0; font-size: 18px; }
  .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--normal-text-color); }
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  .no-data { text-align: center; padding: 40px; color: var(--normal-text-color); }
}

.user-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.user-card {
  padding: 16px;
  background: var(--background-color-soft);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .user-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
    .user-name { font-weight: 500; font-size: 14px; }
    .user-email { font-size: 12px; color: var(--normal-text-color); }
  }

  .user-usage {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: flex-end;
    font-size: 11px;
    font-weight: 500;
    color: var(--primary-green-color);
  }
}
</style>

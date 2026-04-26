<template>
  <div class="admin-plan-table">
    <div class="table-container">
      <table class="plan-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>{{ t.name }}</th>
            <th>{{ t.description }}</th>
            <th>{{ t.ocrLimit }}</th>
            <th>{{ t.sttLimit }}</th>
            <th>{{ t.status }}</th>
            <th>{{ t.actions }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plan in plans" :key="plan.id">
            <td>#{{ plan.id }}</td>
            <td class="plan-name">{{ plan.name }}</td>
            <td class="plan-desc">{{ plan.description }}</td>
            <td>{{ plan.monthlyOcrLimit }}</td>
            <td>{{ plan.monthlySttLimit }}</td>
            <td>
              <span :class="['status-tag', plan.isActive ? 'active' : 'inactive']">
                {{ plan.isActive ? t.active : t.inactive }}
              </span>
            </td>
            <td>
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
          <ul v-else-if="planUsers.length > 0" class="user-list">
            <li v-for="user in planUsers" :key="user.email">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-email">{{ user.email }}</span>
            </li>
          </ul>
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
import type { AdminPlan, AdminPlanUser } from '@/services/api/adminPlans/adminPlans.models'
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
    const planUsers = ref<AdminPlanUser[]>([])
    const isLoadingUsers = ref(false)

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        name: isTr ? 'İsim' : 'Name',
        description: isTr ? 'Açıklama' : 'Description',
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
.table-container {
  overflow-x: auto;
}

.plan-table {
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
    padding: 16px;
    font-size: 14px;
    color: var(--header-text-color);
    border-bottom: 1px solid var(--border-color);
  }
}

.plan-name { font-weight: 700; color: var(--primary-green-color); }
.plan-desc { max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: var(--normal-text-color); }

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  
  &.active { background: rgba(0, 200, 83, 0.1); color: #00c853; }
  &.inactive { background: rgba(255, 82, 82, 0.1); color: #ff5252; }
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

  &:hover { background: var(--hover-color); }
  &.users:hover { color: var(--primary-blue-color); border-color: var(--primary-blue-color); }
  &.edit:hover { color: var(--primary-green-color); border-color: var(--primary-green-color); }
  &.delete:hover { color: #ff5252; border-color: #ff5252; }
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
  max-width: 500px;
  background: var(--background-color);
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 { margin: 0; font-size: 18px; }
  .close-btn { background: transparent; border: none; font-size: 20px; cursor: pointer; color: var(--normal-text-color); }
}

.modal-body {
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;

  .loader { padding: 4px 0; }
  .no-data { text-align: center; color: var(--normal-text-color); }
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  li {
    padding: 12px;
    background: var(--background-color-soft);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .user-name { font-weight: 700; font-size: 14px; }
    .user-email { font-size: 12px; color: var(--normal-text-color); }
  }
}

.glass-card {
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
</style>

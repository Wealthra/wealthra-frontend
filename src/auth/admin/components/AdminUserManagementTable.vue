<template>
  <div class="admin-user-management-table-c">
    <div class="table-controls">
      <div class="search-box">
        <div class="input-wrapper">
          <font-awesome-icon icon="magnifying-glass" class="search-icon" />
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="t.searchByEmail" 
            @keyup.enter="handleSearch"
          />
        </div>
        <button class="search-btn" @click="handleSearch">
          {{ t.search }}
        </button>
        <button class="assign-trigger-btn" @click="isAssignmentModalOpen = true" :title="t.assignPlan">
          <font-awesome-icon icon="user-plus" />
          {{ t.assign }}
        </button>
      </div>
    </div>

    <div class="table-container glass-card">
      <table class="user-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Status</th>
            <th>{{ t.tier }}</th>
            <th>Email Verified</th>
            <th>Last Login</th>
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
            <tr v-for="user in users" :key="user.id">
              <td class="user-cell">
                <div class="user-info">
                  <span class="full-name">{{ user.firstName }} {{ user.lastName }}</span>
                  <span class="email">{{ user.email }}</span>
                </div>
              </td>
              <td>
                <span :class="['status-badge', user.lockoutEnd ? 'locked' : 'active']">
                  {{ user.lockoutEnd ? 'Locked' : 'Active' }}
                </span>
              </td>
              <td>
                <div class="tier-info">
                  <span class="tier-tag">T{{ user.subscriptionTier }}</span>
                  <span class="plan-name">{{ user.planName }}</span>
                </div>
              </td>
              <td>
                <font-awesome-icon 
                  :icon="user.emailConfirmed ? 'circle-check' : 'circle-xmark'" 
                  :class="user.emailConfirmed ? 'confirmed' : 'pending'"
                />
              </td>
              <td class="date-cell">{{ user.lastLoginDate ? formatDate(user.lastLoginDate) : 'Never' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn" @click="promptEditRoles(user)" title="Manage Roles">
                    <font-awesome-icon icon="shield-halved" />
                  </button>
                  <button class="action-btn" @click="promptLockUser(user)" :title="user.lockoutEnd ? 'Unlock' : 'Lock'">
                    <font-awesome-icon :icon="user.lockoutEnd ? 'lock-open' : 'lock'" />
                  </button>
                  <button class="action-btn delete" @click="promptResetPassword(user)" title="Reset Password">
                    <font-awesome-icon icon="key" />
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

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          <font-awesome-icon icon="chevron-left" />
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
          <font-awesome-icon icon="chevron-right" />
        </button>
      </div>
    </div>

    <!-- Modals for Assignment, Roles, Locking etc. can be added here -->
    <div v-if="isAssignmentModalOpen" class="modal-overlay" @click.self="isAssignmentModalOpen = false">
      <div class="modal-content glass-card assignment-modal">
        <div class="modal-header">
          <h3>{{ t.assignPlanTitle }}</h3>
          <button class="close-btn" @click="isAssignmentModalOpen = false">
            <font-awesome-icon icon="xmark" />
          </button>
        </div>
        <div class="modal-body">
          <AdminUserAssignment 
            :plans="plans" 
            :selectedLanguage="selectedLanguage"
            @assigned="handleAssigned"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import type { PropType } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { AdminUser } from '@/services/api/admin/admin.models'
import type { AdminPlan } from '@/services/api/adminPlans/adminPlans.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import AdminUserAssignment from './AdminUserAssignment.vue'

export default defineComponent({
  name: 'AdminUserManagementTable',
  components: {
    UISkeletonLoader,
    AdminUserAssignment
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
    const users = ref<AdminUser[]>([])
    const searchQuery = ref('')
    const isLoading = ref(true)
    const currentPage = ref(1)
    const totalPages = ref(1)
    const pageSize = ref(20)
    
    const isAssignmentModalOpen = ref(false)

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        name: isTr ? 'İsim' : 'Name',
        tier: isTr ? 'Plan' : 'Plan',
        actions: isTr ? 'Aksiyonlar' : 'Actions',
        searchByEmail: isTr ? 'Email veya isim...' : 'Search email or name...',
        search: isTr ? 'Ara' : 'Search',
        assign: isTr ? 'Ata' : 'Assign',
        noUsersFound: isTr ? 'Kullanıcı bulunamadı.' : 'No users found.',
        assignPlan: isTr ? 'Plan Ata' : 'Assign Plan',
        assignPlanTitle: isTr ? 'Kullanıcıya Plan Ata' : 'Assign Plan to User'
      }
    })

    const fetchUsers = async () => {
      isLoading.value = true
      try {
        const response = await adminService.getUsers(currentPage.value, pageSize.value, searchQuery.value)
        users.value = response.items
        totalPages.value = response.totalPages
      } catch (error) {
        console.error('Error fetching admin users:', error)
      } finally {
        isLoading.value = false
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      fetchUsers()
    }

    const changePage = (page: number) => {
      currentPage.value = page
      fetchUsers()
    }

    const handleAssigned = () => {
      isAssignmentModalOpen.value = false
      fetchUsers()
    }

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString([], { dateStyle: 'medium' })
    }

    const promptEditRoles = (user: AdminUser) => {
      // Implementation for roles management
      console.log('Edit roles for', user.email)
    }

    const promptLockUser = async (user: AdminUser) => {
       const isLocked = !!user.lockoutEnd
       if (confirm(`Are you sure you want to ${isLocked ? 'unlock' : 'lock'} ${user.email}?`)) {
         try {
           await adminService.lockUser(user.id, !isLocked)
           await fetchUsers()
         } catch (err) {
           console.error(err)
         }
       }
    }

    const promptResetPassword = (user: AdminUser) => {
      const newPass = prompt(`Enter new password for ${user.email}:`)
      if (newPass) {
        adminService.setPassword(user.id, newPass)
          .then(() => alert('Password updated'))
          .catch(err => alert('Failed: ' + err.message))
      }
    }

    onMounted(fetchUsers)

    return {
      users,
      searchQuery,
      isLoading,
      currentPage,
      totalPages,
      isAssignmentModalOpen,
      t,
      handleSearch,
      changePage,
      handleAssigned,
      formatDate,
      promptEditRoles,
      promptLockUser,
      promptResetPassword
    }
  }
})
</script>

<style scoped lang="scss">
.admin-user-management-table-c {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.table-controls {
  display: flex;
  justify-content: flex-end;
}

.search-box {
  display: flex;
  gap: 12px;
  align-items: center;

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    .search-icon {
      position: absolute;
      left: 12px;
      color: var(--normal-text-color);
      opacity: 0.6;
    }

    input {
      padding: 10px 12px 10px 38px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--background-color-soft);
      color: var(--header-text-color);
      width: 280px;
      font-size: 14px;
      
      &:focus { border-color: var(--primary-green-color); outline: none; }
    }
  }

  .search-btn {
    padding: 10px 20px;
    background: var(--primary-green-color);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
  }

  .assign-trigger-btn {
    padding: 10px 20px;
    background: var(--background-color-soft);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    color: var(--primary-green-color);
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover { background: var(--primary-green-color); color: white; }
  }
}

.table-container {
  padding: 0;
  overflow: hidden;
}

.user-table {
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    background: var(--background-color-soft);
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--normal-text-color);
    letter-spacing: 0.05em;
  }

  .user-cell {
    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .full-name { font-weight: 500; color: var(--header-text-color); }
      .email { font-size: 12px; color: var(--normal-text-color); opacity: 0.8; }
    }
  }

  .status-badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;

    &.active { background: rgba(16, 185, 129, 0.1); color: var(--primary-green-color); }
    &.locked { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
  }

  .tier-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .tier-tag {
      background: var(--primary-green-color);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 800;
    }

    .plan-name { font-size: 13px; color: var(--header-text-color); font-weight: 500; }
  }

  .confirmed { color: var(--primary-green-color); }
  .pending { color: var(--normal-text-color); opacity: 0.3; }

  .date-cell { font-size: 13px; color: var(--normal-text-color); }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--background-color-soft);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--header-text-color);
    cursor: pointer;
    transition: all 0.2s;

    &:hover { color: var(--primary-green-color); border-color: var(--primary-green-color); }
    &.delete:hover { color: #ef4444; border-color: #ef4444; }
  }
}

.pagination {
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  background: var(--background-color-soft);

  button {
    background: var(--background-color);
    border: 1px solid var(--border-color);
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }

  .page-info { font-size: 13px; font-weight: 500; color: var(--normal-text-color); }
}

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
  max-width: 450px;
  &.assignment-modal { max-width: 600px; }
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 { margin: 0; font-size: 18px; }
  .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--normal-text-color); }
}

.modal-body { padding: 24px; }
</style>

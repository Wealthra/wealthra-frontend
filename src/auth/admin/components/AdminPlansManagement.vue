<template>
  <div class="admin-plans-management">
    <!-- Usage Summary Section -->
    <section class="usage-section mb-8">
      <div v-if="isLoadingSummary" class="summary-loading-fidelity">
        <div class="skeleton-grid-summary">
          <div v-for="i in 4" :key="i" class="skel-kpi-card glass-card">
            <div class="skel-kpi-info">
              <UISkeletonLoader width="80px" height="12px" border-radius="4px" class="mb-2" />
              <UISkeletonLoader width="120px" height="24px" border-radius="4px" />
            </div>
          </div>
        </div>

        <!-- Missing Breakdown Skeleton -->
        <div class="skel-breakdown glass-card mt-6">
          <UISkeletonLoader width="150px" height="20px" border-radius="4px" class="mb-6" />
          <div class="skel-table">
            <div v-for="i in 4" :key="i" class="skel-table-row">
              <UISkeletonLoader width="100px" height="14px" border-radius="4px" />
              <UISkeletonLoader width="60px" height="14px" border-radius="4px" />
              <UISkeletonLoader width="60px" height="14px" border-radius="4px" />
              <UISkeletonLoader width="60px" height="14px" border-radius="4px" />
            </div>
          </div>
        </div>
      </div>
      <AdminUsageSummary
        v-else-if="usageSummary"
        :summary="usageSummary"
        :selectedLanguage="selectedLanguage"
      />
    </section>

    <!-- Plans Table Section -->
    <section class="plans-section">
      <div class="section-card glass-card">
        <div class="section-header">
          <template v-if="isLoadingPlans">
            <h2>{{ t.allPlans }}</h2>
            <UISkeletonLoader width="140px" height="36px" border-radius="10px" />
          </template>
          <template v-else>
            <h2>{{ t.allPlans }}</h2>
            <div class="header-actions">
              <button class="create-btn premium-button" @click="openCreateModal" :disabled="isLoadingPlans">
                <font-awesome-icon :icon="faPlus" />
                <span>{{ t.createNewPlan }}</span>
              </button>
            </div>
          </template>
        </div>

        <div class="table-wrap">
          <div v-if="isLoadingPlans" class="table-loading-fidelity">
            <div v-for="i in 6" :key="i" class="skeleton-row-fidelity">
              <div class="skel-cell skel-name">
                <UISkeletonLoader width="100%" height="14px" border-radius="4px" />
              </div>
              <div class="skel-cell">
                <UISkeletonLoader width="60px" height="14px" border-radius="4px" />
              </div>
              <div class="skel-cell">
                <UISkeletonLoader width="40px" height="14px" border-radius="4px" />
              </div>
              <div class="skel-cell">
                <UISkeletonLoader width="80px" height="14px" border-radius="4px" />
              </div>
              <div class="skel-cell text-right">
                <UISkeletonLoader width="40px" height="14px" border-radius="4px" style="margin-left: auto" />
              </div>
              <div class="skel-cell text-right">
                <UISkeletonLoader width="20px" height="14px" border-radius="4px" style="margin-left: auto" />
              </div>
            </div>
          </div>
          <table v-else class="plans-table">
            <thead>
              <tr>
                <th>{{ t.planName }}</th>
                <th>{{ t.price }}</th>
                <th>{{ t.limits }}</th>
                <th>{{ t.status }}</th>
                <th class="text-right">{{ t.actions }}</th>
                <th style="width: 40px"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="plan in plans"
                :key="plan.id"
                class="plan-row"
                @click="openAssignmentPanel(plan)"
              >
                <td class="name-cell" :data-label="t.planName">
                  <div class="plan-info">
                    <span class="plan-name">{{ plan.name }}</span>
                    <span class="plan-id">ID: #{{ plan.id }}</span>
                  </div>
                </td>
                <td class="price-cell" :data-label="t.price">
                  <div class="price-wrap">
                    <span class="amount">{{ plan.monthlyPrice }}</span>
                    <span class="currency">{{ plan.priceCurrency }}</span>
                    <span class="period">/mo</span>
                  </div>
                </td>
                <td class="limits-cell" :data-label="t.limits">
                  <div class="limit-item">
                    <span class="limit-label">OCR:</span>
                    <span class="limit-value">{{ plan.monthlyOcrLimit }}</span>
                  </div>
                  <div class="limit-item">
                    <span class="limit-label">STT:</span>
                    <span class="limit-value">{{ plan.monthlySttLimit }}</span>
                  </div>
                </td>
                <td class="status-cell" :data-label="t.status">
                  <span :class="['status-badge', plan.isActive ? 'active' : 'inactive']">
                    {{ plan.isActive ? t.active : t.inactive }}
                  </span>
                </td>
                <td class="actions-cell text-right" :data-label="t.actions">
                  <div class="row-actions">
                    <button
                      class="action-btn edit"
                      @click.stop="openEditModal(plan)"
                      :title="t.edit"
                    >
                      <font-awesome-icon :icon="faPenToSquare" />
                    </button>
                    <button
                      class="action-btn delete"
                      @click.stop="confirmDelete(plan)"
                      :title="t.delete"
                    >
                      <font-awesome-icon :icon="faBan" />
                    </button>
                  </div>
                </td>
                <td class="chevron-cell">
                  <font-awesome-icon :icon="faChevronRight" class="row-chevron" />
                </td>
              </tr>
              <tr v-if="plans.length === 0 && !isLoadingPlans">
                <td colspan="5" class="empty-cell">
                  <div class="empty-state">
                    <font-awesome-icon :icon="faBoxOpen" class="empty-icon" />
                    <p>{{ t.noPlansFound }}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Side Panel for Assignment -->
    <UISidePanelShell
      :isOpen="isPanelOpen"
      :title="selectedPlan?.name || ''"
      :selected-language="selectedLanguage"
      @close="closePanel"
    >
      <div class="panel-content">
        <!-- Assign User Section -->
        <div class="form-section">
          <div class="section-header-row">
            <h4>{{ t.assignUser }}</h4>
          </div>
          <div class="assign-row">
            <input
              v-model="assignEmail"
              type="email"
              :placeholder="t.userEmailPlaceholder"
              class="flex-1"
            />
            <button
              class="apply-btn"
              @click="handleAssignPlan"
              :disabled="isAssigning || !assignEmail"
            >
              <font-awesome-icon v-if="isAssigning" :icon="faSpinner" spin />
              <span v-else>{{ t.assign }}</span>
            </button>
          </div>
        </div>

        <!-- Users List Section -->
        <div class="form-section">
          <div class="section-header-row">
            <h4>{{ t.planUsers }}</h4>
            <button class="refresh-small-btn" @click="fetchPlanUsers" :disabled="isLoadingUsers">
              <font-awesome-icon :icon="faRotateRight" :spin="isLoadingUsers" />
            </button>
          </div>

          <div v-if="isLoadingUsers" class="users-loading-fidelity">
            <div v-for="i in 3" :key="i" class="user-item-skel mb-2">
              <div class="user-main-skel">
                <UISkeletonLoader width="100px" height="14px" border-radius="4px" class="mb-1" />
                <UISkeletonLoader width="160px" height="10px" border-radius="4px" />
              </div>
              <div class="user-usage-skel">
                <UISkeletonLoader width="40px" height="10px" border-radius="4px" />
                <UISkeletonLoader width="40px" height="10px" border-radius="4px" />
              </div>
            </div>
          </div>
          <div v-else-if="planUsers.length > 0" class="plan-users-list">
            <div v-for="user in planUsers" :key="user.email" class="user-item">
              <div class="user-main">
                <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                <span class="user-email">{{ user.email }}</span>
              </div>
              <div class="user-usage-info">
                <span
                  >OCR: <strong>{{ user.ocrRequestsThisMonth }}</strong></span
                >
                <span
                  >STT: <strong>{{ user.sttRequestsThisMonth }}</strong></span
                >
              </div>
            </div>
          </div>
          <div v-else class="empty-users">
            <p>{{ t.noUsersInPlan }}</p>
          </div>
        </div>
      </div>
    </UISidePanelShell>

    <!-- Plan Edit/Create Modal -->
    <UIPlanModal
      v-if="isModalOpen"
      :plan="modalPlan"
      :selected-language="selectedLanguage"
      @close="isModalOpen = false"
      @save="handleModalSave"
    />

    <!-- Plan Edit/Create Modal -->
    <UIPlanModal
      v-if="isModalOpen"
      :plan="modalPlan"
      :selected-language="selectedLanguage"
      @close="isModalOpen = false"
      @save="handleModalSave"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { PropType } from 'vue'
import { adminPlansService } from '@/services/api/adminPlans/adminPlans.service'
import type {
  AdminPlan,
  AdminUsageSummary as IUsageSummary,
  AdminUserUsage,
} from '@/services/api/adminPlans/adminPlans.models'
import AdminUsageSummary from './AdminUsageSummary.vue'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import UISidePanelShell from '@/components/UISidePanelShell.vue'
import UIPlanModal from './UIPlanModal.vue'
import {
  faPlus,
  faRotateRight,
  faPenToSquare,
  faTrashCan,
  faBoxOpen,
  faSpinner,
  faCheck,
  faXmark,
  faChevronRight,
  faBan,
} from '@fortawesome/free-solid-svg-icons'
import { useToast } from '@/stores/useToast'
import { useConfirm } from '@/stores/useConfirm'

export default defineComponent({
  name: 'AdminPlansManagement',
  components: {
    AdminUsageSummary,
    UISkeletonLoader,
    UISidePanelShell,
    UIPlanModal,
  },
  props: {
    selectedLanguage: {
      type: String as PropType<'English' | 'Turkish'>,
      default: 'English',
    },
  },
  setup(props) {
    const plans = ref<AdminPlan[]>([])
    const usageSummary = ref<IUsageSummary | null>(null)
    const isLoadingPlans = ref(true)
    const isLoadingSummary = ref(true)

    // Panel/Modal State
    const isPanelOpen = ref(false)
    const selectedPlan = ref<AdminPlan | null>(null)
    const isModalOpen = ref(false)
    const modalPlan = ref<AdminPlan | null>(null)

    // Plan Users state
    const planUsers = ref<AdminUserUsage[]>([])
    const isLoadingUsers = ref(false)
    const assignEmail = ref('')
    const isAssigning = ref(false)

    // Delete state
    const isDeleting = ref(false)

    const toast = useToast()
    const confirm = useConfirm()

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        createNewPlan: isTr ? 'Yeni Plan Oluştur' : 'Create New Plan',
        allPlans: isTr ? 'Tüm Planlar' : 'All Plans',
        planName: isTr ? 'Plan Adı' : 'Plan Name',
        price: isTr ? 'Fiyat' : 'Price',
        limits: isTr ? 'Limitler' : 'Limits',
        status: isTr ? 'Durum' : 'Status',
        actions: isTr ? 'İşlemler' : 'Actions',
        active: isTr ? 'Aktif' : 'Active',
        inactive: isTr ? 'İnaktif' : 'Inactive',
        edit: isTr ? 'Düzenle' : 'Edit',
        delete: isTr ? 'İnaktif Yap' : 'Deactivate',
        cancel: isTr ? 'İptal' : 'Cancel',
        noPlansFound: isTr ? 'Henüz hiç plan oluşturulmamış.' : 'No plans found yet.',
        confirmDeleteTitle: isTr ? 'Planı İnaktif Yap?' : 'Deactivate Plan?',
        confirmDeleteText: isTr
          ? 'Bu planı inaktif yapmak istediğinizden emin misiniz? Plan sistemde kalacak ancak yeni kullanıcılar tarafından seçilemeyecektir.'
          : "Are you sure you want to deactivate this plan? It will remain in the system but won't be available for new users.",
        deleting: isTr ? 'İşleniyor...' : 'Processing...',
        planUsers: isTr ? 'Plandaki Kullanıcılar' : 'Users in Plan',
        assignUser: isTr ? 'Kullanıcı Ata' : 'Assign User',
        userEmailPlaceholder: isTr ? 'Kullanıcı e-posta adresi' : 'User email address',
        assign: isTr ? 'Ata' : 'Assign',
        noUsersInPlan: isTr ? 'Bu plana ait kullanıcı bulunamadı.' : 'No users found in this plan.',
      }
    })

    const fetchPlans = async () => {
      isLoadingPlans.value = true
      try {
        plans.value = await adminPlansService.getPlans(true)
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      } finally {
        isLoadingPlans.value = false
      }
    }

    const fetchSummary = async () => {
      isLoadingSummary.value = true
      try {
        usageSummary.value = await adminPlansService.getUsageSummary()
      } catch (error) {
        console.error('Failed to fetch usage summary:', error)
      } finally {
        isLoadingSummary.value = false
      }
    }

    const fetchPlanUsers = async () => {
      if (!selectedPlan.value) return
      isLoadingUsers.value = true
      try {
        planUsers.value = await adminPlansService.getPlanUsers(selectedPlan.value.id)
      } catch (error) {
        console.error('Failed to fetch plan users:', error)
      } finally {
        isLoadingUsers.value = false
      }
    }

    const openAssignmentPanel = (plan: AdminPlan) => {
      selectedPlan.value = plan
      isPanelOpen.value = true
      planUsers.value = []
      assignEmail.value = ''
      fetchPlanUsers()
    }

    const openCreateModal = () => {
      modalPlan.value = null
      isModalOpen.value = true
    }

    const openEditModal = (plan: AdminPlan) => {
      modalPlan.value = plan
      isModalOpen.value = true
    }

    const handleModalSave = () => {
      isModalOpen.value = false
      fetchPlans()
      fetchSummary()
    }

    const closePanel = () => {
      isPanelOpen.value = false
      selectedPlan.value = null
    }

    const confirmDelete = async (plan: AdminPlan) => {
      const confirmed = await confirm.ask({
        title: t.value.confirmDeleteTitle,
        message: t.value.confirmDeleteText,
        confirmText: t.value.delete,
        type: 'danger'
      })

      if (confirmed) {
        isDeleting.value = true
        try {
          await adminPlansService.deletePlan(plan.id)
          toast.success('Plan deactivated successfully')
          await fetchPlans()
          await fetchSummary()
        } catch (error) {
          toast.error('Failed to deactivate plan')
          console.error('Failed to delete plan:', error)
        } finally {
          isDeleting.value = false
        }
      }
    }

    const handleAssignPlan = async () => {
      if (!selectedPlan.value || !assignEmail.value) return
      isAssigning.value = true
      try {
        await adminPlansService.assignPlanToUser({
          email: assignEmail.value,
          planId: selectedPlan.value.id,
        })
        assignEmail.value = ''
        toast.success('Plan assigned to user successfully')
        await fetchPlanUsers()
        await fetchSummary()
      } catch (error) {
        toast.error('Failed to assign plan')
        console.error('Failed to assign plan:', error)
      } finally {
        isAssigning.value = false
      }
    }

    const handleGlobalRefetch = () => {
      fetchPlans()
      fetchSummary()
    }

    onMounted(() => {
      fetchPlans()
      fetchSummary()
      window.addEventListener('app:refetch', handleGlobalRefetch)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:refetch', handleGlobalRefetch)
    })

    return {
      t,
      plans,
      usageSummary,
      isLoadingPlans,
      isLoadingSummary,
      isPanelOpen,
      selectedPlan,
      isModalOpen,
      modalPlan,
      isDeleting,
      planUsers,
      isLoadingUsers,
      assignEmail,
      isAssigning,
      openCreateModal,
      openEditModal,
      handleModalSave,
      openAssignmentPanel,
      closePanel,
      confirmDelete,
      handleAssignPlan,
      fetchPlanUsers,
      fetchPlans,
      faPlus,
      faRotateRight,
      faPenToSquare,
      faTrashCan,
      faBoxOpen,
      faSpinner,
      faCheck,
      faXmark,
      faChevronRight,
      faBan,
    }
  },
})
</script>

<style scoped lang="scss">
.admin-plans-management {
  display: flex;
  flex-direction: column;
  padding: 0;
  gap: 1.5rem;
  animation: fadeIn 0.4s ease-out;
}

.skeleton-grid-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.summary-loading-fidelity {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skel-kpi-card {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--background-color);
}

.skel-breakdown {
  padding: 28px;
  background: var(--background-color);
  
  .skel-table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-color);
    &:last-child { border-bottom: none; }
  }
}

.table-loading-fidelity {
  display: flex;
  flex-direction: column;
  padding-top: 8px;
}

.skeleton-row-fidelity {
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr 0.8fr 40px;
  align-items: center;
  padding: 18px 0;
  gap: 24px;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }

  .skel-cell {
    display: flex;
    flex-direction: column;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.premium-button {
  background: var(--primary-green-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none;

  &:hover {
    filter: brightness(1.05);
  }
}

.section-card {
  padding: 24px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
      color: var(--header-text-color);
    }
  }
}

.glass-card {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.table-wrap {
  overflow-x: auto;
}

.plans-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;

  th {
    padding: 12px 16px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--normal-text-color);
    letter-spacing: 0.05em;
    text-align: left;
  }

  .plan-row {
    background: var(--background-color-soft);
    cursor: pointer;
    transition: all 0.2s ease;

    td {
      padding: 16px;
      &:first-child {
        border-top-left-radius: 12px;
        border-bottom-left-radius: 12px;
      }
      &:last-child {
        border-top-right-radius: 12px;
        border-bottom-right-radius: 12px;
      }
    }

    &:hover {
      background: var(--hover-color);
    }
  }

  @media (max-width: 768px) {
    thead {
      display: none;
    }

    .plan-row {
      display: block;
      margin-bottom: 12px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border-color);

      td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px !important;
        border-bottom: 1px solid var(--border-color);
        text-align: right;

        &:last-child {
          border-bottom: none;
        }

        &.chevron-cell {
          display: none;
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
}

.plan-info {
  display: flex;
  flex-direction: column;
  .plan-name {
    font-weight: 600;
    font-size: 15px;
    color: var(--primary-green-color);
  }
  .plan-id {
    font-size: 11px;
    color: var(--normal-text-color);
    opacity: 0.6;
  }
}

.price-wrap {
  display: flex;
  align-items: baseline;
  gap: 2px;
  .amount {
    font-weight: 700;
    font-size: 18px;
  }
  .currency {
    font-size: 12px;
    font-weight: 600;
  }
  .period {
    font-size: 12px;
    color: var(--normal-text-color);
  }
}

.limits-cell {
  .limit-item {
    display: flex;
    gap: 8px;
    font-size: 13px;
    .limit-label {
      color: var(--normal-text-color);
    }
    .limit-value {
      font-weight: 600;
    }
  }
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;

  &.active {
    background: rgba(16, 185, 129, 0.1);
    color: var(--primary-green-color);
  }
  &.inactive {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--background-color);
  color: var(--normal-text-color);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--background-color-soft);
    color: var(--primary-green-color);
    border-color: var(--primary-green-color);
  }

  &.delete:hover {
    color: #ef4444;
    border-color: #ef4444;
  }
}

.text-right {
  text-align: right;
}

.row-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.chevron-cell {
  text-align: center;
  padding-right: 12px !important;
  color: var(--normal-text-color);
  opacity: 0.3;
  transition: all 0.2s;
}

.plan-row:hover .row-chevron {
  opacity: 1;
  color: var(--primary-green-color);
  transform: translateX(3px);
}

.row-chevron {
  font-size: 12px;
  transition: all 0.3s ease;
}

/* Side Panel Content */
.panel-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;

  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--normal-text-color);
    letter-spacing: 0.05em;
  }
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assign-row {
  display: flex;
  gap: 12px;

  input {
    flex: 1;
    padding: 10px 16px;
    background: var(--background-color-soft);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--header-text-color);
    font-size: 14px;
    &:focus {
      outline: none;
      border-color: var(--primary-green-color);
    }
  }
}

.apply-btn {
  background: var(--primary-green-color);
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }
  &:disabled {
    opacity: 0.5;
  }
}

.plan-users-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-item {
  padding: 14px;
  background: var(--background-color-soft);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-main {
  display: flex;
  flex-direction: column;
  .user-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--header-text-color);
  }
  .user-email {
    font-size: 12px;
    color: var(--normal-text-color);
    opacity: 0.7;
  }
}

.user-usage-info {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: var(--normal-text-color);
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
  span {
    display: flex;
    gap: 4px;
  }
  strong {
    color: var(--header-text-color);
  }
}

.users-loading-fidelity {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-item-skel {
  padding: 14px;
  background: var(--background-color-soft);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 10px;

  .user-main-skel {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-usage-skel {
    display: flex;
    gap: 16px;
    padding-top: 8px;
    border-top: 1px solid var(--border-color);
  }
}

.empty-users {
  padding: 40px 0;
  text-align: center;
  color: var(--normal-text-color);
  opacity: 0.6;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-modal {
  width: 90%;
  max-width: 400px;
  padding: 32px;
  text-align: center;
  background: var(--background-color);
  border-radius: 20px;
  h3 {
    margin-top: 0;
  }
  p {
    margin-bottom: 32px;
    color: var(--normal-text-color);
  }
}

.confirm-actions {
  display: flex;
  gap: 12px;
  button {
    flex: 1;
    height: 44px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
  }
}

.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  &:hover {
    filter: brightness(1.1);
  }
}

.cancel-btn {
  background: var(--background-color-soft);
  border: 1px solid var(--border-color);
  color: var(--header-text-color);
}

.refresh-small-btn {
  background: none;
  border: none;
  color: var(--normal-text-color);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  &:hover {
    background: var(--hover-color);
    color: var(--primary-green-color);
  }
}

.mb-8 {
  margin-bottom: 2rem;
}
.mb-3 {
  margin-bottom: 0.75rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}
.flex-1 {
  flex: 1;
}
</style>

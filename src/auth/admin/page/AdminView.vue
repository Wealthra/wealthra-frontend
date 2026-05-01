<template>
  <div class="admin-view-content">
    <div v-if="isLoading" class="admin-loading-skeleton">
      <div class="skeleton-section" v-for="i in 3" :key="i">
        <UISkeletonLoader width="250px" height="32px" style="margin-bottom: 24px" />
        <UISkeletonLoader height="300px" border-radius="16px" />
      </div>
    </div>
    
    <template v-else>
      <div class="tab-content">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="tab-pane overview-pane">
          <section id="usage-summary" class="admin-section full-height">

            <AdminUsageSummary 
              v-if="usageSummary"
              :summary="usageSummary" 
              :selectedLanguage="selectedLanguage"
            />
          </section>
        </div>

        <!-- Users & Plans Tab -->
        <div v-if="activeTab === 'users'" class="tab-pane">
          <section id="users" class="admin-section">
            <div class="section-header">
              <h2>{{ t.usageSummary }}</h2>
            </div>
            <div class="glass-card">
              <AdminUserManagementTable 
                :selectedLanguage="selectedLanguage"
                :plans="plans"
              />
            </div>
          </section>
          <section id="plans" class="admin-section mt-8">
            <div class="section-header">
              <h2>{{ t.plans }}</h2>
              <button class="add-btn" @click="openPlanModal()">
                <font-awesome-icon icon="plus" />
                {{ t.addNewPlan }}
              </button>
            </div>
            <div class="glass-card">
              <AdminPlanTable 
                :plans="plans" 
                :selectedLanguage="selectedLanguage"
                @edit="openPlanModal"
                @delete="handleDeletePlan"
              />
            </div>
          </section>
        </div>

        <!-- Support & Ops Tab -->
        <div v-if="activeTab === 'support'" class="tab-pane">
          <section class="admin-section">
            <div class="section-header">
              <h2>Support Tickets</h2>
            </div>
            <div class="glass-card">
              <AdminSupportTickets />
            </div>
          </section>
          <section class="admin-section mt-8">
            <div class="section-header">
              <h2>Announcements</h2>
            </div>
            <div class="glass-card">
              <AdminAnnouncements />
            </div>
          </section>
          <section class="admin-section mt-8">
            <div class="section-header">
              <h2>FX Controls</h2>
            </div>
            <div class="glass-card">
              <AdminFxControls />
            </div>
          </section>
        </div>

        <!-- System & Security Tab -->
        <div v-if="activeTab === 'system'" class="tab-pane">
          <section class="admin-section">
            <div class="section-header">
              <h2>AI Settings</h2>
            </div>
            <AdminAiSettings />
          </section>
          <section class="admin-section mt-8">
            <div class="section-header">
              <h2>Security (Blocked IPs)</h2>
            </div>
            <AdminSecurity />
          </section>
          <section class="admin-section mt-8">
            <div class="section-header">
              <h2>Error Logs</h2>
            </div>
            <div class="glass-card">
              <AdminErrorLogs :selectedLanguage="selectedLanguage" />
            </div>
          </section>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="tab-pane">
          <SettingsView :selectedLanguage="selectedLanguage" :hide-usage-section="true" />
        </div>
      </div>
    </template>

    <UIPlanModal 
      v-if="isPlanModalOpen" 
      :plan="selectedPlan" 
      :selectedLanguage="selectedLanguage"
      @close="closePlanModal"
      @save="handleSavePlan"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="planToDelete !== null" class="modal-overlay" @click.self="planToDelete = null">
      <div class="modal-content glass-card delete-confirm-modal">
        <div class="modal-header">
          <h3>{{ t.confirmDeleteTitle }}</h3>
          <button class="close-btn" @click="planToDelete = null">
            <font-awesome-icon icon="xmark" />
          </button>
        </div>
        <div class="modal-body">
          <p>{{ t.confirmDeleteMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="planToDelete = null">{{ t.cancel }}</button>
          <button class="confirm-delete-btn" @click="confirmDeletePlan" :disabled="isDeleting">
            <font-awesome-icon v-if="isDeleting" icon="spinner" spin />
            {{ isDeleting ? t.deleting : t.delete }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { adminPlansService } from '@/services/api/adminPlans/adminPlans.service'
import type { AdminPlan, AdminUsageSummary as IUsageSummary } from '@/services/api/adminPlans/adminPlans.models'
import { clearAuth } from '@/utils/auth'

import AdminPlanTable from '../components/AdminPlanTable.vue'
import AdminUserAssignment from '../components/AdminUserAssignment.vue'
import AdminUsageSummary from '../components/AdminUsageSummary.vue'
import UIPlanModal from '../components/UIPlanModal.vue'
import AdminUserManagementTable from '../components/AdminUserManagementTable.vue'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

import AdminSupportTickets from '../components/AdminSupportTickets.vue'
import AdminAnnouncements from '../components/AdminAnnouncements.vue'
import AdminFxControls from '../components/AdminFxControls.vue'
import AdminAiSettings from '../components/AdminAiSettings.vue'
import AdminSecurity from '../components/AdminSecurity.vue'
import AdminErrorLogs from '../components/AdminErrorLogs.vue'
import SettingsView from '@/modules/settings/page/SettingsView.vue'

export default defineComponent({
  name: 'AdminView',
  components: {
    AdminPlanTable,
    AdminUserAssignment,
    AdminUsageSummary,
    UIPlanModal,
    AdminUserManagementTable,
    UISkeletonLoader,
    AdminSupportTickets,
    AdminAnnouncements,
    AdminFxControls,
    AdminAiSettings,
    AdminSecurity,
    AdminErrorLogs,
    SettingsView
  },
  setup() {
    const router = useRouter()
    type Language = 'English' | 'Turkish'
    const selectedLanguage = ref<Language>(
      (localStorage.getItem('selectedLanguage') as Language) || 'English'
    )
    
    const plans = ref<AdminPlan[]>([])
    const usageSummary = ref<IUsageSummary | null>(null)
    const isLoading = ref(true)
    const activeTab = ref(router.currentRoute.value.query.tab?.toString() || 'overview')
    
    // Watch for query parameter changes to update active tab
    const route = router.currentRoute
    watch(() => route.value.query.tab, (newTab) => {
      if (newTab) {
        activeTab.value = newTab.toString()
      }
    })
    
    const isPlanModalOpen = ref(false)
    const selectedPlan = ref<AdminPlan | null>(null)
    const planToDelete = ref<number | null>(null)
    const isDeleting = ref(false)

    const t = computed<Record<string, string>>(() => {
      const isTr = selectedLanguage.value === 'Turkish'
      return {
        overviewTab: isTr ? 'Özet' : 'Overview',
        usersTab: isTr ? 'Kullanıcılar ve Rapor' : 'Users & Reports',
        supportTab: isTr ? 'Destek & Ops' : 'Support & Ops',
        systemTab: isTr ? 'Sistem & Güvenlik' : 'System & Security',
        settingsTab: isTr ? 'Ayarlar' : 'Settings',
        plans: isTr ? 'Abonelik Planları' : 'Subscription Plans',
        assignments: isTr ? 'Plan Atamaları' : 'Plan Assignments',
        usageSummary: isTr ? 'Kullanım Tablosu' : 'Usage Tables',
        addNewPlan: isTr ? 'Yeni Plan Ekle' : 'Add New Plan',
        logout: isTr ? 'Çıkış Yap' : 'Logout',
        confirmDeleteTitle: isTr ? 'Silme Onayı' : 'Confirm Delete',
        confirmDeleteMessage: isTr ? 'Bu planı silmek istediğinizden emin misiniz?' : 'Are you sure you want to delete this plan?',
        cancel: isTr ? 'İptal' : 'Cancel',
        delete: isTr ? 'Sil' : 'Delete',
        deleting: isTr ? 'Siliniyor...' : 'Deleting...'
      }
    })

    const tabs = computed(() => [
      { id: 'overview', name: t.value.overviewTab, icon: 'chart-pie' },
      { id: 'users', name: t.value.usersTab, icon: 'users' },
      { id: 'support', name: t.value.supportTab, icon: 'headset' },
      { id: 'system', name: t.value.systemTab, icon: 'shield-halved' },
      { id: 'settings', name: t.value.settingsTab, icon: 'gear' },
    ])

    const handleLogout = async () => {
      const { logout } = await import('@/utils/auth')
      await logout()
      router.push('/login')
    }

    const fetchData = async () => {
      isLoading.value = true
      try {
        const [plansRes, usageRes] = await Promise.all([
          adminPlansService.getPlans(true), // Include inactive for admin management
          adminPlansService.getUsageSummary()
        ])
        plans.value = plansRes
        usageSummary.value = usageRes
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        isLoading.value = false
      }
    }

    const openPlanModal = (plan?: AdminPlan) => {
      selectedPlan.value = plan || null
      isPlanModalOpen.value = true
    }

    const closePlanModal = () => {
      isPlanModalOpen.value = false
      selectedPlan.value = null
    }

    const handleSavePlan = async () => {
      await fetchData()
      closePlanModal()
    }

    const handleDeletePlan = (id: number) => {
      planToDelete.value = id
    }

    const confirmDeletePlan = async () => {
      if (planToDelete.value === null) return
      isDeleting.value = true
      try {
        await adminPlansService.deletePlan(planToDelete.value)
        await fetchData()
        planToDelete.value = null
      } catch (error) {
        console.error('Error deleting plan:', error)
      } finally {
        isDeleting.value = false
      }
    }

    onMounted(() => {
      fetchData()
    })

    return {
      selectedLanguage,
      plans,
      usageSummary,
      isLoading,
      activeTab,
      tabs,
      isPlanModalOpen,
      selectedPlan,
      planToDelete,
      isDeleting,
      t,
      handleLogout,
      openPlanModal,
      closePlanModal,
      handleSavePlan,
      handleDeletePlan,
      confirmDeletePlan,
      fetchData
    }
  }
})
</script>

<style scoped lang="scss">
.admin-view-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--normal-text-color);
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px 8px 0 0;

  &:hover {
    color: var(--header-text-color);
    background: var(--background-color-soft);
  }

  &.active {
    color: var(--primary-green-color);
    border-bottom-color: var(--primary-green-color);
  }

  .tab-icon {
    font-size: 16px;
  }
}

.tab-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  animation: fadeIn 0.3s ease-in-out;

  &.overview-pane {
    height: 100%;
  }
}

.admin-section.full-height {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.mt-8 {
  margin-top: 2rem;
}

.admin-loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.admin-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      color: var(--header-text-color);
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      background: var(--primary-green-color);
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.05);
      }
    }
  }
}

.glass-card {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Modal Overlay & Base styles (consistent with other modals) */
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
  max-width: 450px;
  background: var(--background-color);
  overflow: hidden;
  border-radius: 16px;
}

.modal-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }

  .close-btn {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--normal-text-color);
    padding: 4px;
    
    &:hover {
      color: var(--header-text-color);
    }
  }
}

.modal-body {
  padding: 24px;
  p {
    margin: 0;
    color: var(--normal-text-color);
    line-height: 1.5;
  }
}

.modal-footer {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: var(--background-color-soft);
  border-top: 1px solid var(--border-color);

  button {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cancel-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--header-text-color);
    
    &:hover {
      background: var(--background-color);
    }
  }

  .confirm-delete-btn {
    background: #ef4444;
    border: none;
    color: white;
    
    &:hover:not(:disabled) {
      background: #dc2626;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>


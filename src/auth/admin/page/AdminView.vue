<template>
  <div class="admin-view-content">
    <div v-if="isLoading" class="admin-loading-skeleton">
      <div class="skeleton-section" v-for="i in 3" :key="i">
        <UISkeletonLoader width="250px" height="32px" style="margin-bottom: 24px" />
        <UISkeletonLoader height="300px" border-radius="16px" />
      </div>
    </div>
    
    <template v-else>
      <div class="admin-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <font-awesome-icon v-if="tab.icon" :icon="tab.icon" class="tab-icon" />
          {{ tab.name }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="tab-pane">
          <section id="usage-summary" class="admin-section">
            <div class="section-header">
              <h2>{{ t.usageSummary }}</h2>
            </div>
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
              <h2>{{ t.userManagement }}</h2>
            </div>
            <div class="glass-card">
              <AdminUserManagementTable 
                :selectedLanguage="selectedLanguage"
                :plans="plans"
              />
            </div>
          </section>

          <section id="assignments" class="admin-section mt-8">
            <div class="section-header">
              <h2>{{ t.assignments }}</h2>
            </div>
            <div class="glass-card">
              <AdminUserAssignment 
                :plans="plans" 
                :selectedLanguage="selectedLanguage"
                @assigned="fetchData"
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
      </div>
    </template>

    <!-- Plan Modal (for Create/Edit) -->
    <UIPlanModal 
      v-if="isPlanModalOpen" 
      :plan="selectedPlan" 
      :selectedLanguage="selectedLanguage"
      @close="closePlanModal"
      @save="handleSavePlan"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue'
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
    AdminErrorLogs
  },
  setup() {
    const router = useRouter()
    const selectedLanguage = ref(localStorage.getItem('selectedLanguage') || 'English')
    
    const plans = ref<AdminPlan[]>([])
    const usageSummary = ref<IUsageSummary | null>(null)
    const isLoading = ref(true)
    const activeTab = ref('overview')
    
    const isPlanModalOpen = ref(false)
    const selectedPlan = ref<AdminPlan | null>(null)

    const t = computed<Record<string, string>>(() => {
      const isTr = selectedLanguage.value === 'Turkish'
      return {
        overviewTab: isTr ? 'Özet' : 'Overview',
        usersTab: isTr ? 'Kullanıcılar & Planlar' : 'Users & Plans',
        supportTab: isTr ? 'Destek & Ops' : 'Support & Ops',
        systemTab: isTr ? 'Sistem & Güvenlik' : 'System & Security',
        plans: isTr ? 'Abonelik Planları' : 'Subscription Plans',
        assignments: isTr ? 'Plan Atamaları' : 'Plan Assignments',
        usageSummary: isTr ? 'Kullanım Özeti' : 'Usage Summary',
        userManagement: isTr ? 'Kullanıcı Yönetimi' : 'User Management',
        addNewPlan: isTr ? 'Yeni Plan Ekle' : 'Add New Plan',
        logout: isTr ? 'Çıkış Yap' : 'Logout'
      }
    })

    const tabs = computed(() => [
      { id: 'overview', name: t.value.overviewTab, icon: 'chart-pie' },
      { id: 'users', name: t.value.usersTab, icon: 'users' },
      { id: 'support', name: t.value.supportTab, icon: 'headset' },
      { id: 'system', name: t.value.systemTab, icon: 'shield-halved' },
    ])

    const handleLogout = () => {
      clearAuth()
      router.push('/')
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

    const handleDeletePlan = async (id: number) => {
      if (confirm('Are you sure you want to delete this plan?')) {
        await adminPlansService.deletePlan(id)
        await fetchData()
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
      t,
      handleLogout,
      openPlanModal,
      closePlanModal,
      handleSavePlan,
      handleDeletePlan,
      fetchData
    }
  }
})
</script>

<style scoped lang="scss">
.admin-view-content {
  width: 100%;
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

.tab-pane {
  animation: fadeIn 0.3s ease-in-out;
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
</style>


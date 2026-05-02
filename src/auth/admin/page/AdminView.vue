<template>
  <div class="admin-view-content">
    <div class="tab-content">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-pane overview-pane">
        <div v-if="isLoading" class="admin-loading-skeleton w-full">
          <div class="kpi-grid">
            <UISkeletonLoader v-for="i in 4" :key="'kpi-' + i" height="120px" border-radius="16px" />
          </div>
          <div class="dashboard-grid mt-8">
            <div class="col-span-12">
              <UISkeletonLoader height="400px" border-radius="16px" />
            </div>
          </div>
        </div>
        <section v-else id="usage-summary" class="admin-section full-height">
          <AdminUsageSummary
            v-if="usageSummary"
            :summary="usageSummary"
            :selectedLanguage="selectedLanguage"
          />
        </section>
      </div>

        <!-- User Management Tab -->
        <div v-if="activeTab === 'users'" class="tab-pane">
          <section id="users" class="admin-section flex-column-fill">
            <AdminUserManagement :selectedLanguage="selectedLanguage" />
          </section>
        </div>

        <!-- Plans & Subscriptions Tab -->
        <div v-if="activeTab === 'plans'" class="tab-pane">
          <section id="plans" class="admin-section flex-column-fill">
            <AdminPlansManagement :selectedLanguage="selectedLanguage" />
          </section>
        </div>

        <!-- Support Tab -->
        <div v-if="activeTab === 'support'" class="tab-pane">
          <section class="admin-section flex-column-fill">
            <AdminSupportTickets :selectedLanguage="selectedLanguage" />
          </section>
        </div>

        <!-- Operations Tab -->
        <div v-if="activeTab === 'operations'" class="tab-pane">
          <section class="admin-section flex-column-fill">
            <AdminOperations :selectedLanguage="selectedLanguage" />
          </section>
        </div>

        <!-- Security & Monitoring Tab -->
        <div v-if="activeTab === 'security'" class="tab-pane">
          <section class="admin-section flex-column-fill">
            <AdminSecurityMonitoring :selectedLanguage="selectedLanguage" />
          </section>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="tab-pane">
          <SettingsView :selectedLanguage="selectedLanguage" :hide-usage-section="true" />
        </div>
      </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminPlansService } from '@/services/api/adminPlans/adminPlans.service'
import type { AdminUsageSummary as IUsageSummary } from '@/services/api/adminPlans/adminPlans.models'

import AdminUsageSummary from '../components/AdminUsageSummary.vue'
import AdminUserManagement from '../components/AdminUserManagement.vue'
import AdminPlansManagement from '../components/AdminPlansManagement.vue'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

import AdminSupportTickets from '../components/AdminSupportTickets.vue'
import AdminOperations from '../components/AdminOperations.vue'
import AdminSecurityMonitoring from '../components/AdminSecurityMonitoring.vue'
import SettingsView from '@/modules/settings/page/SettingsView.vue'

export default defineComponent({
  name: 'AdminView',
  components: {
    AdminUsageSummary,
    AdminUserManagement,
    AdminPlansManagement,
    UISkeletonLoader,
    AdminSupportTickets,
    AdminOperations,
    AdminSecurityMonitoring,
    SettingsView,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const ROUTE_TO_TAB: Record<string, 'overview' | 'users' | 'plans' | 'support' | 'operations' | 'security' | 'settings'> = {
      'admin-overview': 'overview',
      'admin-users': 'users',
      'admin-plans': 'plans',
      'admin-support': 'support',
      'admin-operations': 'operations',
      'admin-security': 'security',
      'admin-settings': 'settings',
    }

    const activeTab = computed(() => ROUTE_TO_TAB[route.name as string] ?? 'overview')
    type Language = 'English' | 'Turkish'
    const selectedLanguage = ref<Language>(
      (localStorage.getItem('selectedLanguage') as Language) || 'English'
    )

    const usageSummary = ref<IUsageSummary | null>(null)
    const isLoading = ref(true)

    const t = computed<Record<string, string>>(() => {
      const isTr = selectedLanguage.value === 'Turkish'
      return {
        overviewTab: isTr ? 'Özet' : 'Overview',
        usersTab: isTr ? 'Kullanıcı Yönetimi' : 'User Management',
        plansTab: isTr ? 'Planlar & Abonelikler' : 'Plans & Subscriptions',
        userManagement: isTr ? 'Kullanıcı Yönetimi' : 'User Management',
        supportTab: isTr ? 'Destek' : 'Support',
        operationsTab: isTr ? 'Operasyonlar' : 'Operations',
        securityTab: isTr ? 'Güvenlik ve İzleme' : 'Security & Monitoring',
        settingsTab: isTr ? 'Ayarlar' : 'Settings',
        usageSummary: isTr ? 'Kullanım Tablosu' : 'Usage Tables',
      }
    })

    const fetchUsageData = async (force = false) => {
      if (usageSummary.value && !force) return
      isLoading.value = true
      try {
        usageSummary.value = await adminPlansService.getUsageSummary()
      } catch (error) {
        console.error('Error fetching admin usage summary:', error)
      } finally {
        isLoading.value = false
      }
    }

    const handleGlobalRefetch = () => {
      fetchUsageData(true)
    }

    onMounted(() => {
      window.addEventListener('app:refetch', handleGlobalRefetch)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:refetch', handleGlobalRefetch)
    })

    // Watch for tab changes to fetch data if needed
    watch(
      activeTab,
      newTab => {
        if (newTab === 'overview') {
          fetchUsageData()
        } else {
          // For other tabs (support, settings, users), we don't need global data
          isLoading.value = false
        }
      },
      { immediate: true }
    )

    return {
      selectedLanguage,
      usageSummary,
      isLoading,
      activeTab,
      t,
    }
  },
})
</script>

<style scoped lang="scss">
.admin-view-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.tab-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.tab-pane {
  display: flex;
  flex: 1;
  min-height: 0;

  &.overview-pane {
    display: flex;
    height: 100%;
  }
}

.admin-section.full-height,
.admin-section.flex-column-fill {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.mt-8 {
  margin-top: 2rem;
}

.admin-loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 48px;
  &.w-full { width: 100%; }
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
  }
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  width: 100%;
  align-items: stretch;
}

.col-span-12 {
  grid-column: span 12;
}

.full-height {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.glass-card {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  &.full-height {
    padding: 0; // Remove padding when full-height to maximize table area
  }
}
</style>

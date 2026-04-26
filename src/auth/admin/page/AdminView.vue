<template>
  <div class="admin-view-content">
    <div v-if="isLoading" class="admin-loading-skeleton">
      <div class="skeleton-section" v-for="i in 3" :key="i">
        <UISkeletonLoader width="250px" height="32px" style="margin-bottom: 24px" />
        <UISkeletonLoader height="300px" border-radius="16px" />
      </div>
    </div>
    
    <template v-else>
      <!-- Usage Summary Section -->
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

      <!-- Plans Section -->
      <section id="plans" class="admin-section">
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

      <!-- Assignments Section -->
      <section id="assignments" class="admin-section">
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

      <!-- User Management Section -->
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

import UILanguageButton from '@/components/UILanguageButton.vue'
import UIThemeButton from '@/components/UIThemeButton.vue'
import AdminPlanTable from '../components/AdminPlanTable.vue'
import AdminUserAssignment from '../components/AdminUserAssignment.vue'
import AdminUsageSummary from '../components/AdminUsageSummary.vue'
import UIPlanModal from '../components/UIPlanModal.vue'
import AdminUserManagementTable from '../components/AdminUserManagementTable.vue'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

export default defineComponent({
  name: 'AdminView',
  components: {
    UILanguageButton,
    UIThemeButton,
    AdminPlanTable,
    AdminUserAssignment,
    AdminUsageSummary,
    UIPlanModal,
    AdminUserManagementTable,
    UISkeletonLoader
  },
  setup() {
    const router = useRouter()
    const selectedLanguage = ref(localStorage.getItem('selectedLanguage') || 'English')
    
    const plans = ref<AdminPlan[]>([])
    const usageSummary = ref<IUsageSummary | null>(null)
    const isLoading = ref(true)
    
    const isPlanModalOpen = ref(false)
    const selectedPlan = ref<AdminPlan | null>(null)

    const t = computed<Record<string, string>>(() => {
      const isTr = selectedLanguage.value === 'Turkish'
      return {
        plans: isTr ? 'Abonelik Planları' : 'Subscription Plans',
        assignments: isTr ? 'Plan Atamaları' : 'Plan Assignments',
        usageSummary: isTr ? 'Kullanım Özeti' : 'Usage Summary',
        userManagement: isTr ? 'Kullanıcı Yönetimi' : 'User Management',
        addNewPlan: isTr ? 'Yeni Plan Ekle' : 'Add New Plan',
        logout: isTr ? 'Çıkış Yap' : 'Logout'
      }
    })

    const handleLanguageUpdate = (lang: string) => {
      selectedLanguage.value = lang
    }

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
      isPlanModalOpen,
      selectedPlan,
      t,
      handleLanguageUpdate,
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
.admin-view {
  min-height: 100vh;
  background-color: var(--background-color-soft);
  color: var(--header-text-color);
  font-family: var(--main-font);
}

.admin-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  background: var(--background-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  .topbar-left {
    .admin-logo {
      height: 32px;
    }
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .logout-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--primary-red-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: var(--primary-red-color);
        color: white;
        border-color: var(--primary-red-color);
      }
    }
  }
}

.admin-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 48px;
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
      font-size: 24px;
      font-weight: 700;
      margin: 0;
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

@media (max-width: 768px) {
  .admin-topbar {
    padding: 0 20px;
  }

  .admin-content {
    padding: 80px 20px 20px;
  }
}
</style>

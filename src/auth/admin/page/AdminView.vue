<template>
  <div class="admin-view">
    <!-- Sticky Top Bar -->
    <div class="admin-topbar" :class="{ scrolled: isScrolled }">
      <div class="topbar-left">
        <img src="../../../icons/logo.svg" alt="Wealthra" class="admin-logo" />
      </div>
      <nav class="topbar-nav">
        <button 
          v-for="sec in sections" 
          :key="sec.id" 
          :class="{ active: activeSection === sec.id }"
          @click="scrollTo(sec.id)"
        >
          {{ t[sec.id] }}
        </button>
      </nav>
      <div class="topbar-right">
        <UILanguageButton @updateLanguage="handleLanguageUpdate" />
        <UIThemeButton />
        <button class="logout-btn" @click="handleLogout" :title="t.logout">
          <font-awesome-icon icon="right-from-bracket" />
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="admin-content">
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

      <!-- Usages Section -->
      <section id="usages" class="admin-section">
        <div class="section-header">
          <h2>{{ t.usages }}</h2>
        </div>
        <div class="glass-card">
          <AdminUsageSummary 
            :usages="usages" 
            :selectedLanguage="selectedLanguage"
          />
        </div>
      </section>
    </div>

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
import { defineComponent, onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { adminPlansService } from '@/services/api/adminPlans/adminPlans.service'
import type { AdminPlan, AdminUserUsageSummary } from '@/services/api/adminPlans/adminPlans.models'
import { clearAuth } from '@/utils/auth'

import UILanguageButton from '@/components/UILanguageButton.vue'
import UIThemeButton from '@/components/UIThemeButton.vue'
import AdminPlanTable from '../components/AdminPlanTable.vue'
import AdminUserAssignment from '../components/AdminUserAssignment.vue'
import AdminUsageSummary from '../components/AdminUsageSummary.vue'
import UIPlanModal from '../components/UIPlanModal.vue'

export default defineComponent({
  name: 'AdminView',
  components: {
    UILanguageButton,
    UIThemeButton,
    AdminPlanTable,
    AdminUserAssignment,
    AdminUsageSummary,
    UIPlanModal
  },
  setup() {
    const router = useRouter()
    const selectedLanguage = ref(localStorage.getItem('selectedLanguage') || 'English')
    const isScrolled = ref(false)
    const activeSection = ref('plans')
    
    const plans = ref<AdminPlan[]>([])
    const usages = ref<AdminUserUsageSummary[]>([])
    
    const isPlanModalOpen = ref(false)
    const selectedPlan = ref<AdminPlan | null>(null)

    const sections = [
      { id: 'plans', label: 'Plans' },
      { id: 'assignments', label: 'Assignments' },
      { id: 'usages', label: 'Usages' }
    ]

    const t = computed<Record<string, string>>(() => {
      const isTr = selectedLanguage.value === 'Turkish'
      return {
        plans: isTr ? 'Abonelik Planları' : 'Subscription Plans',
        assignments: isTr ? 'Plan Atamaları' : 'Plan Assignments',
        usages: isTr ? 'Kullanıcı Kullanımları' : 'User Usages',
        addNewPlan: isTr ? 'Yeni Plan Ekle' : 'Add New Plan',
        logout: isTr ? 'Çıkış Yap' : 'Logout'
      }
    })

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 20
      // Simple section detection
      for (const sec of sections) {
        const el = document.getElementById(sec.id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 150 && rect.bottom >= 150) {
            activeSection.value = sec.id
            break
          }
        }
      }
    }

    const scrollTo = (id: string) => {
      const el = document.getElementById(id)
      if (el) {
        window.scrollTo({
          top: el.offsetTop - 100,
          behavior: 'smooth'
        })
      }
    }

    const handleLanguageUpdate = (lang: string) => {
      selectedLanguage.value = lang
    }

    const handleLogout = () => {
      clearAuth()
      router.push('/')
    }

    const fetchData = async () => {
      try {
        const [plansRes, usagesRes] = await Promise.all([
          adminPlansService.getPlans(),
          adminPlansService.getUserUsages()
        ])
        plans.value = plansRes
        usages.value = usagesRes
      } catch (error) {
        console.error('Error fetching admin data:', error)
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
      window.addEventListener('scroll', handleScroll)
      fetchData()
    })

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    return {
      selectedLanguage,
      isScrolled,
      activeSection,
      sections,
      plans,
      usages,
      isPlanModalOpen,
      selectedPlan,
      t,
      scrollTo,
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
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  background: transparent;
  transition: all 0.3s;
  z-index: 1000;

  &.scrolled {
    height: 64px;
    background: var(--background-color);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .topbar-left {
    .admin-logo {
      height: 32px;
    }
  }

  .topbar-nav {
    display: flex;
    gap: 8px;
    background: var(--background-color-soft);
    padding: 6px;
    border-radius: 12px;
    border: 1px solid var(--border-color);

    button {
      padding: 8px 24px;
      border: none;
      background: transparent;
      color: var(--normal-text-color);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        color: var(--header-text-color);
      }

      &.active {
        background: var(--background-color);
        color: var(--primary-green-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
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
  padding: 120px 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 64px;
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
    
    .topbar-nav {
      display: none;
    }
  }

  .admin-content {
    padding: 100px 20px 20px;
  }
}
</style>

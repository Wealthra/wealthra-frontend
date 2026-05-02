<template>
  <ModuleLayout
    :selectedLanguage="selectedLanguage"
    :selectedPage="selectedPage"
    @update-language="handleLanguageUpdate"
  >
    <RouterView v-slot="{ Component }">
      <component :is="Component" :selectedLanguage="selectedLanguage" />
    </RouterView>
  </ModuleLayout>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ModuleLayout from '@/layouts/ModuleLayout.vue'

type Language = 'English' | 'Turkish'

const ROUTE_NAME_TO_PAGE: Record<string, { en: string; tr: string }> = {
  dashboard: { en: 'Dashboard', tr: 'Kontrol Paneli' },
  income: { en: 'Income', tr: 'Gelir' },
  expenses: { en: 'Expenses', tr: 'Giderler' },
  budget: { en: 'Budget', tr: 'Bütçe' },
  goals: { en: 'Goals', tr: 'Hedefler' },
  settings: { en: 'Settings', tr: 'Ayarlar' },
  recommendations: { en: 'Recommendations', tr: 'Öneriler' },
  notifications: { en: 'Notifications', tr: 'Bildirimler' },
  tickets: { en: 'Tickets', tr: 'Destek' },
}

const ADMIN_ROUTE_LABELS: Record<string, { en: string; tr: string }> = {
  'admin-analytics': { en: 'Dashboard & Analytics', tr: 'Genel Bakış' },
  'admin-overview': { en: 'Dashboard & Analytics', tr: 'Genel Bakış' },
  'admin-users': { en: 'User Management', tr: 'Kullanıcı Yönetimi' },
  'admin-plans': { en: 'Plans & Subscriptions', tr: 'Plan ve Abonelikler' },
  'admin-system': { en: 'System & AI Config', tr: 'Sistem Ayarları ve Yapay Zeka' },
  'admin-support': { en: 'Support', tr: 'Destek' },
  'admin-operations': { en: 'Platform Operations', tr: 'Platform Operasyonları' },
  'admin-security': { en: 'Security & Monitoring', tr: 'Güvenlik ve İzleme' },
  'admin-settings': { en: 'Admin Settings', tr: 'Admin Ayarları' },
}

export default defineComponent({
  name: 'ModuleLayoutWrapper',
  components: {
    ModuleLayout,
  },
  setup() {
    const route = useRoute()
    const selectedLanguage = ref<Language>(
      (localStorage.getItem('selectedLanguage') as Language) || 'English'
    )

    const selectedPage = computed(() => {
      const name = (route.name as string) || ''
      const adminTab = ADMIN_ROUTE_LABELS[name]
      if (adminTab) {
        return selectedLanguage.value === 'Turkish' ? adminTab.tr : adminTab.en
      }
      const mapping = ROUTE_NAME_TO_PAGE[name]
      if (!mapping) return ''
      return selectedLanguage.value === 'Turkish' ? mapping.tr : mapping.en
    })

    const handleLanguageUpdate = (language: string) => {
      selectedLanguage.value = language as Language
      localStorage.setItem('selectedLanguage', language)
      // Trigger a global refetch to update localized data from the API
      window.dispatchEvent(new CustomEvent('app:refetch'))
    }

    onMounted(() => {
      const saved = localStorage.getItem('selectedLanguage')
      if (saved === 'English' || saved === 'Turkish') {
        selectedLanguage.value = saved
      }
    })

    return {
      selectedLanguage,
      selectedPage,
      handleLanguageUpdate,
    }
  },
})
</script>

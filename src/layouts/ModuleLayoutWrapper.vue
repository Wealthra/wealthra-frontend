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
  admin: { en: 'Admin', tr: 'Yönetici' },
  notifications: { en: 'Notifications', tr: 'Bildirimler' },
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
      const mapping = ROUTE_NAME_TO_PAGE[name]
      if (!mapping) return ''
      return selectedLanguage.value === 'Turkish' ? mapping.tr : mapping.en
    })

    const handleLanguageUpdate = (language: string) => {
      selectedLanguage.value = language as Language
      localStorage.setItem('selectedLanguage', language)
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

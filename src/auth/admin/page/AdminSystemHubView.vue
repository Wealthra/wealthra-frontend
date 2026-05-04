<template>
  <div class="dashboard-page admin-system-hub">
    <!-- AI Configuration Section -->
    <section class="system-section">
      <AdminAiConfig :selected-language="selectedLanguage" />
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type { PropType } from 'vue'
import AdminAiConfig from '../components/AdminAiConfig.vue'

export default defineComponent({
  name: 'AdminSystemHubView',
  components: {
    AdminAiConfig,
  },
  props: {
    selectedLanguage: {
      type: String as PropType<'English' | 'Turkish'>,
      default: 'English',
    },
  },
  setup(props) {
    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        aiConfig: isTr ? 'Yapay Zeka Yapılandırması' : 'AI Engine Configuration',
        aiDesc: isTr ? 'Büyük dil modellerini, jeton limitlerini ve çalışma zamanı parametrelerini yönetin.' : 'Manage large language models, token limits, and runtime parameters.'
      }
    })

    return { t }
  }
})
</script>

<style scoped lang="scss">
.admin-system-hub {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 2.5rem;
  padding-bottom: 0;
  animation: pageIn 0.5s ease-out;

  @media (max-width: 1024px) {
    flex: none;
    min-height: auto;
    display: block;
    padding-bottom: 2rem;
  }
}

@keyframes pageIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.system-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 1.5rem;
  margin-bottom: 2rem;

  .section-header {
    margin-bottom: 0.5rem;

    h1 {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--header-text-color);
      margin: 0;
      letter-spacing: -0.02em;
    }

    p {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--normal-text-color);
      opacity: 0.6;
      margin: 4px 0 0;
    }
  }

  @media (max-width: 1024px) {
    flex: none;
    min-height: auto;
  }
}
</style>

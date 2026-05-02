<template>
  <div class="dashboard-page admin-system-hub">
    <!-- AI Configuration Section -->
    <section class="system-section">
      <AdminAiConfig :selected-language="selectedLanguage" />
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
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
  gap: 1.25rem;

  @media (max-width: 1024px) {
    flex: none;
    min-height: auto;
  }
}
</style>



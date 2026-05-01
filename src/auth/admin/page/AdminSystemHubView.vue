<template>
  <div class="dashboard-page admin-system-hub">
    <section class="analytics-section">
      <h2 class="analytics-section-title">{{ t.aiSettings }}</h2>
      <AdminAiSettings />
    </section>

    <section class="analytics-section analytics-section--gap">
      <h2 class="analytics-section-title">{{ t.aiUsage }}</h2>
      <div class="analytics-dash-panel">
        <div class="card-inner">
          <AdminAiUsagePanel :selected-language="selectedLanguage" />
        </div>
      </div>
    </section>

    <section class="analytics-section analytics-section--gap">
      <h2 class="analytics-section-title">{{ t.security }}</h2>
      <AdminSecurity />
    </section>

    <section class="analytics-section analytics-section--gap">
      <h2 class="analytics-section-title">{{ t.errorLogs }}</h2>
      <div class="analytics-dash-panel">
        <div class="card-inner card-inner--flush">
          <AdminErrorLogs :selected-language="selectedLanguage" />
        </div>
      </div>
    </section>

    <section class="analytics-section analytics-section--gap">
      <h2 class="analytics-section-title">{{ t.auditLogs }}</h2>
      <div class="analytics-dash-panel">
        <div class="card-inner card-inner--flush">
          <AdminAuditLogs :selected-language="selectedLanguage" />
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import type { PropType } from 'vue'
import AdminAiSettings from '../components/AdminAiSettings.vue'
import AdminSecurity from '../components/AdminSecurity.vue'
import AdminErrorLogs from '../components/AdminErrorLogs.vue'
import AdminAuditLogs from '../components/AdminAuditLogs.vue'
import AdminAiUsagePanel from '../components/AdminAiUsagePanel.vue'

export default defineComponent({
  name: 'AdminSystemHubView',
  components: {
    AdminAiSettings,
    AdminSecurity,
    AdminErrorLogs,
    AdminAuditLogs,
    AdminAiUsagePanel,
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
        aiSettings: isTr ? 'AI yapılandırması' : 'AI configuration',
        aiUsage: isTr ? 'AI kullanımı (izleme)' : 'AI usage (monitoring)',
        security: isTr ? 'Güvenlik (engellenen IP)' : 'Security (blocked IPs)',
        errorLogs: isTr ? 'Hata günlükleri' : 'Error logs',
        auditLogs: isTr ? 'Denetim günlüğü' : 'Audit log',
      }
    })

    return { t }
  },
})
</script>

<style scoped lang="scss">
.dashboard-page.admin-system-hub {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: min-content;
  padding-bottom: 2rem;
  min-height: 0;
}

.analytics-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &--gap {
    margin-top: 0.5rem;
  }
}

.analytics-section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--header-text-color);
}

.analytics-dash-panel {
  background: var(--background-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.card-inner {
  padding: 1.25rem;
  width: 100%;
  box-sizing: border-box;

  &--flush {
    padding: 0;

    :deep(.admin-error-logs) {
      border-radius: var(--border-radius);
    }

    :deep(.admin-audit-logs) {
      padding: 1rem 1.25rem 1.25rem;
    }
  }
}
</style>

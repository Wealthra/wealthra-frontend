<template>
  <div class="admin-ai-usage">
    <div class="admin-ai-usage__toolbar">
      <label class="admin-ai-usage__label" for="ai-usage-days">{{ t.period }}</label>
      <select
        id="ai-usage-days"
        v-model.number="days"
        class="admin-ai-usage__select"
        :disabled="isLoading"
        @change="fetchUsage"
      >
        <option v-for="d in dayOptions" :key="d" :value="d">{{ t.daysLabel(d) }}</option>
      </select>
      <button type="button" class="admin-ai-usage__refresh" :disabled="isLoading" @click="fetchUsage">
        <font-awesome-icon icon="arrows-rotate" :spin="isLoading" />
        {{ t.refresh }}
      </button>
    </div>

    <div v-if="isLoading && !summary" class="admin-ai-usage__skeleton">
      <UISkeletonLoader v-for="i in 5" :key="i" height="92px" border-radius="12px" />
    </div>

    <div v-else-if="loadError" class="admin-ai-usage__error">
      <p>{{ loadError }}</p>
      <button type="button" class="admin-ai-usage__retry" @click="fetchUsage">{{ t.retry }}</button>
    </div>

    <div v-else-if="summary" class="kpi-grid">
      <div class="analytics-dash-card">
        <div class="stat-label">{{ t.promptTokens }}</div>
        <div class="stat-value">{{ formatAmount(summary.totalPromptTokens) }}</div>
      </div>
      <div class="analytics-dash-card">
        <div class="stat-label">{{ t.completionTokens }}</div>
        <div class="stat-value">{{ formatAmount(summary.totalCompletionTokens) }}</div>
      </div>
      <div class="analytics-dash-card">
        <div class="stat-label">{{ t.totalTokens }}</div>
        <div class="stat-value">{{ formatAmount(totalTokens) }}</div>
      </div>
      <div class="analytics-dash-card">
        <div class="stat-label">{{ t.estimatedCost }}</div>
        <div class="stat-value">{{ formatCurrency(summary.totalEstimatedCostUsd) }}</div>
      </div>
      <div class="analytics-dash-card">
        <div class="stat-label">{{ t.requests }}</div>
        <div class="stat-value">{{ formatAmount(summary.requestCount) }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import type { PropType } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { AiUsageSummary } from '@/services/api/admin/admin.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import { useCurrency } from '@/composables/useCurrency'

export default defineComponent({
  name: 'AdminAiUsagePanel',
  components: { UISkeletonLoader },
  props: {
    selectedLanguage: {
      type: String as PropType<'English' | 'Turkish'>,
      default: 'English',
    },
  },
  setup(props) {
    const { formatAmount, formatCurrency, isPrivacyMode } = useCurrency()
    const dayOptions = [7, 14, 30] as const
    const days = ref<number>(7)
    const summary = ref<AiUsageSummary | null>(null)
    const isLoading = ref(true)
    const loadError = ref<string | null>(null)

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        period: isTr ? 'Dönem (gün)' : 'Period (days)',
        refresh: isTr ? 'Yenile' : 'Refresh',
        retry: isTr ? 'Yeniden dene' : 'Retry',
        promptTokens: isTr ? 'İstem jetonları' : 'Prompt tokens',
        completionTokens: isTr ? 'Tamamlama jetonları' : 'Completion tokens',
        totalTokens: isTr ? 'Toplam jeton' : 'Total tokens',
        estimatedCost: isTr ? 'Tahmini maliyet' : 'Estimated cost',
        requests: isTr ? 'İstek sayısı' : 'Requests',
        failed: isTr ? 'AI kullanım özeti yüklenemedi.' : 'Could not load AI usage.',
        daysLabel: (n: number) =>
          isTr ? `Son ${n} gün` : `Last ${n} days`,
      }
    })

    const totalTokens = computed(() => {
      const s = summary.value
      if (!s) return 0
      return (s.totalPromptTokens ?? 0) + (s.totalCompletionTokens ?? 0)
    })

    const fetchUsage = async () => {
      isLoading.value = true
      loadError.value = null
      try {
        summary.value = await adminService.getAiUsage(days.value)
      } catch {
        loadError.value = t.value.failed
        summary.value = null
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      fetchUsage()
    })

    return {
      dayOptions,
      days,
      summary,
      isLoading,
      loadError,
      totalTokens,
      t,
      formatAmount,
      formatCurrency,
      fetchUsage,
    }
  },
})
</script>

<style scoped lang="scss">
.admin-ai-usage {
  width: 100%;
}

.admin-ai-usage__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.admin-ai-usage__label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--header-text-color);
}

.admin-ai-usage__select {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--background-color);
  color: var(--normal-text-color);
  font-weight: 600;
  cursor: pointer;
}

.admin-ai-usage__refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--background-color-soft);
  color: var(--header-text-color);
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: var(--primary-green-color);
    color: var(--primary-green-color);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.admin-ai-usage__skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-ai-usage__error {
  padding: 1.25rem;
  border-radius: var(--border-radius);
  background: var(--background-color-soft);
  border: 1px dashed var(--border-color);
  color: var(--notification-alert-color, #ef4444);

  p {
    margin: 0 0 12px;
  }
}

.admin-ai-usage__retry {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: var(--primary-green-color);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.analytics-dash-card {
  background: var(--background-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-height: 0;

  .stat-label {
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.35;
    color: var(--header-text-color);
    opacity: 0.88;
  }

  .stat-value {
    font-size: clamp(1.15rem, 2.4vw, 1.45rem);
    font-weight: 800;
    color: var(--primary-green-color);
    word-break: break-word;
    letter-spacing: -0.02em;
  }
}
</style>

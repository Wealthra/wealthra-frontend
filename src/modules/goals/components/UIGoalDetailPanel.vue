<template>
  <UISidePanelShell
    :is-open="isOpen"
    :title="t('goalDetailTitle')"
    :aria-label="t('goalDetailTitle')"
    @close="$emit('close')"
  >
    <div v-if="loading" class="detail-skeleton">
      <UISkeletonLoader height="180px" border-radius="16px" />
    </div>

    <div v-else-if="goal" class="detail-card glass-card">
      <div class="detail-name">{{ goal.name }}</div>
      <div class="detail-row">
        <span class="lbl">{{ t('targetAmount') }}</span>
        <span class="val">{{ isPrivacyMode ? '••' : formatCurrency(goal.targetAmount) }}</span>
      </div>
      <div class="detail-row">
        <span class="lbl">{{ t('currentAmount') }}</span>
        <span class="val">{{ isPrivacyMode ? '••' : formatCurrency(goal.currentAmount ?? 0) }}</span>
      </div>
      <div class="detail-row">
        <span class="lbl">{{ t('goalProgress') }}</span>
        <span class="val">{{ isPrivacyMode ? '••%' : progressLabel(goal) }}</span>
      </div>
      <div class="detail-row">
        <span class="lbl">{{ t('goalDeadline') }}</span>
        <span class="val">{{ formatDeadline(goal.deadline) }}</span>
      </div>
      <div class="detail-row">
        <span class="lbl">{{ t('status') }}</span>
        <span class="status-badge" :class="goal.isCompleted ? 'done' : 'active'">
          {{ goal.isCompleted ? t('goalCompleted') : t('goalActive') }}
        </span>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>{{ t('goalDetailLoadError') }}</p>
    </div>
  </UISidePanelShell>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UISidePanelShell from '@/components/UISidePanelShell.vue'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import { goalsTexts } from '@/data/goalsTexts'
import { useCurrency } from '@/composables/useCurrency'
import type { Goal } from '@/services/api/goal/goal.models'

export default defineComponent({
  name: 'UIGoalDetailPanel',
  components: { UISidePanelShell, UISkeletonLoader },
  props: {
    isOpen: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    goal: {
      type: Object as () => Goal | null,
      default: null,
    },
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
  },
  emits: ['close'],
  setup() {
    const { formatCurrency, isPrivacyMode } = useCurrency()
    return { formatCurrency, isPrivacyMode }
  },
  methods: {
    t(key: keyof typeof goalsTexts.English) {
      const texts = goalsTexts[this.selectedLanguage]
      return (texts as Record<string, string>)[key] ?? key
    },
    progressLabel(goal: Goal): string {
      if (goal.progressPercentage != null) return `${goal.progressPercentage.toFixed(1)}%`
      const t = goal.targetAmount || 1
      const c = goal.currentAmount ?? 0
      return `${Math.min(100, (c / t) * 100).toFixed(1)}%`
    },
    formatDeadline(iso: string): string {
      try {
        const d = new Date(iso)
        return d.toLocaleDateString(this.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US', {
          dateStyle: 'medium',
        })
      } catch {
        return iso
      }
    },
  },
})
</script>

<style scoped lang="scss">
.detail-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-card {
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.detail-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--header-text-color);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;

  .lbl {
    font-size: 0.8rem;
    font-weight: 600;
    opacity: 0.7;
  }

  .val {
    font-weight: 700;
    color: var(--header-text-color);
    text-align: right;
  }
}

.status-badge {
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;

  &.done {
    background: rgba(92, 184, 92, 0.15);
    color: var(--primary-green-color);
  }

  &.active {
    background: rgba(240, 173, 78, 0.2);
    color: var(--primary-yellow-color, #f0ad4e);
  }
}

.empty-state {
  padding: 2rem 0;
  text-align: center;
  color: var(--normal-text-color);
  opacity: 0.85;
}
</style>

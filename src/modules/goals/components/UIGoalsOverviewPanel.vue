<template>
  <UISidePanelShell
    :is-open="isOpen"
    :title="t('allGoalsTitle')"
    :aria-label="t('allGoalsTitle')"
    @close="$emit('close')"
  >
    <div v-if="loading" class="goals-skeleton">
      <div v-for="i in 5" :key="i">
        <UISkeletonLoader height="88px" border-radius="14px" />
      </div>
    </div>

    <div v-else-if="goals.length > 0" class="goals-list">
      <div v-for="g in goals" :key="g.id" class="goal-mini-card glass-card">
        <div class="goal-mini-head">
          <span class="goal-mini-name">{{ g.name }}</span>
          <span class="goal-mini-pct">{{ formatPercent(g) }}</span>
        </div>
        <div class="goal-mini-amounts">
          {{ formatCurrency(displayCurrent(g)) }} / {{ formatCurrency(g.targetAmount) }}
        </div>
        <div class="goal-mini-meta">
          <span>{{ g.currency }}</span>
          <span v-if="g.deadline">{{ formatDeadline(g.deadline) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <font-awesome-icon icon="folder-open" class="empty-icon" />
      <p>{{ t('noGoalsInOverview') }}</p>
    </div>
  </UISidePanelShell>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import UISidePanelShell from '@/components/UISidePanelShell.vue'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import { goalsTexts } from '@/data/goalsTexts'
import { useCurrency } from '@/composables/useCurrency'
import type { Goal } from '@/services/api/goal/goal.models'

export default defineComponent({
  name: 'UIGoalsOverviewPanel',
  components: { UISidePanelShell, UISkeletonLoader, FontAwesomeIcon },
  props: {
    isOpen: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    goals: {
      type: Array as () => Goal[],
      default: () => [],
    },
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
  },
  emits: ['close'],
  setup() {
    const { formatCurrency } = useCurrency()
    return { formatCurrency }
  },
  methods: {
    t(key: keyof typeof goalsTexts.English) {
      const texts = goalsTexts[this.selectedLanguage]
      return (texts as Record<string, string>)[key] ?? key
    },
    displayCurrent(g: Goal): number {
      return g.currentAmount ?? g.achievedAmount ?? 0
    },
    formatPercent(g: Goal): string {
      if (g.progressPercentage != null) return `${g.progressPercentage.toFixed(1)}%`
      const t = g.targetAmount || 1
      const c = this.displayCurrent(g)
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
.goals-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-mini-card {
  padding: 1rem 1.15rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
}

.goal-mini-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.goal-mini-name {
  font-weight: 700;
  color: var(--header-text-color);
  font-size: 0.95rem;
}

.goal-mini-pct {
  font-weight: 800;
  font-size: 0.85rem;
  color: var(--primary-yellow-color, #f0ad4e);
}

.goal-mini-amounts {
  font-size: 0.9rem;
  color: var(--header-text-color);
  margin-bottom: 0.35rem;
}

.goal-mini-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  opacity: 0.75;
  color: var(--normal-text-color);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 3rem;
  color: var(--normal-text-color);

  .empty-icon {
    font-size: 2.5rem;
    opacity: 0.35;
    margin-bottom: 1rem;
  }

  p {
    opacity: 0.75;
    font-size: 0.9rem;
  }
}
</style>

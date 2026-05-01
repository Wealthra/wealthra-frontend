<template>
  <UISidePanelShell
    :is-open="isOpen"
    :title="t('budgetDetailTitle')"
    :aria-label="t('budgetDetailTitle')"
    @close="$emit('close')"
  >
    <div v-if="loading" class="detail-skeleton">
      <UISkeletonLoader height="160px" border-radius="16px" />
      <UISkeletonLoader height="80px" border-radius="16px" />
    </div>

    <div v-else-if="budget" class="detail-card glass-card">
      <div class="detail-row highlight">
        <span class="lbl">{{ t('budgetDetailCategory') }}</span>
        <span class="val">{{ budget.categoryName }}</span>
      </div>
      <div class="detail-grid">
        <div class="detail-row">
          <span class="lbl">{{ t('budgetDetailLimit') }}</span>
          <span class="val">{{ formatCurrency(budget.limitAmount) }}</span>
        </div>
        <div class="detail-row">
          <span class="lbl">{{ t('budgetDetailSpent') }}</span>
          <span class="val">{{ formatCurrency(budget.currentAmount) }}</span>
        </div>
        <div class="detail-row">
          <span class="lbl">{{ t('budgetDetailCurrency') }}</span>
          <span class="val">{{ budget.currency }}</span>
        </div>
        <div class="detail-row">
          <span class="lbl">{{ t('budgetDetailPercentUsed') }}</span>
          <span class="val">{{ budget.percentageUsed?.toFixed?.(1) ?? budget.percentageUsed }}%</span>
        </div>
        <div class="detail-row">
          <span class="lbl">{{ t('budgetDetailStatus') }}</span>
          <span class="status-badge" :class="statusClass(budget.status)">{{ budget.status }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>{{ t('budgetDetailLoadError') }}</p>
    </div>
  </UISidePanelShell>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UISidePanelShell from '@/components/UISidePanelShell.vue'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import { budgetTexts } from '@/data/budgetTexts'
import { useCurrency } from '@/composables/useCurrency'
import type { BudgetApiModel } from '@/services/api/budget/budget.models'

export default defineComponent({
  name: 'UIBudgetDetailPanel',
  components: { UISidePanelShell, UISkeletonLoader },
  props: {
    isOpen: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    budget: {
      type: Object as () => BudgetApiModel | null,
      default: null,
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
    t(key: keyof typeof budgetTexts.English) {
      const texts = budgetTexts[this.selectedLanguage]
      return (texts as Record<string, string>)[key] ?? key
    },
    statusClass(status: string): string {
      const s = (status || '').toLowerCase()
      if (s.includes('exceed') || s.includes('danger') || s.includes('critical')) return 'danger'
      if (s.includes('warn')) return 'warning'
      return 'ok'
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

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  &.highlight {
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 0.25rem;
  }

  .lbl {
    font-size: 0.8rem;
    font-weight: 600;
    opacity: 0.7;
    color: var(--normal-text-color);
  }

  .val {
    font-weight: 700;
    color: var(--header-text-color);
    text-align: right;
  }
}

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;

  &.ok {
    background: rgba(92, 184, 92, 0.12);
    color: var(--primary-green-color);
  }

  &.warning {
    background: rgba(245, 158, 11, 0.12);
    color: #f59e0b;
  }

  &.danger {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
  }
}

.empty-state {
  padding: 2rem 0;
  text-align: center;
  color: var(--normal-text-color);
  opacity: 0.85;
}
</style>

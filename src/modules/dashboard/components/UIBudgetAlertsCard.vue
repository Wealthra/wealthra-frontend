<template>
  <div class="budget-alerts-card">
    <div class="budget-alerts-card__title">{{ title }}</div>
    <div v-if="alerts.length === 0" class="budget-alerts-card__empty">
      {{ emptyText }}
    </div>
    <ul v-else class="budget-alerts-card__list">
      <li
        v-for="alert in alerts"
        :key="alert.budgetId"
        class="budget-alerts-card__item"
        :class="{
          'budget-alerts-card__item--exceeded': alert.status === 'Exceeded',
          'budget-alerts-card__item--warning': alert.status === 'Warning',
        }"
      >
        <div class="budget-alerts-card__row">
          <span class="budget-alerts-card__category">{{ alert.categoryName }}</span>
          <span class="budget-alerts-card__status">{{ statusLabel(alert.status) }}</span>
        </div>
        <div class="budget-alerts-card__amounts">
          <span>${{ alert.currentAmount.toLocaleString() }} / ${{ alert.limitAmount.toLocaleString() }}</span>
          <span class="budget-alerts-card__pct">{{ Math.round(alert.percentageUsed) }}%</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import type { SummaryBudgetAlert } from '@/services/api/summary/summary.models'

export default {
  name: 'UIBudgetAlertsCard',
  props: {
    alerts: {
      type: Array as () => SummaryBudgetAlert[],
      default: () => [],
    },
    title: {
      type: String,
      default: 'Budget alerts',
    },
    emptyText: {
      type: String,
      default: 'No budget alerts.',
    },
    statusExceededText: {
      type: String,
      default: 'Exceeded',
    },
    statusWarningText: {
      type: String,
      default: 'Warning',
    },
  },
  methods: {
    statusLabel(status: string) {
      if (status === 'Exceeded') return this.statusExceededText
      if (status === 'Warning') return this.statusWarningText
      return status
    },
  },
}
</script>

<style scoped lang="scss">
.budget-alerts-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 1.2rem;
  border-radius: var(--border-radius);
  font-family: var(--main-font);
  background: var(--background-color);

  .budget-alerts-card__title {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--header-text-color);
    margin-bottom: 0.75rem;
  }

  .budget-alerts-card__empty {
    font-size: 0.95rem;
    color: var(--normal-text-color);
    padding: 0.5rem 0;
  }

  .budget-alerts-card__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
  }

  .budget-alerts-card__item {
    padding: 0.75rem;
    border-radius: var(--border-radius);

    &--exceeded {
      background: var(--notification-alert-color-soft);
    }

    &--warning {
      background: var(--notification-warning-color-soft);
    }
  }

  .budget-alerts-card__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .budget-alerts-card__category {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--header-text-color);
  }

  .budget-alerts-card__status {
    font-size: 0.8rem;
    font-weight: 600;
  }

  .budget-alerts-card__item--exceeded .budget-alerts-card__status {
    color: var(--notification-alert-color-header);
  }

  .budget-alerts-card__item--warning .budget-alerts-card__status {
    color: var(--notification-warning-color-header);
  }

  .budget-alerts-card__amounts {
    display: flex;
    justify-content: space-between;
    margin-top: 0.35rem;
    font-size: 0.875rem;
    color: var(--normal-text-color);
  }

  .budget-alerts-card__pct {
    font-weight: 600;
  }
}
</style>

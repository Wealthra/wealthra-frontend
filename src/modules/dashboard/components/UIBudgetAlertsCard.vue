<template>
  <div class="budget-alerts-card">
    <div class="card-header">
      <div v-if="loading" class="skeleton-box title-skeleton"></div>
      <h3 v-else class="card-title">{{ title }}</h3>
    </div>

    <div v-if="loading" class="alerts-list">
      <div v-for="i in 3" :key="i" class="alert-item skeleton-item">
        <div class="alert-title-row">
          <div class="skeleton-box alert-main-skeleton"></div>
          <div class="skeleton-box status-badge-skeleton"></div>
        </div>
        <div class="alert-data-row">
          <div class="skeleton-box amount-skeleton"></div>
          <div class="skeleton-box pct-skeleton"></div>
        </div>
        <div class="alert-progress-row">
          <div class="skeleton-box progress-bar-skeleton"></div>
        </div>
      </div>
    </div>

    <div v-else-if="alerts.length === 0" class="empty-state">
      <font-awesome-icon icon="fas fa-check-circle" class="empty-icon success" />
      <p>{{ emptyText }}</p>
    </div>

    <div v-else class="alerts-list">
      <div
        v-for="alert in alerts"
        :key="alert.budgetId"
        class="alert-item"
        :class="['alert-item--' + (alert.status === 'Exceeded' ? 'high' : 'medium')]"
      >
        <!-- Top Row: Icon, Name and Status Badge -->
        <div class="alert-title-row">
          <div class="alert-main-info">
            <div class="category-icon">
              <font-awesome-icon :icon="getIcon(alert.categoryName)" />
            </div>
            <span class="category-name">{{ alert.categoryName }}</span>
          </div>
          <span class="status-badge">{{ statusLabel(alert.status) }}</span>
        </div>

        <!-- Middle Row: Amounts and Percentage -->
        <div class="alert-data-row">
          <div class="amount-display">
            <span class="current">{{ formatCurrency(alert.currentAmount) }}</span>
            <span class="divider">/</span>
            <span class="limit">{{ formatCurrency(alert.limitAmount) }}</span>
          </div>
          <span class="pct-label">{{ formatPercentage(alert) }}</span>
        </div>

        <!-- Bottom Row: Progress Bar -->
        <div class="alert-progress-row">
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: Math.min(100, calculatePercentage(alert)) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { SummaryBudgetAlert } from '@/services/api/summary/summary.models'
import { transactionCategoryIconMap } from '@/icons/fontawesome-icons'

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
    loading: {
      type: Boolean,
      default: false,
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
    getIcon(categoryName: string) {
      if (!categoryName) return transactionCategoryIconMap.default
      const cat = categoryName.toLowerCase()
      for (const [key, icon] of Object.entries(transactionCategoryIconMap)) {
        if (cat.includes(key)) return icon
      }
      return transactionCategoryIconMap.default
    },
    formatCurrency(amount: number) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(amount)
    },
    calculatePercentage(alert: SummaryBudgetAlert) {
      if (!alert.limitAmount || alert.limitAmount === 0) return 100
      return (alert.currentAmount / alert.limitAmount) * 100
    },
    formatPercentage(alert: SummaryBudgetAlert) {
      return Math.round(this.calculatePercentage(alert)) + '%'
    },
  },
}
</script>

<style scoped lang="scss">

.budget-alerts-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 1.25rem;
  box-sizing: border-box;

  .title-skeleton {
    width: 140px;
    height: 1.1rem;
  }

  .card-header {
    margin-bottom: 1.25rem;
    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--header-text-color);
      margin: 0;
    }
  }

  .alerts-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 10px;
    }
  }

  /* Skeleton Styles */
  .alert-main-skeleton {
    width: 60%;
    height: 1.2rem;
  }
  .status-badge-skeleton {
    width: 60px;
    height: 1rem;
    border-radius: 999px;
  }
  .amount-skeleton {
    width: 50%;
    height: 1.1rem;
  }
  .pct-skeleton {
    width: 30px;
    height: 1rem;
  }
  .progress-bar-skeleton {
    width: 100%;
    height: 4px;
    border-radius: 999px;
  }

  /* Base Item Style (Matches Recommendation Card) */
  .alert-item {
    padding: 0.85rem;
    border-radius: var(--border-radius);
    background: var(--background-color-soft);
    border-left: 4px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    transition: transform 0.2s ease;

    /* Severity Colors (Synced with Recommendations) */
    &--high {
      border-left-color: var(--notification-alert-color);
      background: var(--notification-alert-color-soft);
      .status-badge {
        color: var(--notification-alert-color-header);
        background: rgba(220, 53, 69, 0.1);
      }
      .progress-fill {
        background: var(--notification-alert-color);
      }
    }

    &--medium {
      border-left-color: var(--notification-warning-color);
      background: var(--notification-warning-color-soft);
      .status-badge {
        color: var(--notification-warning-color-header);
        background: rgba(243, 156, 18, 0.1);
      }
      .progress-fill {
        background: var(--notification-warning-color);
      }
    }
  }

  .alert-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .alert-main-info {
    display: flex;
    align-items: center;
    gap: 0.6rem;

    .category-icon {
      font-size: 0.8rem;
      opacity: 0.6;
      color: var(--header-text-color);
    }
    .category-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--header-text-color);
    }
  }

  .status-badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .alert-data-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    .amount-display {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;

      .current {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--header-text-color);
      }
      .divider {
        font-size: 0.8rem;
        color: var(--normal-text-color);
        opacity: 0.5;
      }
      .limit {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--normal-text-color);
      }
    }

    .pct-label {
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--header-text-color);
    }
  }

  .alert-progress-row {
    .progress-track {
      width: 100%;
      height: 4px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
    }
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--normal-text-color);

    .empty-icon {
      font-size: 2.5rem;
      &.success {
        color: var(--primary-green-color);
        opacity: 0.6;
      }
    }
    p {
      font-size: 0.9rem;
      font-weight: 500;
    }
  }
}
</style>

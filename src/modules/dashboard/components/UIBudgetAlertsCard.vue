<template>
  <div class="budget-alerts-card">
    <div class="card-header">
      <div v-if="loading" class="skeleton-box title-skeleton"></div>
      <template v-else>
        <div class="header-left">
          <h3 class="card-title">{{ title }}</h3>
          <span v-if="alerts.length > 1" class="page-indicator">
            {{ currentIndex + 1 }} / {{ alerts.length }}
          </span>
        </div>
        <div v-if="carousel && alerts.length > 1" class="header-actions">
          <button class="nav-btn prev" @click="scrollPrev" :disabled="currentIndex === 0">
            <font-awesome-icon icon="chevron-left" />
          </button>
          <button
            class="nav-btn next"
            @click="scrollNext"
            :disabled="currentIndex === alerts.length - 1"
          >
            <font-awesome-icon icon="chevron-right" />
          </button>
        </div>
      </template>
    </div>

    <div v-if="loading" :class="['alerts-list', { 'carousel-mode': carousel }]">
      <div v-for="i in 3" :key="i" class="alert-item skeleton-item">
        <div class="alert-top">
          <div class="skeleton-box category-icon-skeleton"></div>
          <div class="skeleton-box status-badge-skeleton"></div>
        </div>
        <div class="alert-body">
          <div class="skeleton-box alert-title-skeleton"></div>
          <div class="skeleton-box alert-subtitle-skeleton"></div>
        </div>
        <div class="alert-analysis-box skeleton">
          <div class="analysis-header">
            <div class="skeleton-box analysis-label-skeleton"></div>
            <div class="skeleton-box pct-label-skeleton"></div>
          </div>
          <div class="progress-container">
            <div class="skeleton-box progress-bar-skeleton"></div>
          </div>
          <div class="amount-display">
            <div class="skeleton-box amount-skeleton"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="alerts.length === 0" class="empty-state">
      <font-awesome-icon icon="fas fa-check-circle" class="empty-icon success" />
      <p>{{ emptyText }}</p>
    </div>

    <div
      v-else
      :class="['alerts-list', { 'carousel-mode': carousel }]"
      ref="listRef"
      @scroll="handleScroll"
    >
      <div
        v-for="(alert, index) in alerts"
        :key="alert.budgetId"
        class="alert-item"
        :class="['alert-item--' + (alert.status === 'Exceeded' ? 'high' : 'medium')]"
      >
        <div class="alert-top">
          <div class="category-icon-box">
            <font-awesome-icon :icon="getIcon(alert.categoryName)" />
          </div>
          <span class="status-badge">{{ statusLabel(alert.status) }}</span>
        </div>

        <div class="alert-body">
          <h4 class="alert-title">{{ alert.categoryName }}</h4>
          <p class="alert-subtitle">{{ statusSubtitle(alert) }}</p>
        </div>

        <div class="alert-analysis-box">
          <div class="analysis-header">
            <span class="analysis-label">Analiz</span>
            <span class="pct-label">{{ formatPercentage(alert) }}</span>
          </div>
          <div class="progress-container">
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: Math.min(100, calculatePercentage(alert)) + '%' }"
              ></div>
            </div>
          </div>
          <div class="amount-display">
            <span class="current">{{ formatCurrency(alert.currentAmount) }}</span>
            <span class="divider">/</span>
            <span class="limit">{{ formatCurrency(alert.limitAmount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { SummaryBudgetAlert } from '@/services/api/summary/summary.models'
import { transactionCategoryIconMap } from '@/icons/fontawesome-icons'
import { useCurrency } from '@/composables/useCurrency'

export default {
  name: 'UIBudgetAlertsCard',
  setup() {
    const { formatCurrency } = useCurrency()
    return { formatCurrency }
  },
  data() {
    return {
      currentIndex: 0,
    }
  },
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
    carousel: {
      type: Boolean,
      default: false,
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
      return this.formatCurrency(amount)
    },
    calculatePercentage(alert: SummaryBudgetAlert) {
      if (!alert.limitAmount || alert.limitAmount === 0) return 100
      return (alert.currentAmount / alert.limitAmount) * 100
    },
    formatPercentage(alert: SummaryBudgetAlert) {
      return Math.round(this.calculatePercentage(alert)) + '%'
    },
    statusSubtitle(alert: SummaryBudgetAlert) {
      const isTurkish = this.statusExceededText.toLowerCase().includes('aş')
      if (alert.status === 'Exceeded') {
        const diff = alert.currentAmount - alert.limitAmount
        return isTurkish
          ? `Bütçenizi ${this.formatCurrency(diff)} aştınız.`
          : `You exceeded your budget by ${this.formatCurrency(diff)}.`
      }
      const remaining = alert.limitAmount - alert.currentAmount
      return isTurkish
        ? `Limitinize ${this.formatCurrency(remaining)} kaldı.`
        : `${this.formatCurrency(remaining)} remaining until limit.`
    },
    scrollNext() {
      const list = this.$refs.listRef as HTMLElement
      if (!list) return
      const clientWidth = list.clientWidth
      list.scrollBy({ left: clientWidth, behavior: 'smooth' })
    },
    scrollPrev() {
      const list = this.$refs.listRef as HTMLElement
      if (!list) return
      const clientWidth = list.clientWidth
      list.scrollBy({ left: -clientWidth, behavior: 'smooth' })
    },
    handleScroll(e: Event) {
      const list = e.target as HTMLElement
      const clientWidth = list.clientWidth
      if (clientWidth > 0) {
        this.currentIndex = Math.round(list.scrollLeft / clientWidth)
      }
    },
  },
}
</script>

<style scoped lang="scss">
.budget-alerts-card {
  height: 100%;
  width: 100%;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .title-skeleton {
    width: 140px;
    height: 1.1rem;
  }

  .card-header {
    padding: 1.25rem 1.25rem 0 1.25rem;
    margin-bottom: 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--header-text-color);
      margin: 0;
    }

    .page-indicator {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--normal-text-color);
      background: var(--background-color-soft);
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      opacity: 0.7;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;

      .nav-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: var(--background-color);
        color: var(--normal-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        font-size: 0.8rem;

        &:hover:not(:disabled) {
          background: var(--background-color-soft);
          border-color: var(--header-text-color);
          color: var(--header-text-color);
        }

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }
    }
  }

  .alerts-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
    padding: 0 1.25rem 1.25rem 1.25rem;

    &::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 10px;
    }

    &.carousel-mode {
      padding: 0 0 1.25rem 0;
      flex-direction: row;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      gap: 0;
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        display: none;
      }

      .alert-item {
        flex: 0 0 100%;
        scroll-snap-align: start;
        margin-bottom: 0;
        height: 100%;

        /* Edge-to-edge box but inset content/background */
        border-left: 1.25rem solid transparent;
        border-right: 1.25rem solid transparent;
        background-clip: padding-box;
      }
    }
  }

  /* Skeleton Styles */
  .category-icon-skeleton {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }
  .status-badge-skeleton {
    width: 70px;
    height: 1.25rem;
    border-radius: 999px;
  }
  .alert-body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .alert-title-skeleton {
    width: 120px;
    height: 1.25rem;
  }
  .alert-subtitle-skeleton {
    width: 180px;
    height: 0.85rem;
  }
  .alert-analysis-box.skeleton {
    background: var(--background-color-soft);
    border: 1px solid var(--border-color);
    opacity: 0.6;
  }
  .analysis-label-skeleton {
    width: 50px;
    height: 0.8rem;
  }
  .pct-label-skeleton {
    width: 40px;
    height: 0.8rem;
  }
  .progress-bar-skeleton {
    width: 100%;
    height: 8px;
    border-radius: 4px;
  }
  .amount-skeleton {
    width: 100px;
    height: 1rem;
  }

  /* Base Item Style (Matches Signal Card) */
  .alert-item {
    padding: 1rem;
    border-radius: 1.25rem;
    background: var(--background-color);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &--high {
      .category-icon-box {
        background: var(--notification-alert-color-soft);
        color: var(--notification-alert-color);
      }
      .status-badge {
        color: var(--notification-alert-color-header);
        background: rgba(220, 53, 69, 0.08);
      }
      .progress-fill {
        background: var(--notification-alert-color);
      }
    }

    &--medium {
      .category-icon-box {
        background: var(--notification-warning-color-soft);
        color: var(--notification-warning-color);
      }
      .status-badge {
        color: var(--notification-warning-color-header);
        background: rgba(243, 156, 18, 0.08);
      }
      .progress-fill {
        background: var(--notification-warning-color);
      }
    }
  }

  .alert-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .category-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .status-badge {
      font-size: 0.65rem;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.04em;
    }
  }

  .alert-body {
    flex: 1;
    .alert-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--header-text-color);
      margin: 0 0 0.4rem 0;
    }
    .alert-subtitle {
      font-size: 0.85rem;
      color: var(--normal-text-color);
      opacity: 0.6;
      margin: 0;
      font-weight: 500;
    }
  }

  .alert-analysis-box {
    background: var(--background-color-soft);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .analysis-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .analysis-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--header-text-color);
        opacity: 0.8;
      }
      .pct-label {
        font-size: 0.85rem;
        font-weight: 800;
        color: var(--header-text-color);
      }
    }

    .progress-container {
      .progress-track {
        width: 100%;
        height: 6px;
        background: rgba(0, 0, 0, 0.04);
        border-radius: 999px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
      }
    }

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
        opacity: 0.4;
      }
      .limit {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--normal-text-color);
        opacity: 0.7;
      }
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

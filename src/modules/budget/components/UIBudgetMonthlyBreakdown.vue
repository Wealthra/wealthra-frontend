<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="sidebar-overlay" @click="$emit('close')"></div>
    </Transition>
    <Transition name="slide-right">
      <div v-if="isOpen" class="monthly-sidebar glass-panel">
        <div class="sidebar-header">
          <div class="header-title">
            <font-awesome-icon icon="chart-line" class="header-icon" />
            <h2>{{ t('monthlyBreakdown') }}</h2>
          </div>
          <button class="close-btn" @click="$emit('close')" aria-label="Close">
            <font-awesome-icon icon="xmark" />
          </button>
        </div>

        <div class="sidebar-content custom-scrollbar">
          <div v-if="loading" class="breakdown-list">
            <div v-for="i in 4" :key="i" class="breakdown-card skeleton-card">
              <UISkeletonLoader height="140px" border-radius="20px" />
            </div>
          </div>

          <div v-else-if="breakdown.length > 0" class="breakdown-list">
            <div v-for="item in breakdown" :key="item.budgetId" class="breakdown-card glass-card">
              <div class="card-header">
                <span class="category-name">{{ item.categoryName }}</span>
                <span :class="['status-badge', item.status.toLowerCase()]">{{ formatStatus(item.status) }}</span>
              </div>
              
              <div class="card-body">
                <div class="amount-row">
                  <div class="amount-item">
                    <span class="label">{{ t('spent') }}</span>
                    <span class="value">{{ formatCurrency(item.spentThisMonth) }}</span>
                  </div>
                  <div class="amount-item text-right">
                    <span class="label">{{ t('limit') }}</span>
                    <span class="value">{{ formatCurrency(item.limitAmount) }}</span>
                  </div>
                </div>

                <div class="progress-container">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: isPrivacyMode ? '0%' : (Math.min(item.percentageUsed, 100) + '%') }"
                      :class="item.status.toLowerCase()"
                    ></div>
                  </div>
                  <div class="progress-labels">
                    <span class="percent">{{ isPrivacyMode ? '••%' : (item.percentageUsed.toFixed(1) + '%') }}</span>
                    <span class="remaining">{{ t('remaining') }}: {{ formatCurrency(item.remainingAmount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon-wrap">
              <font-awesome-icon icon="folder-open" class="empty-icon" />
            </div>
            <p>{{ t('noMonthlyData') }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { BudgetMonthlyCategoryBreakdownItem } from '@/services/api/budget/budget.models'
import { budgetTexts } from '@/data/budgetTexts'
import { useCurrency } from '@/composables/useCurrency'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default defineComponent({
  name: 'UIBudgetMonthlyBreakdown',
  components: { UISkeletonLoader, FontAwesomeIcon },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    breakdown: {
      type: Array as () => BudgetMonthlyCategoryBreakdownItem[],
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English'
    }
  },
  emits: ['close'],
  setup() {
    const { formatCurrency, isPrivacyMode } = useCurrency()
    return { formatCurrency, isPrivacyMode }
  },
  methods: {
    t(key: string) {
      const texts = budgetTexts[this.selectedLanguage] as any
      return texts[key] || key
    },
    formatStatus(status: string) {
      const key = `status${status}`
      const translated = this.t(key)
      return translated === key ? status : translated
    }
  }
})
</script>

<style scoped lang="scss">
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 10001;
}

.monthly-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 450px;
  background: var(--background-color);
  border-left: 1px solid var(--border-color);
  z-index: 10002;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .header-icon {
      color: var(--primary-green-color);
      font-size: 1.25rem;
    }

    h2 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--header-text-color);
      margin: 0;
      letter-spacing: -0.02em;
    }
  }

  .close-btn {
    background: var(--background-color-soft);
    border: none;
    color: var(--normal-text-color);
    width: 36px;
    height: 36px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      background: var(--border-color);
      color: var(--header-text-color);
    }
  }
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.breakdown-card {
  padding: 1.25rem;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  transition: transform 0.2s;

  &:hover {
    border-color: var(--primary-green-color);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  .category-name {
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--header-text-color);
  }

  .status-badge {
    padding: 0.2rem 0.6rem;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;

    &.healthy, &.ok, &.safe {
      background: rgba(92, 184, 92, 0.1);
      color: var(--primary-green-color);
    }
    &.warning {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    &.exceeded, &.danger, &.critical {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }
}

.amount-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  .amount-item {
    display: flex;
    flex-direction: column;

    .label {
      font-size: 0.7rem;
      color: var(--normal-text-color);
      opacity: 0.6;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .value {
      font-weight: 700;
      font-size: 1rem;
      color: var(--header-text-color);
    }
  }
  .text-right {
    text-align: right;
  }
}

.progress-container {
  .progress-bar {
    height: 6px;
    background: var(--background-color-soft);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);

    &.healthy, &.ok, &.safe { background: var(--primary-green-color); }
    &.warning { background: #f59e0b; }
    &.exceeded, &.danger, &.critical { background: #ef4444; }
  }

  .progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    font-weight: 600;
    
    .percent { color: var(--header-text-color); }
    .remaining { color: var(--normal-text-color); opacity: 0.7; }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 5rem;
  color: var(--normal-text-color);
  
  .empty-icon-wrap {
    font-size: 3rem;
    color: var(--border-color);
    margin-bottom: 1rem;
  }
  
  p { font-size: 0.9rem; opacity: 0.7; }
}

/* Transitions */
.slide-right-enter-active, .slide-right-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from, .slide-right-leave-to {
  transform: translateX(100%);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .monthly-sidebar {
    max-width: 100%;
  }
}
</style>

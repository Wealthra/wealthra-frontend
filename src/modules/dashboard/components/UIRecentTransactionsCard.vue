<template>
  <div class="recent-transactions-card">
    <div class="card-header">
      <div v-if="loading" class="skeleton-box title-skeleton"></div>
      <h3 v-else class="card-title">{{ title }}</h3>
    </div>

    <div v-if="loading" class="transactions-container">
      <div v-for="i in 5" :key="i" class="transaction-row skeleton-item">
        <div class="tx-main">
          <div class="skeleton-box tx-icon-skeleton"></div>
          <div class="tx-info">
            <div class="skeleton-box tx-desc-skeleton"></div>
            <div class="skeleton-box tx-category-skeleton"></div>
          </div>
        </div>
        <div class="tx-side">
          <div class="skeleton-box tx-amount-skeleton"></div>
          <div class="skeleton-box tx-time-skeleton"></div>
        </div>
      </div>
    </div>

    <div v-else-if="transactions.length === 0" class="empty-state">
      <font-awesome-icon icon="fas fa-receipt" class="empty-icon" />
      <p>{{ emptyText }}</p>
    </div>

    <div v-else class="transactions-container">
      <div v-for="(group, date) in groupedTransactions" :key="date" class="transaction-group">
        <div class="group-label">{{ group.label }}</div>
        
        <div v-for="tx in group.items" :key="tx.id" class="transaction-row">
          <div class="tx-main">
            <div class="tx-icon-wrap" :class="tx.type === 'Income' ? 'income' : 'expense'">
              <font-awesome-icon :icon="getTransactionIcon(tx)" />
            </div>
            <div class="tx-info">
              <span class="tx-desc">{{ tx.description }}</span>
              <span class="tx-category" v-if="tx.categoryName">
                <span class="tx-category-dot" :style="{ backgroundColor: getCategoryColor(tx.categoryName) }"></span>
                {{ tx.categoryName }}
              </span>
            </div>
          </div>

          <div class="tx-side">
            <span class="tx-amount" :class="tx.type === 'Income' ? 'income' : 'expense'">
              {{ tx.type === 'Income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
            </span>
            <span class="tx-time">{{ formatTime(tx.transactionDate) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { SummaryRecentTransaction } from '@/services/api/summary/summary.models'
import { getCategoryColorByIndex } from '@/utils/chartCategoryPalette'
import { transactionCategoryIconMap } from '@/icons/fontawesome-icons'
import { useCurrency } from '@/composables/useCurrency'

export default {
  name: 'UIRecentTransactionsCard',
  setup() {
    const { formatCurrency } = useCurrency()
    return { formatCurrency }
  },
  props: {
    transactions: {
      type: Array as () => SummaryRecentTransaction[],
      default: () => [],
    },
    title: {
      type: String,
      default: 'Recent transactions',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    emptyText: {
      type: String,
      default: 'No recent transactions.',
    },
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
  },
  computed: {
    groupedTransactions() {
      const groups: Record<string, { label: string; items: SummaryRecentTransaction[] }> = {}
      
      const sorted = [...this.transactions].sort((a, b) => 
        new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      )

      sorted.forEach(tx => {
        const date = new Date(tx.transactionDate)
        const dateKey = date.toDateString()
        
        if (!groups[dateKey]) {
          groups[dateKey] = {
            label: this.getDateLabel(date),
            items: []
          }
        }
        groups[dateKey].items.push(tx)
      })

      return groups
    }
  },
  methods: {
    getDateLabel(date: Date): string {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)

      if (date.toDateString() === today.toDateString()) {
        return this.selectedLanguage === 'English' ? 'Today' : 'Bugün'
      }
      if (date.toDateString() === yesterday.toDateString()) {
        return this.selectedLanguage === 'English' ? 'Yesterday' : 'Dün'
      }

      const locale = this.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US'
      return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: today.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
      })
    },
    formatTime(dateString: string) {
      const date = new Date(dateString)
      const locale = this.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US'
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    },
    formatCurrency(amount: number) {
      return this.formatCurrency(amount)
    },
    getCategoryColor(categoryName: string): string {
      let hash = 0
      for (let i = 0; i < categoryName.length; i++) {
        hash = (hash * 31 + categoryName.charCodeAt(i)) | 0
      }
      return getCategoryColorByIndex(Math.abs(hash))
    },
    getTransactionIcon(tx: SummaryRecentTransaction) {
      if (tx.type === 'Income') return transactionCategoryIconMap.income
      const cat = (tx.categoryName || '').toLowerCase()
      for (const [key, icon] of Object.entries(transactionCategoryIconMap)) {
        if (cat.includes(key)) return icon
      }
      return transactionCategoryIconMap.default
    }
  },
}
</script>

<style scoped lang="scss">

.recent-transactions-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 1.25rem;
  box-sizing: border-box;

  .title-skeleton {
    width: 170px;
    height: 1.1rem;
  }

  .card-header {
    margin-bottom: 1.5rem;
    .card-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--header-text-color);
      margin: 0;
    }
  }

  .transactions-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    /* Custom Scrollbar for premium feel */
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
  }

  /* Skeleton Styles */
  .tx-icon-skeleton {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .tx-desc-skeleton {
    width: 120px;
    height: 0.95rem;
    margin-bottom: 6px;
  }

  .tx-category-skeleton {
    width: 80px;
    height: 0.75rem;
  }

  .tx-amount-skeleton {
    width: 70px;
    height: 1rem;
    margin-bottom: 6px;
  }

  .tx-time-skeleton {
    width: 40px;
    height: 0.7rem;
  }

  .transaction-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .group-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--normal-text-color);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--background-color-soft);
  }

  .transaction-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0.5rem;
    border-radius: var(--border-radius);
    transition: background 0.2s ease;

    &:not(.skeleton-item):hover {
      background: var(--background-color-soft);
    }
  }

  .tx-main {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0;
  }

  .tx-icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;

    &.income {
      background: rgba(92, 184, 92, 0.1);
      color: var(--primary-green-color);
    }
    &.expense {
      background: var(--background-color-soft);
      color: var(--normal-text-color);
    }
  }

  .tx-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    .tx-desc {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--header-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tx-category {
      font-size: 0.75rem;
      color: var(--normal-text-color);
      display: flex;
      align-items: center;
      gap: 0.4rem;

      .tx-category-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
    }
  }

  .tx-side {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    flex-shrink: 0;

    .tx-amount {
      font-size: var(--font-size-sm);
      font-weight: 700;

      &.income { color: var(--primary-green-color); }
      &.expense { color: var(--header-text-color); }
    }

    .tx-time {
      font-size: 0.7rem;
      color: var(--normal-text-color);
      font-weight: 500;
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

    .empty-icon { font-size: 2.5rem; opacity: 0.3; }
    p { font-size: 0.9rem; font-weight: 500; }
  }
}
</style>


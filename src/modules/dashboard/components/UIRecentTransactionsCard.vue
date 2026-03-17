<template>
  <div class="recent-transactions-card">
    <div class="recent-transactions-card__title">{{ title }}</div>
    <div v-if="transactions.length === 0" class="recent-transactions-card__empty">
      {{ emptyText }}
    </div>
    <ul v-else class="recent-transactions-card__list">
      <li
        v-for="tx in transactions"
        :key="tx.id"
        class="recent-transactions-card__item"
      >
        <div class="recent-transactions-card__row">
          <span class="recent-transactions-card__desc">{{ tx.description }}</span>
          <span
            class="recent-transactions-card__amount"
            :class="tx.type === 'Income' ? 'recent-transactions-card__amount--income' : 'recent-transactions-card__amount--expense'"
          >
            {{ tx.type === 'Income' ? '+' : '-' }}${{ tx.amount.toLocaleString() }}
          </span>
        </div>
        <div class="recent-transactions-card__meta">
          <span class="recent-transactions-card__date">{{ formatDate(tx.transactionDate) }}</span>
          <span
            v-if="tx.categoryName"
            class="recent-transactions-card__category-pill"
          >
            <span
              class="recent-transactions-card__category-dot"
              :style="{ backgroundColor: getCategoryColor(tx.categoryName) }"
            />
            <span class="recent-transactions-card__category-label">
              {{ tx.categoryName }}
            </span>
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import type { SummaryRecentTransaction } from '@/services/api/summary/summary.models'
import { getCategoryColorByIndex } from '@/utils/chartCategoryPalette'

export default {
  name: 'UIRecentTransactionsCard',
  props: {
    transactions: {
      type: Array as () => SummaryRecentTransaction[],
      default: () => [],
    },
    title: {
      type: String,
      default: 'Recent transactions',
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
  methods: {
    formatDate(dateString: string) {
      const date = new Date(dateString)
      const locale = this.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US'
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },
    getCategoryColor(categoryName: string): string {
      let hash = 0
      for (let i = 0; i < categoryName.length; i++) {
        hash = (hash * 31 + categoryName.charCodeAt(i)) | 0
      }
      const index = Math.abs(hash)
      return getCategoryColorByIndex(index)
    },
  },
}
</script>

<style scoped lang="scss">
.recent-transactions-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 1.2rem;
  border-radius: var(--border-radius);
  font-family: var(--main-font);
  background: var(--background-color);

  .recent-transactions-card__title {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--header-text-color);
    margin-bottom: 0.75rem;
  }

  .recent-transactions-card__empty {
    font-size: 0.95rem;
    color: var(--normal-text-color);
    padding: 0.5rem 0;
  }

  .recent-transactions-card__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
  }

  .recent-transactions-card__item {
    padding: 0.6rem 0;

    &:not(:last-child) {
      margin-bottom: 0.25rem;
    }
  }

  .recent-transactions-card__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .recent-transactions-card__desc {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--header-text-color);
  }

  .recent-transactions-card__amount {
    font-size: 0.95rem;
    font-weight: 600;

    &--income {
      color: var(--primary-green-color);
    }

    &--expense {
      color: var(--primary-red-color);
    }
  }

  .recent-transactions-card__meta {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.25rem;
    font-size: 0.8rem;
    color: var(--normal-text-color);
    align-items: center;
    flex-wrap: wrap;
  }

  .recent-transactions-card__date {
    flex-shrink: 0;
  }

  .recent-transactions-card__category-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    background-color: var(--background-color-soft);
  }

  .recent-transactions-card__category-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  .recent-transactions-card__category-label {
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--header-text-color);
  }
}
</style>

<template>
  <div class="transactions-container">
    <div v-if="loading" class="skeleton-box title-skeleton"></div>
    <div v-else class="transactions-title">
      {{ selectedLanguage == 'English' ? 'Recent Transactions' : 'Son Aktarımlar' }}
    </div>
    <div class="transactions-list">
      <div v-if="loading" class="transaction-header">
        <div class="header-date"><div class="skeleton-box cell-skeleton"></div></div>
        <div class="header-method"><div class="skeleton-box cell-skeleton"></div></div>
        <div class="header-amount"><div class="skeleton-box cell-skeleton"></div></div>
      </div>
      <div v-else class="transaction-header">
        <div class="header-date">{{ selectedLanguage == 'English' ? 'Date' : 'Tarih' }}</div>
        <div class="header-method">{{ selectedLanguage == 'English' ? 'Method' : 'Yöntem' }}</div>
        <div class="header-amount">{{ selectedLanguage == 'English' ? 'Amount' : 'Miktar' }}</div>
      </div>

      <template v-if="loading">
        <div v-for="i in 5" :key="i" class="transaction-item">
          <div class="transaction-date"><div class="skeleton-box cell-skeleton"></div></div>
          <div class="transaction-description"><div class="skeleton-box cell-skeleton"></div></div>
          <div class="transaction-amount"><div class="skeleton-box cell-skeleton"></div></div>
        </div>
      </template>
      <template v-else>
        <div v-for="(transaction, index) in transactions" :key="index" class="transaction-item">
          <div class="transaction-date">{{ formatDate(transaction.created) }}</div>
          <div class="transaction-description">{{ transaction.paymentMethod }}</div>
          <div class="transaction-amount">${{ transaction.amount }}</div>
        </div>
        <div v-if="!transactions || transactions.length === 0" class="no-transactions">
          {{
            selectedLanguage == 'English'
              ? '💸 No transactions available 💸'
              : '💸 Hiçbir aktarım yok 💸'
          }}
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'UIExpenseTransactionsComponent',
  props: {
    recentTransactions: {
      type: Array as () => {
        amount: number
        created: string
        createdBy: string
        id: number
        isRecurring: boolean
        lastModified: string
        lastModifiedBy: string
        paymentMethod: string
        name: string
      }[],
      default: () => [],
    },
    selectedLanguage: {
      type: String,
      default: 'English',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      transactions: [] as {
        amount: number
        created: string
        createdBy: string
        id: number
        isRecurring: boolean
        lastModified: string
        lastModifiedBy: string
        paymentMethod: string
        name: string
      }[],
    }
  },

  methods: {
    formatDate(dateString: string) {
      const date = new Date(dateString)
      return date.toLocaleDateString(this.selectedLanguage === 'English' ? 'en-US' : 'tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    },
  },

  mounted() {
    this.transactions = this.recentTransactions
  },

  watch: {
    recentTransactions: {
      immediate: true,
      handler(newValue) {
        this.transactions = newValue
      },
    },
  },
}
</script>

<style scoped lang="scss">
.transactions-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 80%;
  background-color: var(--background-color-soft);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  padding: 1rem 2rem;

  .transactions-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--header-text-color);
  }

  .title-skeleton {
    width: 200px;
    height: 1.5rem;
    margin-bottom: 1rem;
    border-radius: 4px;
  }

  .cell-skeleton {
    width: 80%;
    height: 1rem;
    border-radius: 4px;
  }

  .transactions-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 0.75rem;

    .transaction-header {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      padding: 0 1rem 0.5rem;
      border-bottom: 1px solid var(--border-color);
      font-weight: 600;
      color: var(--header-text-color);
      font-size: 0.9rem;

      .header-amount {
        text-align: right;
        color: var(--normal-text-color);
        font-size: 0.9rem;
      }
      .header-date {
        color: var(--normal-text-color);
        font-size: 0.9rem;
      }
      .header-method {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.9rem;
        color: var(--normal-text-color);
      }
    }

    .transaction-item {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      background-color: var(--background-color);
      border-radius: var(--border-radius);
      padding: 1rem;
      margin-bottom: 0.5rem;
      align-items: center;

      .transaction-date {
        color: var(--normal-text-color);
        font-size: 1rem;
      }

      .transaction-description {
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 500;
        font-size: 1rem;
        color: var(--normal-text-color);
      }

      .transaction-amount {
        font-weight: 600;
        color: var(--primary-red-color);
        font-size: 1rem;
        text-align: right;
      }
    }

    .no-transactions {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      padding: 1rem;
      font-size: 1.2rem;
      color: var(--normal-text-color);
    }
  }
}
</style>

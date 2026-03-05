<template>
  <div class="transactions-container">
    <div class="transactions-title">
      {{ selectedLanguage == 'English' ? 'Recent Transactions' : 'Son Aktarımlar' }}
    </div>
    <div class="transactions-list">
      <div class="transaction-header">
        <div class="header-date">{{ selectedLanguage == 'English' ? 'Date' : 'Tarih' }}</div>
        <div class="header-method">{{ selectedLanguage == 'English' ? 'Method' : 'Yöntem' }}</div>
        <div class="header-amount">{{ selectedLanguage == 'English' ? 'Amount' : 'Miktar' }}</div>
      </div>

      <div
        v-for="(transaction, index) in incomeRecentTransactions"
        :key="index"
        class="transaction-item"
      >
        <div class="transaction-date">{{ formatDate(transaction.created) }}</div>
        <div class="transaction-description">{{ transaction.method }}</div>
        <div class="transaction-amount">${{ transaction.amount }}</div>
      </div>
      <div
        v-if="!incomeRecentTransactions || incomeRecentTransactions.length === 0"
        class="no-transactions"
      >
        {{
          selectedLanguage == 'English'
            ? '💸 No transactions available 💸'
            : '💸 Hiçbir aktarım yok 💸'
        }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'UIIncomeTransactionsComponent',
  props: {
    incomeRecentTransactions: {
      type: Array as () => {
        amount: number
        created: string
        createdBy: string
        id: number
        isRecurring: boolean
        lastModified: string
        lastModifiedBy: string
        method: string
        name: string
      }[],
    },
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },
  methods: {
    formatDate(dateString: string): string {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
      return new Date(dateString).toLocaleDateString(this.selectedLanguage, options)
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
        color: var(--primary-green-color);
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
@media (max-width: 768px) {
  .transactions-container {
    padding: 0.5rem 1rem;
    .transactions-title {
      font-size: 1.2rem;
    }

    .transactions-list {
      // Corrected from .transaction-list
      .transaction-header, // Apply to both header and item
      .transaction-item {
        grid-template-columns: auto 1fr auto; // Adjust column sizing: Date and Amount fit content, Method takes remaining space
      }

      .transaction-header {
        font-size: 0.8rem;
        padding: 0 0.5rem 0.5rem;

        .header-amount {
          font-size: 0.8rem;
        }
        .header-date {
          font-size: 0.8rem;
        }
        .header-method {
          font-size: 0.8rem;
          word-break: break-word; // Allow long method names to wrap
          text-align: center; // Center text if it wraps
        }
      }
      .transaction-item {
        padding: 0.5rem;
        margin-bottom: 0.25rem;

        .transaction-date {
          font-size: 0.8rem;
          word-break: break-word; // Allow long dates to wrap if necessary
        }

        .transaction-description {
          font-size: 0.8rem;
          word-break: break-word; // Allow long descriptions to wrap
          text-align: center; // Center text if it wraps
        }

        .transaction-amount {
          font-size: 0.8rem;
        }
      }
    }
  }
}
</style>

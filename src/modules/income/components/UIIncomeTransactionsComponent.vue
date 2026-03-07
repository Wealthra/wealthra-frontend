<template>
  <div class="transactions-container">
    <h1 class="transactions-title">
      {{ selectedLanguage == 'English' ? 'Recent Transactions' : 'Son Aktarımlar' }}
    </h1>
    <div class="table-wrap" :class="{ 'table-wrap--empty': isTableEmpty }">
      <div
        v-if="incomeRecentTransactions && incomeRecentTransactions.length > 0"
        class="table"
        role="table"
      >
        <div class="table-header" role="row">
          <div class="col col-date" role="columnheader">
            {{ selectedLanguage == 'English' ? 'Date' : 'Tarih' }}
          </div>
          <div class="col col-method" role="columnheader">
            {{ selectedLanguage == 'English' ? 'Method' : 'Yöntem' }}
          </div>
          <div class="col col-amount" role="columnheader">
            {{ selectedLanguage == 'English' ? 'Amount' : 'Miktar' }}
          </div>
        </div>
        <div
          v-for="(transaction, index) in incomeRecentTransactions"
          :key="index"
          class="table-row"
          role="row"
        >
          <div class="col col-date">{{ formatDate(transaction.created) }}</div>
          <div class="col col-method">{{ transaction.method }}</div>
          <div class="col col-amount">${{ transaction.amount }}</div>
        </div>
      </div>
      <div v-if="isTableEmpty" class="empty-state">
        <div class="empty-state__icon-wrap">
          <font-awesome-icon :icon="emptyStateIcons.transactions" class="empty-state__icon" aria-hidden="true" />
        </div>
        <h2 class="empty-state__heading">
          {{ selectedLanguage == 'English' ? 'No transactions yet' : 'Henüz aktarım yok' }}
        </h2>
        <p class="empty-state__text">
          {{
            selectedLanguage == 'English'
              ? 'Recent income transactions will appear here once you add sources and record activity.'
              : 'Gelir kaynağı ekleyip işlem yaptığınızda son aktarımlar burada görünecek.'
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { emptyStateIcons } from '@/icons/fontawesome-icons'

export default {
  name: 'UIIncomeTransactionsComponent',
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      emptyStateIcons,
    }
  },
  computed: {
    isTableEmpty(): boolean {
      const t = this.incomeRecentTransactions
      return !t || !Array.isArray(t) || t.length === 0
    },
  },
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
  flex: 1;
  min-height: 0;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: 1.5rem 1.25rem;

  .transactions-title {
    flex-shrink: 0;
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 1rem;
    color: var(--header-text-color);
  }

  .table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    &.table-wrap--empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .table {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .table-header {
    display: grid;
    grid-template-columns: 1fr 1fr minmax(5rem, auto);
    gap: 1rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--border-color);
    font-weight: 600;
    font-size: 0.75rem;
    color: var(--normal-text-color);
  }

  .table-row {
    display: grid;
    grid-template-columns: 1fr 1fr minmax(5rem, auto);
    gap: 1rem;
    padding: 0.7rem 1rem;
    align-items: center;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }
  }

  .col {
    min-width: 0;
  }

  .col-date {
    font-size: 0.75rem;
    color: var(--normal-text-color);
  }

  .col-method {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--header-text-color);
  }

  .col-amount {
    font-weight: 600;
    color: var(--primary-green-color);
    font-size: 0.8125rem;
    text-align: right;
  }

  .empty-state {
    flex: 1;
    min-height: 16rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    text-align: center;
    padding: 3rem 2rem;
  }

  .empty-state__icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 5.5rem;
    height: 5.5rem;
    border-radius: var(--border-radius);
    background-color: rgba(92, 184, 92, 0.12);
    color: var(--primary-green-color);
    margin-bottom: 1.5rem;
  }

  .empty-state__icon {
    font-size: 2.5rem;
  }

  .empty-state__heading {
    margin: 0 0 0.75rem;
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--header-text-color);
  }

  .empty-state__text {
    margin: 0;
    font-size: 1rem;
    font-weight: 400;
    color: var(--normal-text-color);
    max-width: 24rem;
    line-height: 1.5;
  }
}

@media (max-width: 1024px) {
  .transactions-container {
    flex: 1 1 auto;
    min-height: 0;
    height: auto;
  }

  .table-wrap {
    min-height: 12rem;
  }
}

@media (max-width: 768px) {
  .transactions-container {
    padding: 1rem;
    min-height: 0;
    height: auto;

    .transactions-title {
      font-size: 1.125rem;
      margin-bottom: 0.75rem;
    }

    .table-wrap {
      overflow-x: auto;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      min-height: 10rem;
    }

    .table {
      min-width: 16rem;
    }

    .table-header,
    .table-row {
      grid-template-columns: 1fr 1fr minmax(4rem, auto);
      gap: 0.5rem;
      padding: 0.6rem 0.5rem;
    }

    .table-header {
      font-size: 0.7rem;
    }

    .col-date,
    .col-method,
    .col-amount {
      font-size: 0.75rem;
    }

    .empty-state {
      min-height: 14rem;
      padding: 2rem 1.5rem;
    }
    .empty-state__icon-wrap {
      width: 4.5rem;
      height: 4.5rem;
      margin-bottom: 1.25rem;
    }
    .empty-state__icon {
      font-size: 2rem;
    }
    .empty-state__heading {
      font-size: 1.2rem;
    }
    .empty-state__text {
      font-size: 0.9375rem;
    }
  }
}
</style>

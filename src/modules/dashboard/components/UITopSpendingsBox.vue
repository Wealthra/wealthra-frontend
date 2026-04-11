<template>
  <div class="top-spendings-box">
    <div class="card-header">
      <div v-if="loading" class="skeleton-box title-skeleton"></div>
      <h3 v-else class="card-title">{{ title }}</h3>
    </div>

    <div v-if="loading" class="spendings-list">
      <div v-for="i in 5" :key="i" class="spending-row skeleton-item">
        <div class="row-main">
          <div class="skeleton-box category-icon-skeleton"></div>
          <div class="spending-info">
            <div class="info-top">
              <div class="skeleton-box category-name-skeleton"></div>
              <div class="skeleton-box transaction-count-skeleton"></div>
            </div>
            <div class="skeleton-box progress-track-skeleton"></div>
          </div>
        </div>
        <div class="skeleton-box amount-skeleton"></div>
      </div>
    </div>

    <div v-else-if="spendingsData.length === 0" class="empty-state">
      <font-awesome-icon icon="fas fa-wallet" class="empty-icon" />
      <p>{{ selectedLanguage === 'English' ? 'No spendings data' : 'Harcama verisi yok' }}</p>
    </div>

    <div v-else class="spendings-list">
      <div 
        v-for="spending in spendingsData" 
        :key="spending.categoryName" 
        class="spending-row"
      >
        <div class="row-main">
          <div class="category-icon-wrap" :style="{ backgroundColor: spending.color + '15', color: spending.color }">
            <font-awesome-icon :icon="getIcon(spending.categoryName)" />
          </div>

          <div class="spending-info">
            <div class="info-top">
              <span class="category-name">{{ spending.categoryName }}</span>
              <span class="transaction-count">
                {{ spending.transactionCount }} {{ selectedLanguage === 'English' ? 'transactions' : 'işlem' }}
              </span>
            </div>
            <div class="progress-track">
              <div 
                class="progress-fill" 
                :style="{ width: getRelativeWidth(spending.totalAmount) + '%', backgroundColor: spending.color }"
              ></div>
            </div>
          </div>
        </div>

        <div class="amount-wrap">
          <span class="amount-value">{{ formatCurrency(spending.totalAmount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { Spendings } from '@/interfaces/Spendings'
import { getCategoryColorByIndex } from '@/utils/chartCategoryPalette'
import { transactionCategoryIconMap } from '@/icons/fontawesome-icons'
import { useCurrency } from '@/composables/useCurrency'

export default {
  name: 'UITopSpendingsBox',
  props: {
    spendings: {
      type: Array as () => Array<Spendings>,
      required: true,
    },
    title: {
      type: String,
      default: 'Top Spendings',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },
  setup() {
    const { formatCurrency } = useCurrency()
    return { formatCurrency }
  },
  data() {
    return {
      spendingsData: [] as Array<Spendings>,
    }
  },
  computed: {
    maxAmount(): number {
      if (this.spendingsData.length === 0) return 1
      return Math.max(...this.spendingsData.map(s => s.totalAmount))
    }
  },
  methods: {
    processSpendingsData() {
      if (!this.spendings || !Array.isArray(this.spendings)) {
        this.spendingsData = []
        return
      }
      this.spendingsData = this.spendings.map((s, index) => ({
        ...s,
        color: s.color || getCategoryColorByIndex(index),
      }))
    },
    getIcon(categoryName: string) {
      const cat = categoryName.toLowerCase()
      for (const [key, icon] of Object.entries(transactionCategoryIconMap)) {
        if (cat.includes(key)) return icon
      }
      return transactionCategoryIconMap.default
    },
    formatCurrency(amount: number) {
      return this.formatCurrency(amount, 0)
    },
    getRelativeWidth(amount: number) {
      return (amount / this.maxAmount) * 100
    }
  },
  watch: {
    spendings: {
      handler: 'processSpendingsData',
      immediate: true,
    },
  },
}
</script>

<style scoped lang="scss">

.top-spendings-box {
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
    margin-bottom: 1.5rem;
    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--header-text-color);
      margin: 0;
    }
  }

  .spendings-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    overflow-y: auto;
    padding-right: 0.25rem;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
  }

  /* Skeleton Styles */
  .category-icon-skeleton {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .category-name-skeleton {
    width: 100px;
    height: 0.9rem;
  }

  .transaction-count-skeleton {
    width: 60px;
    height: 0.7rem;
  }

  .progress-track-skeleton {
    width: 100%;
    height: 6px;
    border-radius: 999px;
  }

  .amount-skeleton {
    width: 60px;
    height: 0.95rem;
  }

  .spending-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
  }

  .row-main {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0;
  }

  .category-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .spending-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 0;

    .info-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .category-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--header-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .transaction-count {
      font-size: 0.7rem;
      color: var(--normal-text-color);
      font-weight: 500;
    }

    .progress-track {
      width: 100%;
      height: 6px;
      background-color: var(--background-color-soft);
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
    }
  }

  .amount-wrap {
    text-align: right;
    flex-shrink: 0;

    .amount-value {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--header-text-color);
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

@media (max-width: 768px) {
  .top-spendings-box {
    padding: 1rem;
    .spending-row { gap: 1rem; }
  }
}
</style>


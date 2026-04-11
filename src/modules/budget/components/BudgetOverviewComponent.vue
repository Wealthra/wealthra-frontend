<template>
  <div class="budget-overview-component-c">
    <div class="budget-overview-component">
      <div v-if="loading" class="skeleton-box title-skeleton"></div>
      <div v-else class="budget-overview-component-title">
        {{ budgetOverviewText }}
      </div>

      <div class="budget-overview-component-content">
        <template v-if="loading">
          <div v-if="!isMobile" class="skeleton-box amount-skeleton"></div>
          <div v-if="!isMobile" class="skeleton-box progress-bar-skeleton"></div>
          <div v-if="isMobile" class="skeleton-box doughnut-skeleton"></div>
          <div v-if="!isMobile" class="skeleton-box percentage-skeleton"></div>
        </template>
        <template v-else>
          <div v-if="!isMobile" class="budget-overview-component-amount">
            {{ budgetAmount }}
          </div>
          <!-- Desktop: progress bar -->
          <div v-if="!isMobile" class="budget-overview-component-progress-bar">
            <div
              class="budget-overview-component-progress-bar-fill"
              :style="{ width: progressBarWidthPercentage + '%' }"
            ></div>
          </div>
          <!-- Mobile only: doughnut chart + center text -->
          <div v-if="isMobile" class="budget-overview-doughnut-wrap">
            <Doughnut
              ref="doughnutRef"
              :data="doughnutData"
              :options="doughnutOptions"
              class="budget-overview-doughnut"
            />
            <div class="budget-overview-doughnut-center" aria-hidden="true">
              {{ centerText }}
            </div>
          </div>
          <div v-if="!isMobile" class="budget-overview-component-percentage">{{ displayPercentage }}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { budgetTexts } from '@/data/budgetTexts'
import { useCurrency } from '@/composables/useCurrency'

ChartJS.register(ArcElement, CategoryScale, LinearScale, Tooltip)

const MOBILE_BREAKPOINT = 768

export default {
  name: 'BudgetOverviewComponent',

  components: {
    Doughnut,
  },

  props: {
    selectedLanguage: {
      type: String,
      default: 'English',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    limitAmount: {
      type: Number,
      default: 0,
    },
  },

  setup() {
    const { formatCurrency } = useCurrency()
    return { formatCurrency }
  },

  data() {
    return {
      isMobile: false,
      activeSegmentIndex: null as number | null,
    }
  },

  computed: {
    percentageValue(): number {
      if (this.limitAmount === 0) {
        return 0
      }
      return (this.currentAmount / this.limitAmount) * 100
    },

    progressBarWidthPercentage(): number {
      return Math.min(this.percentageValue, 100)
    },

    displayPercentage(): string {
      return this.percentageValue.toFixed(1) + '%'
    },

    budgetOverviewText() {
      const texts = budgetTexts[this.selectedLanguage as 'English' | 'Turkish']
      return (texts as Record<string, string>).overviewTitle ?? 'Monthly Budget Overview'
    },

    budgetAmount() {
      return `${this.formatCurrency(this.currentAmount)} / ${this.formatCurrency(this.limitAmount)}`
    },

    centerText(): string {
      if (this.activeSegmentIndex === 0) {
        return `${this.formatCurrency(this.currentAmount)} / ${this.formatCurrency(this.limitAmount)}`
      }
      if (this.activeSegmentIndex === 1) {
        const remaining = Math.max(0, this.limitAmount - this.currentAmount)
        return `${this.formatCurrency(remaining)} / ${this.formatCurrency(this.limitAmount)}`
      }
      return this.displayPercentage
    },

    doughnutData() {
      const used = Math.min(100, Math.max(0, this.percentageValue))
      const remaining = Math.max(0, 100 - used)
      const root = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null
      const usedColor = root?.getPropertyValue('--primary-yellow-color').trim() || '#f0ad4e'
      const remainingColor = root?.getPropertyValue('--background-color-soft').trim() || '#e9ecef'
      return {
        labels: ['Used', 'Remaining'],
        datasets: [
          {
            data: [used, remaining],
            backgroundColor: [usedColor, remainingColor],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      }
    },

    doughnutOptions() {
      const fmt = (n: number) => n.toLocaleString('en-US')
      const limit = this.limitAmount
      const used = this.currentAmount
      const remaining = Math.max(0, limit - used)
      const pctUsed = this.percentageValue
      const pctRemaining = Math.max(0, 100 - pctUsed)
      return {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        onClick: (_: unknown, elements: { index: number }[]) => {
          if (elements.length) {
            const idx = elements[0].index
            this.activeSegmentIndex = this.activeSegmentIndex === idx ? null : idx
          } else {
            this.activeSegmentIndex = null
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context: { dataIndex: number }) => {
                if (context.dataIndex === 0) {
                  return `Used: ${this.formatCurrency(used)} / ${this.formatCurrency(limit)} (${pctUsed.toFixed(1)}%)`
                }
                return `Remaining: ${this.formatCurrency(remaining)} (${pctRemaining.toFixed(1)}%)`
              },
            },
          },
        },
      }
    },
  },

  mounted() {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    this.isMobile = mql.matches
    mql.addEventListener('change', (e) => {
      this.isMobile = e.matches
    })
  },
}
</script>

<style scoped lang="scss">

.budget-overview-component-c {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: 1.5rem 1.25rem;
  box-sizing: border-box;

  .budget-overview-component {
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 1rem;

    .title-skeleton {
      width: 200px;
      height: 1.5rem;
    }

    .amount-skeleton {
      width: 120px;
      height: 1.25rem;
      flex-shrink: 0;
    }

    .progress-bar-skeleton {
      flex-grow: 1;
      height: 22px;
    }

    .doughnut-skeleton {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      margin: 0 auto;
    }

    .percentage-skeleton {
      width: 50px;
      height: 1.25rem;
      flex-shrink: 0;
    }

    .budget-overview-component-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
      color: var(--header-text-color);
      flex-shrink: 0;
    }

    .budget-overview-component-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 1.5rem;
      flex-wrap: wrap;

      .budget-overview-component-amount {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: auto;
        font-weight: 600;
        font-size: 1.125rem;
        color: var(--normal-text-color);
        flex-shrink: 0;
      }

      .budget-overview-component-progress-bar {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-grow: 1;
        min-width: 0;
        height: 22px;
        border-radius: var(--border-radius);
        overflow: hidden;
        background-color: var(--background-color-soft);
      }

      .budget-overview-component-progress-bar-fill {
        height: 100%;
        background-color: var(--primary-yellow-color);
        border-radius: var(--border-radius);
        transition: width 0.3s ease-in-out;
      }

      .budget-overview-component-percentage {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: auto;
        font-weight: 600;
        font-size: 1.125rem;
        color: var(--normal-text-color);
        flex-shrink: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .budget-overview-component-c {
    padding: 0.875rem 1rem;
    border-radius: var(--border-radius);
  }

  .budget-overview-component {
    width: 100%;
    min-width: 0;
    gap: 0.75rem;

    .budget-overview-component-title {
      display: none;
    }

    .budget-overview-component-content {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      min-width: 0;
      gap: 0.75rem;
    }

    .budget-overview-component-amount {
      width: 100%;
      min-width: 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--header-text-color);
      text-align: left;
      line-height: 1.4;
      word-break: break-word;
    }

    .budget-overview-component-progress-bar {
      width: 100%;
      min-width: 0;
      height: 12px;
      flex-shrink: 0;
      border-radius: 6px;
    }

    .budget-overview-component-progress-bar-fill {
      border-radius: 6px;
    }

    .budget-overview-component-percentage {
      width: 100%;
      min-width: 0;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--normal-text-color);
      text-align: left;
    }

    .budget-overview-doughnut-wrap {
      position: relative;
      width: 100%;
      min-width: 0;
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
    }

    .budget-overview-doughnut {
      max-width: 200px;
      max-height: 200px;
    }

    .budget-overview-doughnut-center {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      font-weight: 700;
      font-size: 0.9375rem;
      color: var(--header-text-color);
      text-align: center;
      line-height: 1.2;
      padding: 0.5rem;
    }
  }
}
</style>

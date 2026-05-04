<template>
  <div class="goals-overview-component-c">
    <div class="goals-overview-component">
      <div class="goals-overview-component-title-row">
        <template v-if="loading">
          <div class="skeleton-box title-skeleton"></div>
          <div class="skeleton-box stats-skeleton"></div>
        </template>
        <template v-else>
          <div class="goals-overview-header-inner">
            <div class="goals-overview-titles">
              <div class="goals-overview-component-title">{{ goalsOverviewText }}</div>
              <div v-if="totalGoals != null && totalGoals > 0" class="goals-overview-stats">
                {{ t('totalGoals') }}: {{ isPrivacyMode ? '••' : totalGoals }} · {{ t('achievedGoals') }}: {{ isPrivacyMode ? '••' : achievedGoals }}
              </div>
            </div>
            <button type="button" class="analysis-btn" @click="$emit('showAnalysis')">
              <font-awesome-icon icon="chart-simple" />
              <span>{{ t('analysis') }}</span>
            </button>
          </div>
        </template>
      </div>
      <div class="goals-overview-component-content">
        <template v-if="loading">
          <div v-if="!isMobile" class="goals-overview-skeleton-row">
            <div class="skeleton-box amount-skeleton"></div>
            <div class="skeleton-box progress-skeleton"></div>
            <div class="skeleton-box percent-skeleton"></div>
          </div>
          <div v-if="isMobile" class="skeleton-box doughnut-skeleton"></div>
        </template>
        <template v-else>
          <div v-if="!isMobile" class="goals-overview-component-amount">
            {{ goalAmount }}
          </div>
          <!-- Desktop: progress bar -->
          <div v-if="!isMobile" class="goals-overview-component-progress-bar">
            <div
              class="goals-overview-component-progress-bar-fill"
              :style="{ width: isPrivacyMode ? '0%' : (progressBarWidthPercentage + '%') }"
            ></div>
          </div>
          <!-- Mobile only: doughnut chart + center text -->
          <div v-if="isMobile" class="goals-overview-doughnut-wrap">
            <Doughnut
              ref="doughnutRef"
              :data="doughnutData"
              :options="doughnutOptions"
              class="goals-overview-doughnut"
            />
            <div class="goals-overview-doughnut-center" aria-hidden="true">
              {{ isPrivacyMode ? '••••' : centerText }}
            </div>
          </div>
          <div v-if="!isMobile" class="goals-overview-component-percentage">{{ isPrivacyMode ? '••%' : displayPercentage }}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { goalsTexts } from '@/data/goalsTexts'
import { useCurrency } from '@/composables/useCurrency'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

ChartJS.register(ArcElement, CategoryScale, LinearScale, Tooltip)

const MOBILE_BREAKPOINT = 768

export default defineComponent({
  name: 'GoalsOverviewComponent',

  setup() {
    const { formatCurrency, isPrivacyMode } = useCurrency()
    return { formatCurrency, isPrivacyMode }
  },

  components: {
    Doughnut,
    FontAwesomeIcon,
  },

  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    limitAmount: {
      type: Number,
      default: 0,
    },
    totalGoals: {
      type: Number,
      default: 0,
    },
    achievedGoals: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    t(key: keyof typeof goalsTexts.English) {
      const texts = goalsTexts[this.selectedLanguage as 'English' | 'Turkish']
      return (texts as Record<string, string>)[key] ?? key
    },
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

    goalsOverviewText(): string {
      const texts = goalsTexts[this.selectedLanguage as 'English' | 'Turkish']
      return (texts as Record<string, string>).overviewTitle ?? 'Goals Overview'
    },

    goalAmount(): string {
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
        labels: ['Current', 'Remaining'],
        datasets: [
          {
            data: this.isPrivacyMode ? [0, 100] : [used, remaining],
            backgroundColor: this.isPrivacyMode ? [remainingColor, remainingColor] : [usedColor, remainingColor],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      }
    },

    doughnutOptions() {
      void this.isPrivacyMode // Trigger reactivity
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
                  return `Current: ${this.formatCurrency(used)} / ${this.formatCurrency(limit)} (${pctUsed.toFixed(1)}%)`
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
})
</script>

<style scoped lang="scss">
.goals-overview-component-c {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: 0.75rem 1rem;
  box-sizing: border-box;

  .goals-overview-component {
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 0.5rem;

    .goals-overview-component-title-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 1rem;
      flex-shrink: 0;
    }

    .goals-overview-header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .goals-overview-titles {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
      flex: 1;
    }

    .analysis-btn {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--primary-yellow-color, #f0ad4e);
      color: #1a1a1a;
      border: none;
      padding: 0.35rem 0.65rem;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: filter 0.2s;
      flex-shrink: 0;

      &:hover {
        filter: brightness(1.08);
      }

      @media (max-width: 768px) {
        padding: 0.4rem 0.75rem;
        font-size: 0.75rem;
      }
    }

    .goals-overview-component-title {
      font-size: 1rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.25;
      color: var(--header-text-color);
      flex-shrink: 0;
      min-width: 150px;
    }

    .title-skeleton {
      width: 140px;
      height: 1rem;
      border-radius: 4px;
    }

    .stats-skeleton {
      width: 180px;
      height: 0.8rem;
      border-radius: 4px;
    }

    .amount-skeleton {
      width: 160px;
      height: 1.15rem;
      border-radius: 4px;
    }

    .progress-skeleton {
      flex: 1;
      height: 14px;
      border-radius: 999px;
    }

    .percent-skeleton {
      width: 52px;
      height: 1.15rem;
      border-radius: 4px;
    }

    .goals-overview-skeleton-row {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 1rem;
    }

    .doughnut-skeleton {
      width: 100%;
      height: 150px;
      border-radius: 8px;
    }

    .goals-overview-component-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 1rem;
      flex-wrap: wrap;

      .goals-overview-component-amount {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: auto;
        font-weight: 700;
        font-size: 1rem;
        color: var(--header-text-color);
        flex-shrink: 0;
        letter-spacing: -0.02em;
        line-height: 1.2;
      }

      .goals-overview-component-progress-bar {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-grow: 1;
        min-width: 0;
        height: 14px;
        border-radius: 999px;
        background-color: var(--background-color-soft);
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .goals-overview-component-progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary-yellow-color), var(--primary-green-color));
        border-radius: 999px;
        transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        box-shadow: 0 0 10px rgba(92, 184, 92, 0.3);
      }

      .goals-overview-component-percentage {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: auto;
        font-weight: 700;
        font-size: 1rem;
        color: var(--primary-green-color);
        flex-shrink: 0;
        line-height: 1.2;
        min-width: 3.25rem;
        text-align: right;
      }
    }

    .goals-overview-stats {
      font-size: 0.75rem;
      line-height: 1.3;
      color: var(--normal-text-color);
      flex-shrink: 0;
    }
  }
}

@media (max-width: 768px) {
  .goals-overview-component-c {
    padding: 0.65rem 0.875rem;
    border-radius: var(--border-radius);
  }

  .goals-overview-component {
    width: 100%;
    min-width: 0;
    gap: 0.5rem;

    .goals-overview-component-title-row {
      width: 100%;
    }

    .goals-overview-component-title {
      display: none;
    }

    .goals-overview-component-content {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      min-width: 0;
      gap: 0.5rem;
    }

    .goals-overview-component-amount {
      width: 100%;
      min-width: 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--header-text-color);
      text-align: left;
      line-height: 1.4;
      word-break: break-word;
    }

    .goals-overview-component-progress-bar {
      width: 100%;
      min-width: 0;
      height: 12px;
      flex-shrink: 0;
      border-radius: 6px;
    }

    .goals-overview-component-progress-bar-fill {
      border-radius: 6px;
    }

    .goals-overview-component-percentage {
      width: 100%;
      min-width: 0;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--normal-text-color);
      text-align: left;
    }

    .goals-overview-doughnut-wrap {
      position: relative;
      width: 100%;
      min-width: 0;
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
    }

    .goals-overview-doughnut {
      max-width: 200px;
      max-height: 200px;
    }

    .goals-overview-doughnut-center {
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

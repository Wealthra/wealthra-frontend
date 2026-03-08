<template>
  <div class="goals-overview-component-c">
    <div class="goals-overview-component">
      <div class="goals-overview-component-title-row">
        <div class="goals-overview-component-title">
          {{ goalsOverviewText }}
        </div>
        <div v-if="totalGoals != null && totalGoals > 0" class="goals-overview-stats">
          {{ t('totalGoals') }}: {{ totalGoals }} · {{ t('achievedGoals') }}: {{ achievedGoals }}
        </div>
      </div>
      <div class="goals-overview-component-content">
        <div v-if="!isMobile" class="goals-overview-component-amount">
          {{ goalAmount }}
        </div>
        <!-- Desktop: progress bar -->
        <div v-if="!isMobile" class="goals-overview-component-progress-bar">
          <div
            class="goals-overview-component-progress-bar-fill"
            :style="{ width: progressBarWidthPercentage + '%' }"
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
            {{ centerText }}
          </div>
        </div>
        <div v-if="!isMobile" class="goals-overview-component-percentage">{{ displayPercentage }}</div>
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
import { goalsTexts } from '@/data/goalsTexts'

ChartJS.register(ArcElement, CategoryScale, LinearScale, Tooltip)

const MOBILE_BREAKPOINT = 768

export default {
  name: 'GoalsOverviewComponent',

  components: {
    Doughnut,
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
      const formatNumber = (num: number) => num.toLocaleString('en-US')
      return `$${formatNumber(this.currentAmount)} / $${formatNumber(this.limitAmount)}`
    },

    centerText(): string {
      const fmt = (n: number) => n.toLocaleString('en-US')
      if (this.activeSegmentIndex === 0) {
        return `${fmt(this.currentAmount)} / ${fmt(this.limitAmount)}`
      }
      if (this.activeSegmentIndex === 1) {
        const remaining = Math.max(0, this.limitAmount - this.currentAmount)
        return `${fmt(remaining)} / ${fmt(this.limitAmount)}`
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
              label: (context: { dataIndex: number; parsed: number }) => {
                if (context.dataIndex === 0) {
                  return `Current: $${fmt(used)} / $${fmt(limit)} (${pctUsed.toFixed(1)}%)`
                }
                return `Remaining: $${fmt(remaining)} (${pctRemaining.toFixed(1)}%)`
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
.goals-overview-component-c {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: 1.5rem 1.25rem;
  box-sizing: border-box;

  .goals-overview-component {
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 1rem;

    .goals-overview-component-title-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 1rem;
      flex-shrink: 0;
    }

    .goals-overview-component-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
      color: var(--header-text-color);
      flex-shrink: 0;
    }

    .goals-overview-component-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 1.5rem;
      flex-wrap: wrap;

      .goals-overview-component-amount {
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

      .goals-overview-component-progress-bar {
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

      .goals-overview-component-progress-bar-fill {
        height: 100%;
        background-color: var(--primary-yellow-color);
        border-radius: var(--border-radius);
        transition: width 0.3s ease-in-out;
      }

      .goals-overview-component-percentage {
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

    .goals-overview-stats {
      font-size: 0.875rem;
      color: var(--normal-text-color);
      flex-shrink: 0;
    }
  }
}

@media (max-width: 768px) {
  .goals-overview-component-c {
    padding: 0.875rem 1rem;
    border-radius: var(--border-radius);
  }

  .goals-overview-component {
    width: 100%;
    min-width: 0;
    gap: 0.75rem;

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
      gap: 0.75rem;
    }

    .goals-overview-component-amount {
      width: 100%;
      min-width: 0;
      font-size: 1.125rem;
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

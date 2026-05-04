<template>
  <div class="goals-overview-card-content">
    <template v-if="loading">
      <div class="goals-chart-area">
        <div class="skeleton-box radial-skeleton">
          <div class="radial-hole">
            <div class="skeleton-box center-text-sm"></div>
            <div class="skeleton-box center-text-lg"></div>
          </div>
        </div>
      </div>
      <div class="goals-detail-footer">
        <div class="skeleton-box footer-row-skeleton"></div>
        <div class="skeleton-box insight-skeleton"></div>
      </div>
    </template>
    
    <template v-else>
      <div class="goals-chart-area">
        <div class="radial-progress-container">
          <Doughnut
            ref="doughnutRef"
            :data="doughnutData"
            :options="doughnutOptions"
            class="radial-chart"
          />
          <div class="radial-center-content">
            <span class="percentage-value">{{ isPrivacyMode ? '••%' : displayPercentage }}</span>
            <span class="percentage-label">{{
              selectedLanguage === 'English' ? 'Saved' : 'Birikim'
            }}</span>
          </div>
        </div>
      </div>

      <div class="goals-detail-footer">
        <div class="amount-row">
          <div class="amount-item current">
            <span class="label">{{ t('currentAmount') }}</span>
            <span class="value">{{ formatCurrency(currentAmount) }}</span>
          </div>
          <div class="amount-divider"></div>
          <div class="amount-item target">
            <span class="label">{{ t('targetAmount') }}</span>
            <span class="value">{{ formatCurrency(limitAmount) }}</span>
          </div>
        </div>

        <div class="insight-message" v-if="limitAmount > 0">
          <font-awesome-icon icon="fas fa-bullseye" class="insight-icon" />
          <span class="insight-text">{{ motivationalQuote }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { goalsTexts } from '@/data/goalsTexts'
import { useCurrency } from '@/composables/useCurrency'

ChartJS.register(ArcElement, CategoryScale, LinearScale, Tooltip)

export default {
  name: 'UIGoalsOverviewCard',
  components: {
    Doughnut,
  },
  setup() {
    const { formatCurrency, currencySymbol, isPrivacyMode } = useCurrency()
    return { formatCurrency, currencySymbol, isPrivacyMode }
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
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
  computed: {
    percentageValue(): number {
      if (this.limitAmount === 0) return 0
      return (this.currentAmount / this.limitAmount) * 100
    },
    displayPercentage(): string {
      return this.percentageValue.toFixed(0) + '%'
    },
    formattedCurrent(): string {
      return this.formatCurrency(this.currentAmount)
    },
    formattedTarget(): string {
      return this.formatCurrency(this.limitAmount)
    },
    motivationalQuote(): string {
      const pct = this.percentageValue
      if (pct >= 100)
        return this.selectedLanguage === 'English'
          ? 'All goals reached! Amazing work.'
          : 'Tüm hedeflere ulaşıldı! Harika iş.'
      if (pct >= 75)
        return this.selectedLanguage === 'English'
          ? 'You are in the home stretch!'
          : 'Bitiş çizgisine çok yakınsın!'
      if (pct >= 50)
        return this.selectedLanguage === 'English'
          ? 'Halfway there, keep the momentum.'
          : 'Yolu yarıladın, aynı hızla devam.'
      if (pct >= 25)
        return this.selectedLanguage === 'English'
          ? 'Great progress so far!'
          : 'Şimdiye kadar harika ilerleme!'
      return this.selectedLanguage === 'English'
        ? 'Every dollar counts. Keep going!'
        : 'Her kuruşun önemi var. Devam et!'
    },
    doughnutData() {
      const used = Math.min(100, Math.max(0, this.percentageValue))
      const remaining = Math.max(0, 100 - used)

      const root =
        typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null
      const primaryColor = root?.getPropertyValue('--primary-green-color').trim() || '#5cb85c'
      const softColor = root?.getPropertyValue('--background-color-soft').trim() || '#f8f9fa'

      return {
        labels: ['Saved', 'Remaining'],
        datasets: [
          {
            data: this.isPrivacyMode ? [0, 100] : [used, remaining],
            backgroundColor: this.isPrivacyMode ? [softColor, softColor] : [primaryColor, softColor],
            borderWidth: 0,
            circumference: 360,
            rotation: 0,
            cutout: '82%',
            borderRadius: (!this.isPrivacyMode && used > 0) ? 10 : 0,
          },
        ],
      }
    },
    doughnutOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      }
    },
  },
}
</script>

<style scoped lang="scss">

.goals-overview-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 1rem;

  /* Chart Area */
  .goals-chart-area {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 180px;
    position: relative;
    margin-bottom: 1.5rem;

    .radial-skeleton {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;

      .radial-hole {
        width: 130px;
        height: 130px;
        background: var(--background-color);
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
      }

      .center-text-sm {
        width: 30px;
        height: 0.5rem;
      }
      .center-text-lg {
        width: 60px;
        height: 1.5rem;
      }
    }

    .radial-progress-container {
      position: relative;
      width: 100%;
      height: 100%;
      max-width: 160px;
      max-height: 160px;
    }

    .radial-center-content {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;

      .percentage-value {
        font-size: 2.2rem;
        font-weight: 800;
        color: var(--header-text-color);
        line-height: 1;
      }
      .percentage-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--normal-text-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 2px;
      }
    }
  }

  /* Footer Section: Details and Insights */
  .goals-detail-footer {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-top: auto;

    .footer-row-skeleton {
      width: 100%;
      height: 3rem;
      border-radius: var(--border-radius);
    }

    .insight-skeleton {
      width: 100%;
      height: 2.5rem;
      border-radius: var(--border-radius);
    }

    .amount-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--background-color-soft);
      padding: 0.75rem 1rem;
      border-radius: var(--border-radius);
    }

    .amount-item {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .label {
        font-size: 0.65rem;
        font-weight: 600;
        color: var(--normal-text-color);
        text-transform: uppercase;
      }
      .value {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--header-text-color);
      }

      &.target {
        align-items: flex-end;
      }
    }

    .amount-divider {
      width: 1px;
      height: 24px;
      background-color: var(--border-color);
    }

    .insight-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background-color: rgba(92, 184, 92, 0.05);
      border-radius: var(--border-radius);
      border: 1px dashed rgba(92, 184, 92, 0.2);

      .insight-icon {
        color: var(--primary-green-color);
        font-size: 0.9rem;
      }
      .insight-text {
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--normal-text-color);
        line-height: 1.4;
      }
    }
  }
}

canvas {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.02));
}
</style>


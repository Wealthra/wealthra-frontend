<template>
  <div class="line-chart-container" ref="containerRef">
    <div v-if="loading" class="chart-skeleton">
      <div class="skeleton-header">
        <div class="skeleton-box legend-skeleton"></div>
        <div class="skeleton-box legend-skeleton"></div>
      </div>
      <div class="skeleton-svg-wrapper">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" class="skeleton-svg">
          <defs>
            <linearGradient id="shimmerGradient" x1="-1" x2="0" y1="0" y2="0">
              <stop offset="0%" stop-color="rgba(255,255,255,0)" />
              <stop offset="50%" stop-color="rgba(255,255,255,0.4)" />
              <stop offset="100%" stop-color="rgba(255,255,255,0)" />
              <animate attributeName="x1" from="-1" to="1" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="x2" from="0" to="2" dur="1.5s" repeatCount="indefinite" />
            </linearGradient>
            
            <mask id="shimmerMask">
              <rect x="0" y="0" width="1000" height="400" fill="url(#shimmerGradient)" />
            </mask>
          </defs>

          <!-- Area 1 (Income) -->
          <path d="M0,350 C150,350 250,100 500,120 C750,140 850,50 1000,80 L1000,400 L0,400 Z" class="skeleton-path income"></path>
          <path d="M0,350 C150,350 250,100 500,120 C750,140 850,50 1000,80" class="skeleton-line income"></path>
          
          <!-- Area 2 (Expense) -->
          <path d="M0,380 C150,380 250,280 500,300 C750,320 850,220 1000,250 L1000,400 L0,400 Z" class="skeleton-path expense"></path>
          <path d="M0,380 C150,380 250,280 500,300 C750,320 850,220 1000,250" class="skeleton-line expense"></path>

          <!-- Shimmer Overlay (Applied via mask or overlay rect) -->
          <rect x="0" y="0" width="1000" height="400" fill="url(#shimmerGradient)" style="mix-blend-mode: overlay; pointer-events: none;" />

          <!-- Dots for vertices -->
          <circle cx="500" cy="120" r="5" class="skeleton-dot income"></circle>
          <circle cx="1000" cy="80" r="5" class="skeleton-dot income"></circle>
          <circle cx="500" cy="300" r="5" class="skeleton-dot expense"></circle>
          <circle cx="1000" cy="250" r="5" class="skeleton-dot expense"></circle>
          
          <!-- Grid Lines -->
          <line x1="0" y1="100" x2="1000" y2="100" class="skeleton-grid"></line>
          <line x1="0" y1="200" x2="1000" y2="200" class="skeleton-grid"></line>
          <line x1="0" y1="300" x2="1000" y2="300" class="skeleton-grid"></line>
          
          <line x1="200" y1="0" x2="200" y2="400" class="skeleton-grid"></line>
          <line x1="400" y1="0" x2="400" y2="400" class="skeleton-grid"></line>
          <line x1="600" y1="0" x2="600" y2="400" class="skeleton-grid"></line>
          <line x1="800" y1="0" x2="800" y2="400" class="skeleton-grid"></line>
        </svg>
      </div>
    </div>
    <div v-else-if="!hasData" class="line-chart-no-data">
      {{ noDataText }}
    </div>
    <div v-else class="line-chart-wrapper">
      <Line :data="chartData" :options="chartOptions" class="line-chart" />
    </div>
  </div>
</template>

<script lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js'

import { useCurrency } from '@/composables/useCurrency'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
)

export default {
  name: 'UIIncomeExpenseLineChart',
  components: { Line },
  setup() {
    const { formatCurrency, isPrivacyMode } = useCurrency()
    return { formatCurrency, isPrivacyMode }
  },
  data() {
    return {
      themeKey:
        (typeof document !== 'undefined'
          ? document.documentElement.getAttribute('data-theme')
          : null) || 'light',
      themeObserver: null as MutationObserver | null,
    }
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    labels: {
      type: Array as () => string[],
      default: () => [],
    },
    incomeValues: {
      type: Array as () => number[],
      default: () => [],
    },
    expenseValues: {
      type: Array as () => number[],
      default: () => [],
    },
    incomeLabel: {
      type: String,
      default: 'Income',
    },
    expenseLabel: {
      type: String,
      default: 'Expenses',
    },
    noDataText: {
      type: String,
      default: 'No data available',
    },
  },
  computed: {
    hasData(): boolean {
      return (
        this.labels.length > 0 &&
        (this.incomeValues.some(v => v !== 0) || this.expenseValues.some(v => v !== 0))
      )
    },
    chartData() {
      void this.themeKey
      const root = document.documentElement
      const styles = getComputedStyle(root)
      const green = styles.getPropertyValue('--primary-green-color').trim() || '#5cb85c'
      const red = styles.getPropertyValue('--primary-red-color').trim() || '#ef6464'
      return {
        labels: this.labels,
        datasets: [
          {
            label: this.incomeLabel,
            data: this.incomeValues,
            borderColor: green,
            backgroundColor: green + '20',
            fill: true,
            tension: 0.2,
            pointBackgroundColor: green,
          },
          {
            label: this.expenseLabel,
            data: this.expenseValues,
            borderColor: red,
            backgroundColor: red + '20',
            fill: true,
            tension: 0.2,
            pointBackgroundColor: red,
          },
        ],
      }
    },
    chartOptions() {
      void this.themeKey
      void this.isPrivacyMode // Trigger reactivity on privacy mode change
      const root = document.documentElement
      const styles = getComputedStyle(root)
      return {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio:
          typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1,
        interaction: { intersect: false, mode: 'index' as const },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: styles.getPropertyValue('--border-color').trim() },
            ticks: {
              color: styles.getPropertyValue('--normal-text-color').trim(),
              callback: (value: any) => this.formatCurrency(Number(value)),
            },
          },
          x: {
            grid: { color: styles.getPropertyValue('--border-color').trim() },
            ticks: {
              color: styles.getPropertyValue('--normal-text-color').trim(),
              maxRotation: 45,
              minRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10,
              font: { size: 11 },
            },
            bounds: 'ticks' as const,
          },
        },
        layout: {
          padding: { left: 4, right: 4, top: 0, bottom: 0 },
        },
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              color: styles.getPropertyValue('--header-text-color').trim(),
            },
          },
          tooltip: {
            backgroundColor: styles.getPropertyValue('--background-color-soft').trim(),
            titleColor: styles.getPropertyValue('--header-text-color').trim(),
            bodyColor: styles.getPropertyValue('--normal-text-color').trim(),
            borderColor: styles.getPropertyValue('--border-color').trim(),
            borderWidth: 1,
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || ''
                const value = context.parsed.y
                return ` ${label}: ${this.formatCurrency(value)}`
              },
            },
          },
        },
      }
    },
  },
  mounted() {
    this.themeObserver = new MutationObserver(() => {
      this.themeKey = document.documentElement.getAttribute('data-theme') || 'light'
    })
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
  },
  beforeUnmount() {
    if (this.themeObserver) {
      this.themeObserver.disconnect()
    }
  },
}
</script>

<style scoped lang="scss">
.line-chart-container {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .chart-skeleton {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem;

    .skeleton-header {
      display: flex;
      justify-content: center;
      gap: 1rem;
      .legend-skeleton {
        width: 80px;
        height: 1rem;
        border-radius: 4px;
      }
    }

    .skeleton-svg-wrapper {
      flex: 1;
      width: 100%;
      min-height: 0;
      position: relative;
    }

    .skeleton-svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .skeleton-path, .skeleton-line, .skeleton-dot {
      opacity: 0.4;
      animation: skeleton-pulse 2s infinite ease-in-out;

      &.income {
        fill: rgba(92, 184, 92, 0.08);
        stroke: rgba(92, 184, 92, 0.2);
        &.skeleton-line { fill: none; stroke-width: 3; }
        &.skeleton-dot { fill: rgba(92, 184, 92, 0.4); stroke: none; }
      }
      &.expense {
        fill: rgba(239, 100, 100, 0.08);
        stroke: rgba(239, 100, 100, 0.2);
        animation-delay: 0.5s;
        &.skeleton-line { fill: none; stroke-width: 3; }
        &.skeleton-dot { fill: rgba(239, 100, 100, 0.4); stroke: none; }
      }
    }

    .skeleton-grid {
      stroke: var(--border-color);
      stroke-width: 1;
      opacity: 0.3;
      stroke-dasharray: 4;
    }
  }

  @keyframes skeleton-pulse {
    0% { opacity: 0.3; }
    50% { opacity: 0.6; }
    100% { opacity: 0.3; }
  }

  .line-chart-no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 160px;
    color: var(--normal-text-color);
    font-style: italic;
  }

  .line-chart-wrapper {
    position: relative;
    flex: 1;
    min-height: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .line-chart {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>

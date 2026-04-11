<template>
  <div class="line-chart-container" ref="containerRef">
    <div v-if="loading" class="skeleton-box chart-skeleton"></div>
    <div v-else-if="!hasData" class="line-chart-no-data">
      {{ noDataText }}
    </div>
    <div
      v-else
      ref="chartWrapperRef"
      class="line-chart-wrapper"
      :style="wrapperStyle"
    >
      <Line
        v-if="wrapperReady"
        :data="chartData"
        :options="chartOptions"
        class="line-chart"
      />
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
      wrapperReady: false,
      wrapperWidth: 0,
      _resizeObserver: null as ResizeObserver | null,
      themeKey: (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null) || 'light',
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
      return this.labels.length > 0 && (this.incomeValues.some(v => v !== 0) || this.expenseValues.some(v => v !== 0))
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
    wrapperStyle(): Record<string, string> {
      const w = this.wrapperWidth
      return {
        width: w > 0 ? `${w}px` : '100%',
        height: '100%',
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
        devicePixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1,
        interaction: { intersect: false, mode: 'index' as const },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: styles.getPropertyValue('--border-color').trim() },
            ticks: { 
              color: styles.getPropertyValue('--normal-text-color').trim(),
              callback: (value: any) => this.formatCurrency(Number(value))
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
              }
            }
          },
        },
      }
    },
  },
  mounted() {
    this.$nextTick(() => this.measureAndMountChart())
    this.themeObserver = new MutationObserver(() => {
      this.themeKey = document.documentElement.getAttribute('data-theme') || 'light'
    })
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
  },
  beforeUnmount() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect()
    }
  },
  methods: {
    measureAndMountChart() {
      const el = this.$refs.containerRef as HTMLElement | undefined
      if (!el) return
      const setSize = () => {
        const w = el.clientWidth
        if (w > 0) {
          this.wrapperWidth = w
          if (!this.wrapperReady) this.wrapperReady = true
        }
      }
      setSize()
      this._resizeObserver = new ResizeObserver(setSize)
      this._resizeObserver.observe(el)
    },
  },
}
</script>

<style scoped lang="scss">

.line-chart-container {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 160px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .chart-skeleton {
    width: 100%;
    height: 100%;
    min-height: 200px;
    border-radius: var(--border-radius);
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
    overflow: hidden;
    max-width: 100%;
  }

  .line-chart {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
  }

  :deep(canvas) {
    max-width: 100% !important;
    display: block;
  }
}
</style>


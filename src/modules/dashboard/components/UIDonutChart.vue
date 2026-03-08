<template>
  <div class="chart-container" ref="chartContainer">
    <div class="chart-no-data" v-if="!hasData">
      <div v-if="!hasData" class="no-data-message">
        {{ selectedLanguage == 'English' ? 'No Data Available' : 'Veri Yok' }}
      </div>
    </div>
    <div v-else class="chart-content">
      <h2 class="chart-title">{{ title }}</h2>
      <div class="donut-chart-wrapper">
        <div class="donut-chart">
          <Doughnut
            v-show="hasData"
            :data="chartData"
            :options="chartOptions"
            @click="handleChartClick"
          />
        </div>
      </div>
      <div class="segment-data">
        {{
          isDataOpen
            ? clickedSegment
              ? clickedSegment.name + ' - $' + clickedSegment.value
              : ''
            : computedText
        }}
      </div>
      <div class="legend">
        <div v-for="(category, index) in categoriesData" :key="index" class="legend-item">
          <div class="legend-color" :style="{ backgroundColor: category.color }"></div>
          <div class="legend-label">{{ category.label || category.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

import type { TooltipItem, ChartEvent } from 'chart.js'
import type { SpendingCategories } from '@/interfaces/SpendingCategories'
import { getCategoryColorByIndex } from '@/utils/chartCategoryPalette'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale)

export default {
  name: 'DonutChart',
  components: {
    Doughnut,
  },
  data() {
    return {
      categoriesData: [] as Array<SpendingCategories>,
      clickedSegment: null as SpendingCategories | null,
      isDataOpen: false,
      themeKey: (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null) || 'light',
      themeObserver: null as MutationObserver | null,
    }
  },

  props: {
    title: {
      type: String,
      default: 'Spendings',
    },
    categories: {
      type: Object as () => Record<string, number>,
      required: true,
    },
    donutChartText: {
      type: String,
      default: 'Total: ',
    },
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },

  computed: {
    hasData(): boolean {
      return this.categoriesData && this.categoriesData.length > 0
    },
    total() {
      return this.categoriesData.reduce(
        (sum: number, category: SpendingCategories) => sum + category.value,
        0
      )
    },
    computedText() {
      return this.donutChartText + this.total
    },
    chartData() {
      void this.themeKey
      const root = document.documentElement
      const rootStyles = getComputedStyle(root)
      const borderColor = rootStyles.getPropertyValue('--background-color').trim()

      // Colors are already resolved by getCategoryColorByIndex (theme-dependent)
      const backgroundColors = this.categoriesData.map(
        (item: SpendingCategories) => item.color || '#999'
      )
      const hoverColors = [...backgroundColors]

      return {
        labels: this.categoriesData.map((item: SpendingCategories) => item.name),
        datasets: [
          {
            data: this.categoriesData.map((item: SpendingCategories) => item.value),
            backgroundColor: backgroundColors,
            hoverBackgroundColor: hoverColors,
            borderColor,
            borderWidth: 1,
            hoverOffset: 8,
          },
        ],
      }
    },
    chartOptions() {
      void this.themeKey
      const root = document.documentElement
      const rootStyles = getComputedStyle(root)

      return {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '40%',
        animation: {
          animateScale: true,
          animateRotate: true,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: rootStyles.getPropertyValue('--background-color-soft').trim(),
            titleColor: rootStyles.getPropertyValue('--header-text-color').trim(),
            bodyColor: rootStyles.getPropertyValue('--normal-text-color').trim(),
            borderColor: rootStyles.getPropertyValue('--border-color').trim(),
            borderWidth: 1,
            callbacks: {
              label: function (context: TooltipItem<'doughnut'>) {
                let label = context.label || ''
                if (label) {
                  label += ': $'
                }
                if (context.parsed !== null) {
                  label += context.formattedValue
                }
                return label
              },
            },
          },
        },
        onHover: (event: ChartEvent, elements: Array<{ index: number }>) => {
          const canvas = event.native?.target as HTMLCanvasElement | null
          if (canvas) {
            canvas.style.cursor = elements && elements.length > 0 ? 'pointer' : 'default'
          }
        },
        onClick: (event: ChartEvent) => {
          this.handleChartClick(event)
        },
      }
    },
  },

  methods: {
    processCategoriesData() {
      if (this.categories === null || this.categories === undefined) {
        this.categoriesData = []
        return
      }
      // Use category names from API as-is; assign theme-based colors by index (no hardcoded keys)
      this.categoriesData = Object.entries(this.categories).map(
        ([key, value]: [string, number], index): SpendingCategories => ({
          name: key,
          value,
          label: key,
          color: getCategoryColorByIndex(index),
        })
      )
      this.categoriesData.sort((a: SpendingCategories, b: SpendingCategories) => b.value - a.value)
    },

    handleChartClick(event: ChartEvent) {
      const chartEvent = event as ChartEvent & {
        chart: {
          getElementsAtEventForMode: (
            native: unknown,
            mode: string,
            options: unknown,
            intersect: boolean
          ) => Array<{ index: number }>
        }
      }
      if (!chartEvent.chart || !chartEvent.chart.getElementsAtEventForMode || !chartEvent.native)
        return

      const elements = chartEvent.chart.getElementsAtEventForMode(
        chartEvent.native,
        'nearest',
        { intersect: true },
        false
      )

      if (elements.length > 0) {
        const index = elements[0].index
        this.handleSegmentClick(index)
      }
    },

    handleSegmentClick(index: number) {
      const segment = this.categoriesData[index]

      if (this.clickedSegment && this.clickedSegment.name === segment.name) {
        // Reset to original state if the same segment is clicked again
        this.isDataOpen = false
        this.clickedSegment = null
      } else {
        // Set the new clicked segment
        this.clickedSegment = segment
        this.isDataOpen = true
      }
    },
  },

  mounted() {
    this.processCategoriesData()
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

  watch: {
    categories: {
      handler: 'processCategoriesData',
      immediate: true,
    },
    selectedLanguage: {
      handler: 'processCategoriesData',
      immediate: true,
    },
    themeKey: 'processCategoriesData',
  },
}
</script>

<style lang="scss" scoped>
.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
  height: 100%;
  width: 100%;
  max-width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;

  .chart-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 100%;
    min-height: 0;
  }

  .chart-title {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--normal-text-color);
    text-align: center;
    margin-bottom: 0.35rem;
    line-height: 1.25;
  }

  .donut-chart-wrapper {
    position: relative;
    width: 100%;
    max-width: min(100%, 260px);
    aspect-ratio: 1;
    min-height: 140px;
    max-height: 240px;
    margin: 0 auto;
    flex-shrink: 0;
  }

  .donut-chart {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .no-data-message {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 160px;
    padding: 1rem;
    color: var(--normal-text-color);
    font-style: italic;
    text-align: center;
    font-size: 0.8125rem;
  }

  .segment-data {
    font-size: 0.875rem;
    margin: 0.35rem 0;
    padding: 0 0.5rem;
    font-weight: 600;
    color: var(--header-text-color);
    text-align: center;
    word-break: break-word;
    line-height: 1.25;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.2rem 0.5rem;
    margin-top: 0.35rem;
    padding: 0 0.25rem;
    max-width: 100%;

    &-item {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    &-color {
      width: 8px;
      height: 8px;
      min-width: 8px;
      min-height: 8px;
      border-radius: 2px;
      margin-right: 0.25rem;
    }

    &-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--normal-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 110px;
    }
  }

  @media (max-width: 480px) {
    padding: 0.35rem;

    .donut-chart-wrapper {
      min-height: 120px;
      max-height: 200px;
    }

    .legend-label {
      max-width: 90px;
    }
  }

  @media (min-width: 769px) {
    .donut-chart-wrapper {
      max-width: min(100%, 240px);
      max-height: 220px;
    }
  }
}
</style>

<template>
  <div class="chart-container" ref="chartContainer">
    <div class="chart-no-data" v-if="!hasData">
      <div v-if="!hasData" class="no-data-message">
        {{ selectedLanguage == 'English' ? 'No Data Available' : 'Veri Yok' }}
      </div>
    </div>
    <div v-else>
      <h2 class="chart-title">{{ title }}</h2>
      <div class="donut-chart">
        <Doughnut
          v-show="hasData"
          :data="chartData"
          :options="chartOptions"
          @click="handleChartClick"
        />
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
import type { SpendingCategories } from '../../interfaces/SpendingCategories'

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
      return this.categoriesData.reduce((sum, category) => sum + category.value, 0)
    },
    computedText() {
      return this.donutChartText + this.total
    },
    chartData() {
      // Get CSS variables safely using getComputedStyle on the document root
      const root = document.documentElement
      const rootStyles = getComputedStyle(root)

      // Convert CSS variables to actual colors
      const backgroundColors = this.categoriesData.map(item => {
        const varName = (item.color || '--category-other-color')
          .replace('var(', '')
          .replace(')', '')
        return rootStyles.getPropertyValue(varName).trim() || '#CCCCCC' // Fallback color
      })

      // Create highlighted colors for selected segment
      const hoverColors = [...backgroundColors]

      if (this.clickedSegment) {
        const index = this.categoriesData.findIndex(item => item.name === this.clickedSegment?.name)
        if (index !== -1) {
          // Create highlight effect for selected segment
          const normalizedName = this.getNormalizedCategoryName(this.clickedSegment.name)
          const reverseVarName = `--category-reverse-${normalizedName}-color`
          const reverseColor = rootStyles.getPropertyValue(reverseVarName).trim()

          if (reverseColor) {
            backgroundColors[index] = reverseColor
          }
        }
      }

      return {
        labels: this.categoriesData.map(item => item.name),
        datasets: [
          {
            data: this.categoriesData.map(item => item.value),
            backgroundColor: backgroundColors,
            hoverBackgroundColor: hoverColors,
            borderColor: rootStyles.getPropertyValue('--background-color').trim(),
            borderWidth: 1,
            hoverOffset: 8,
          },
        ],
      }
    },
    chartOptions() {
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
        onHover: (event: any, elements: any[]) => {
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
      // Create a deep copy of the categories array
      this.categoriesData = Object.entries(this.categories).map(([key, value]) => ({
        name: this.getNormalizedCategoryName(key),
        value: value,
        label: this.getNormalizedCategoryName(key),
        color: '',
      }))
      this.categoriesData.sort((a, b) => b.value - a.value)

      // Assign colors based on category names
      this.categoriesData.forEach(category => {
        if (category.name === 'Other' || category.name === 'Diğer') {
          category.color = 'var(--category-other-color)'
        } else if (category.name === 'Food' || category.name === 'Yiyecek') {
          category.color = 'var(--category-food-color)'
        } else if (category.name === 'Transport' || category.name === 'Ulaşım') {
          category.color = 'var(--category-transport-color)'
        } else if (category.name === 'Entertainment' || category.name === 'Eğlence') {
          category.color = 'var(--category-entertainment-color)'
        } else if (category.name === 'Health' || category.name === 'Sağlık') {
          category.color = 'var(--category-healthcare-color)'
        } else if (category.name === 'Shopping' || category.name === 'Alışveriş') {
          category.color = 'var(--category-shopping-color)'
        } else if (category.name === 'Housing' || category.name === 'Konut') {
          category.color = 'var(--category-housing-color)'
        } else if (category.name === 'Education' || category.name === 'Eğitim') {
          category.color = 'var(--category-education-color)'
        }
      })
    },

    getNormalizedCategoryName(categoryName: string): string {
      if (this.selectedLanguage === 'English') {
        return categoryName[0].toUpperCase() + categoryName.slice(1).toLowerCase()
      }

      const categoryMap: Record<string, string> = {
        other: 'Diğer',
        food: 'Yiyecek',
        transport: 'Ulaşım',
        entertainment: 'Eğlence',
        health: 'Sağlık',
        shopping: 'Alışveriş',
        housing: 'Konut',
        education: 'Eğitim',
      }
      const normalizedCategoryName = categoryMap[categoryName.toLowerCase()]
      return normalizedCategoryName
        ? normalizedCategoryName[0].toUpperCase() + normalizedCategoryName.slice(1).toLowerCase()
        : categoryName
    },

    handleChartClick(event: ChartEvent) {
      const chartEvent = event as any
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
  },
}
</script>

<style lang="scss" scoped>
.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: var(--background-color);
  padding: 1rem;
  box-sizing: border-box;

  .chart-title {
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--header-text-color);
    text-align: center;
    margin-bottom: 0.8rem;
  }

  .donut-chart {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 70%;
  }

  .no-data-message {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: var(--normal-text-color);
    font-style: italic;
    text-align: center;
  }

  .segment-data {
    font-size: 1rem;
    margin: 0.8rem 0;
    font-weight: 500;
    color: var(--header-text-color);
    text-align: center;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 0.5rem;

    &-item {
      display: flex;
      align-items: center;
      margin: 0.4rem;
    }

    &-color {
      width: 12px;
      height: 12px;
      border-radius: var(--border-radius);
      margin-right: 0.4rem;
    }

    &-label {
      font-size: 0.85rem;
      color: var(--header-text-color);
    }
  }

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0.4rem;

    .chart-title {
      font-size: 0.9rem;
      margin-bottom: 0.3rem;
    }

    .donut-chart {
      height: 200px;
    }

    .segment-data {
      font-size: 0.75rem;
      margin: 0.3rem 0;
    }

    .legend {
      &-item {
        margin: 0.2rem;
      }

      &-label {
        font-size: 0.7rem;
      }
    }
  }
}
</style>

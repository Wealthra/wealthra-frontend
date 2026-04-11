<template>
  <div class="donut-chart-container">
    <div class="card-header">
      <div v-if="loading" class="skeleton-box title-skeleton"></div>
      <h3 v-else class="card-title">{{ title }}</h3>
    </div>

    <div v-if="loading" class="chart-content">
      <div class="chart-main-visual">
        <div class="skeleton-box donut-skeleton"></div>
      </div>
      <div class="custom-legend">
        <div v-for="i in 4" :key="i" class="legend-row skeleton-item">
          <div class="legend-info">
            <div class="skeleton-box dot-skeleton"></div>
            <div class="skeleton-box name-skeleton"></div>
          </div>
          <div class="legend-stats">
            <div class="skeleton-box pct-skeleton"></div>
            <div class="skeleton-box val-skeleton"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!hasData" class="empty-state">
      <div class="no-data-message">
        {{ selectedLanguage == 'English' ? 'No Data Available' : 'Veri Yok' }}
      </div>
    </div>

    <div v-else class="chart-content">
      <div class="chart-main-visual">
        <div class="donut-wrapper">
          <Doughnut
            :data="chartData"
            :options="chartOptions"
            @click="handleChartClick"
          />
          <div class="donut-center">
            <span class="total-label">{{ selectedLanguage === 'English' ? 'Total' : 'Toplam' }}</span>
            <span class="total-value">{{ total }}</span>
          </div>
        </div>
      </div>

      <div class="custom-legend">
        <div 
          v-for="(category, index) in categoriesData.slice(0, 5)" 
          :key="index" 
          class="legend-row"
          @mouseenter="hoverSegment(index)"
          @mouseleave="hoverSegment(null)"
        >
          <div class="legend-info">
            <span class="color-dot" :style="{ backgroundColor: category.color }"></span>
            <span class="category-name">{{ category.name }}</span>
          </div>
          <div class="legend-stats">
            <span class="category-pct">{{ calculatePercentage(category.value) }}</span>
            <span class="category-val">{{ formatCurrency(category.value) }}</span>
          </div>
        </div>
        <div v-if="categoriesData.length > 5" class="legend-more">
          + {{ categoriesData.length - 5 }} {{ selectedLanguage === 'English' ? 'more' : 'daha fazla' }}
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

import type { SpendingCategories } from '@/interfaces/SpendingCategories'
import { getCategoryColorByIndex } from '@/utils/chartCategoryPalette'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale)

export default {
  name: 'DonutChart',
  components: {
    Doughnut,
  },
  props: {
    title: { type: String, default: 'Spendings' },
    loading: { type: Boolean, default: false },
    categories: { type: Object as () => Record<string, number>, required: true },
    donutChartText: { type: String, default: 'Total' },
    selectedLanguage: { type: String, default: 'English' },
  },
  data() {
    return {
      categoriesData: [] as Array<SpendingCategories>,
      themeKey: (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null) || 'light',
      themeObserver: null as MutationObserver | null,
    }
  },
  computed: {
    hasData(): boolean {
      return this.categoriesData && this.categoriesData.length > 0
    },
    totalRaw(): number {
      return this.categoriesData.reduce((sum, cat) => sum + cat.value, 0)
    },
    total(): string {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(this.totalRaw)
    },
    chartData() {
      return {
        labels: this.categoriesData.map(item => item.name),
        datasets: [{
          data: this.categoriesData.map(item => item.value),
          backgroundColor: this.categoriesData.map(item => item.color),
          borderWidth: 0,
          hoverOffset: 10,
          cutout: '80%',
          borderRadius: 4
        }]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context: any) => {
                const label = context.label || ''
                const val = context.parsed || 0
                return ` ${label}: ${this.formatCurrency(val)}`
              }
            }
          }
        }
      }
    }
  },
  methods: {
    calculatePercentage(value: number): string {
      if (this.totalRaw === 0) return '0%'
      return ((value / this.totalRaw) * 100).toFixed(0) + '%'
    },
    formatCurrency(value: number): string {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(value)
    },
    processCategoriesData() {
      if (!this.categories) {
        this.categoriesData = []
        return
      }
      this.categoriesData = Object.entries(this.categories).map(
        ([key, value]: [string, number], index): SpendingCategories => ({
          name: key.replace(/\s+#\d+$/, ''),
          value,
          label: key.replace(/\s+#\d+$/, ''),
          color: getCategoryColorByIndex(index),
        })
      )
      this.categoriesData.sort((a, b) => b.value - a.value)
    },
    handleChartClick() { /* logic if needed */ },
    hoverSegment(index: number | null) { /* hover logic */ }
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
    if (this.themeObserver) this.themeObserver.disconnect()
  },
  watch: {
    categories: { handler: 'processCategoriesData', immediate: true },
    themeKey: 'processCategoriesData',
  },
}
</script>

<style scoped lang="scss">

.donut-chart-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 1.25rem;
  box-sizing: border-box;

  .title-skeleton {
    width: 160px;
    height: 1.1rem;
  }

  .card-header {
    margin-bottom: 1.25rem;
    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--header-text-color);
      margin: 0;
    }
  }

  /* Skeleton Styles */
  .donut-skeleton {
    width: 180px;
    height: 180px;
    border-radius: 50%;
  }

  .dot-skeleton {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }

  .name-skeleton {
    width: 80px;
    height: 0.85rem;
  }

  .pct-skeleton {
    width: 30px;
    height: 0.75rem;
  }

  .val-skeleton {
    width: 50px;
    height: 0.85rem;
  }

  .empty-state {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--normal-text-color);
    font-style: italic;
  }

  .chart-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .chart-main-visual {
    position: relative;
    width: 100%;
    height: 180px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .donut-wrapper {
    position: relative;
    width: 180px;
    height: 180px;
  }

  .donut-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;

    .total-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--normal-text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .total-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--header-text-color);
      line-height: 1.1;
      margin-top: 2px;
    }
  }

  .custom-legend {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--background-color-soft);

    .legend-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.2rem 0;
      transition: opacity 0.2s ease;

      &:not(.skeleton-item):hover {
        opacity: 0.8;
      }
    }

    .legend-info {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      min-width: 0;

      .color-dot {
        width: 8px;
        height: 8px;
        border-radius: 2px;
        flex-shrink: 0;
      }
      .category-name {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--header-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .legend-stats {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;

      .category-pct {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--normal-text-color);
        width: 35px;
        text-align: right;
      }
      .category-val {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--header-text-color);
        min-width: 60px;
        text-align: right;
      }
    }

    .legend-more {
      font-size: 0.75rem;
      color: var(--normal-text-color);
      text-align: center;
      padding-top: 0.25rem;
      font-weight: 500;
    }
  }
}
</style>


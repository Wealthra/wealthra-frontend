<template>
  <UILoading
    v-if="isLoading || hasError"
    :isLoading="isLoading"
    :hasError="hasError"
    :loadingText="analyticsTexts[selectedLanguage]?.loading || 'Loading...'"
    :errorMessage="activeErrorMessage"
    :retryText="analyticsTexts[selectedLanguage]?.retry || 'Retry'"
    @retry="loadAppropriateData"
  />
  <template v-else>
    <div class="right-side-top-wrapper">
      <div class="date-range-picker-wrapper">
        <Datepicker
          v-model:value="selectedDateRange"
          range
          :placeholder="analyticsTexts[selectedLanguage].customDateRange"
          :disabled-date="disableFutureDates"
          @change="loadAppropriateData"
        />
      </div>
    </div>
    <div
      v-if="hasValidDateRange && (breakdown !== null || trends !== null)"
      class="analytics-data-available"
    >
      <div class="analytics-data-wrapper">
        <div class="chart-box chart-box--pie">
          <div class="chart-box-inner">
            <UIDonutChart
              :categories="breakdownCategories"
              :title="analyticsTexts[selectedLanguage].spendingsBreakdown"
              :donutChartText="analyticsTexts[selectedLanguage].donutChartText"
              :selectedLanguage="selectedLanguage"
            />
          </div>
        </div>
        <div class="chart-box chart-box--line">
          <div class="chart-box-inner">
            <UIIncomeExpenseLineChart
              :labels="trendsLabels"
              :incomeValues="trendsIncomeValues"
              :expenseValues="trendsExpenseValues"
              :incomeLabel="analyticsTexts[selectedLanguage].incomes"
              :expenseLabel="analyticsTexts[selectedLanguage].spendings"
              :noDataText="analyticsTexts[selectedLanguage].noChartData"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-else class="analytics-empty-state">
      <div class="empty-state">
        <div class="empty-state__icon-wrap">
          <font-awesome-icon :icon="emptyStateIcon" class="empty-state__icon" aria-hidden="true" />
        </div>
        <h2 class="empty-state__heading">
          {{ analyticsTexts[selectedLanguage].emptyStateHeading }}
        </h2>
        <p class="empty-state__text">
          {{ analyticsTexts[selectedLanguage].emptyStateText }}
        </p>
      </div>
    </div>
  </template>
</template>

<script lang="ts">
import UILoading from '@/components/UILoading.vue'
import Datepicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'

import UIDonutChart from '@/modules/dashboard/components/UIDonutChart.vue'
import UIIncomeExpenseLineChart from '@/modules/dashboard/components/UIIncomeExpenseLineChart.vue'

import { analyticsTexts } from '@/data/analyticsTexts'
import { leftSidebarIconMap } from '@/icons/fontawesome-icons'

import { statisticService } from '@/services/api/statistic/statistic.service'

import type { StatisticsBreakdownResponse, StatisticsTrendsResponse } from '@/services/api/statistic/statistic.models'

export default {
  name: 'AnalyticsView',
  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
  },
  components: {
    Datepicker,
    UIDonutChart,
    UIIncomeExpenseLineChart,
    UILoading,
  },
  data() {
    return {
      isLoading: false,
      hasError: false,
      selectedDateRange: null as [Date, Date] | null,
      analyticsTexts: analyticsTexts,
      breakdown: null as StatisticsBreakdownResponse | null,
      trends: null as StatisticsTrendsResponse | null,
      activeErrorMessage: '',
      emptyStateIcon: leftSidebarIconMap.Analytics,
    }
  },
  computed: {
    hasValidDateRange(): boolean {
      return (
        Array.isArray(this.selectedDateRange) &&
        this.selectedDateRange.length === 2 &&
        this.selectedDateRange[0] instanceof Date &&
        this.selectedDateRange[1] instanceof Date
      )
    },
    breakdownCategories(): Record<string, number> {
      if (!this.breakdown?.categoryBreakdown?.length) return {}
      return this.breakdown.categoryBreakdown.reduce<Record<string, number>>(
        (acc, item) => {
          acc[item.categoryName] = item.amount
          return acc
        },
        {}
      )
    },
    trendsLabels(): string[] {
      if (!this.trends?.monthlyData?.length) return []
      return [...this.trends.monthlyData]
        .sort((a, b) => a.month - b.month)
        .map(d => d.monthName)
    },
    trendsIncomeValues(): number[] {
      if (!this.trends?.monthlyData?.length) return []
      return [...this.trends.monthlyData]
        .sort((a, b) => a.month - b.month)
        .map(d => d.totalIncome)
    },
    trendsExpenseValues(): number[] {
      if (!this.trends?.monthlyData?.length) return []
      return [...this.trends.monthlyData]
        .sort((a, b) => a.month - b.month)
        .map(d => d.totalExpenses)
    },
  },
  methods: {
    disableFutureDates(date: Date): boolean {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date > today
    },
    loadAppropriateData() {
      if (!this.hasValidDateRange) {
        this.breakdown = null
        this.trends = null
        this.isLoading = false
        this.hasError = false
        this.activeErrorMessage = ''
        return
      }

      this.isLoading = true
      this.hasError = false
      this.activeErrorMessage = ''
      this.fetchAnalyticsDataFromServer()
    },

    async fetchAnalyticsDataFromServer() {
      if (!this.selectedDateRange || !this.hasValidDateRange) {
        this.isLoading = false
        return
      }

      const start = this.selectedDateRange[0]
      const end = this.selectedDateRange[1]
      const startDate = start.toISOString().split('T')[0]
      const endDate = end.toISOString().split('T')[0]
      const year = start.getFullYear()

      try {
        const [breakdownRes, trendsRes] = await Promise.all([
          statisticService.apiGetBreakdown(startDate, endDate),
          statisticService.apiGetTrends(year),
        ])
        this.breakdown = breakdownRes
        this.trends = trendsRes
      } catch (error) {
        console.error('Error fetching analytics data:', error)
        this.hasError = true
        this.activeErrorMessage =
          this.analyticsTexts[this.selectedLanguage]?.dataError || 'Failed to load data.'
      } finally {
        this.isLoading = false
      }
    },
  },

  mounted() {
    // Do not auto-fetch; show empty state until user selects a date range
  },
}
</script>

<style scoped lang="scss">
.right-side-top-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 2rem;
  gap: 1rem;

  .date-range-picker-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
  }
}

.analytics-data-available {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 1rem;
  padding: 0 2rem;

  .analytics-data-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    min-height: 320px;
    gap: 1rem;
  }

  .chart-box {
    flex: 1;
    min-width: 0;

    .chart-box-inner {
      width: 100%;
      height: 100%;
      min-height: 280px;
    }
  }
}

.analytics-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  padding: 2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 3rem 2rem;
  max-width: 24rem;
}

.empty-state__icon-wrap {
  width: 5.5rem;
  height: 5.5rem;
  border-radius: var(--border-radius);
  background-color: rgba(92, 184, 92, 0.12);
  color: var(--primary-green-color);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state__icon {
  font-size: 2.5rem;
}

.empty-state__heading {
  margin: 0 0 0.75rem;
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--header-text-color);
}

.empty-state__text {
  margin: 0;
  font-size: 1rem;
  color: var(--normal-text-color);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .right-side-top-wrapper {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 1rem;
    gap: 0.5rem;
  }

  .analytics-data-available {
    padding: 0 1rem;

    .analytics-data-wrapper {
      flex-direction: column;
      min-height: auto;
      gap: 1.5rem;
    }

    .chart-box .chart-box-inner {
      min-height: 260px;
    }
  }
}
</style>

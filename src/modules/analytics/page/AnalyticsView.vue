<template>
  <div class="analytics-c">
    <UIHorizontalNavbar v-if="isMobile" />
    <UILeftSideBar
      :initialLanguage="selectedLanguage"
      :selectedPage="selectedLanguage == 'English' ? 'Analytics' : 'Analizler'"
      v-else
    />
    <div class="right-side-wrapper">
      <UITopBar :selectedLanguage="selectedLanguage" @update-language="handleLanguageUpdate" />
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
          <div class="financial-reports-header">
            {{ analyticsTexts[selectedLanguage].financialReports }}
          </div>
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
          class="analytics-data-available"
          v-if="selectedDateRange && selectedDateRange[0] && selectedDateRange[1]"
        >
          <div class="analytics-data-wrapper">
            <UIGraph
              :selectedLanguage="selectedLanguage"
              :incomeExpenseData="financialData.incomeExpenseData"
            />

            <UIExpenseDistribution
              :selectedLanguage="selectedLanguage"
              :expenseDistribution="financialData.expenseDistribution"
            />
          </div>
        </div>
        <div class="analytics-data-not-available" v-else>
          <p>{{ analyticsTexts[selectedLanguage].selectDateRange }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import UILeftSideBar from '@/components/UILeftSideBar.vue'
import UITopBar from '@/components/UITopBar.vue'
import UILoading from '@/components/UILoading.vue'
import Datepicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'

import UIGraph from '@/modules/analytics/components/UIGraph.vue'
import UIExpenseDistribution from '@/modules/analytics/components/UIExpenseDistribution.vue'
import UIHorizontalNavbar from '@/components/UIHorizontalNavbar.vue'

import { analyticsTexts } from '@/data/analyticsTexts'

import { statisticService } from '@/services/api/statistic/statistic.service'
import { getUserId } from '@/utils/auth'

import type { FinancialData } from '@/interfaces/FinancialData'

export default {
  name: 'AnalyticsView',
  components: {
    UILeftSideBar,
    UITopBar,
    Datepicker,
    UIGraph,
    UIExpenseDistribution,
    UILoading,
    UIHorizontalNavbar,
  },
  data() {
    return {
      selectedLanguage: 'English' as 'English' | 'Turkish',
      isLoading: false,
      hasError: false,
      selectedDateRange: null as [Date, Date] | null,
      analyticsTexts: analyticsTexts,
      financialData: {} as FinancialData,
      activeErrorMessage: '',
      isMobile: window.innerWidth <= 768,
      windowWidth: window.innerWidth,
    }
  },

  methods: {
    handleLanguageUpdate(language: 'English' | 'Turkish') {
      this.selectedLanguage = language
      localStorage.setItem('selectedLanguage', language)
      this.loadAppropriateData()
    },
    handleResize() {
      this.windowWidth = window.innerWidth
      this.isMobile = this.windowWidth <= 768
    },

    disableFutureDates(date: Date): boolean {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date > today
    },
    loadAppropriateData() {
      const isDateRangeValid =
        Array.isArray(this.selectedDateRange) &&
        this.selectedDateRange.length === 2 &&
        this.selectedDateRange[0] instanceof Date &&
        this.selectedDateRange[1] instanceof Date

      if (!isDateRangeValid) {
        this.financialData = {} as FinancialData
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

    async fetchCategorySpendingByDate(startDate: string, endDate: string, userId: string | null) {
      if (!userId) {
        this.hasError = true
        this.activeErrorMessage = 'User ID is missing.'
        return
      }

      try {
        const data = await statisticService.getCategorySpendingByDateRange(
          userId,
          startDate,
          endDate
        )
        return data
      } catch (error) {
        console.error('API error:', error)
        this.hasError = true
        this.activeErrorMessage = 'Failed to fetch data. Please try again.'
      }
    },

    async fetchMonthlyUserExpensesByDate(
      startDate: string,
      endDate: string,
      userId: string | null
    ) {
      if (!userId) {
        this.hasError = true
        this.activeErrorMessage = 'User ID is missing.'
        return
      }

      try {
        const data = await statisticService.getMonthlyUserExpensesByDateRange(
          userId,
          startDate,
          endDate
        )
        return data
      } catch (error) {
        console.error('API error:', error)
        this.hasError = true
        this.activeErrorMessage = 'Failed to fetch data. Please try again.'
      }
    },
    async fetchMonthlyUserIncomeByDate(startDate: string, endDate: string, userId: string | null) {
      if (!userId) {
        this.hasError = true
        this.activeErrorMessage = 'User ID is missing.'
        return
      }

      try {
        const data = await statisticService.getMonthlyUserIncomesByDateRange(
          userId,
          startDate,
          endDate
        )
        return data
      } catch (error) {
        console.error('API error:', error)
        this.hasError = true
        this.activeErrorMessage = 'Failed to fetch data. Please try again.'
      }
    },

    async fetchAnalyticsDataFromServer() {
      if (this.selectedDateRange) {
        // Add a helper function to add days to a date
        const addDays = (date: Date, days: number): string => {
          const result = new Date(date)
          result.setDate(result.getDate() + days)
          return result.toISOString().split('T')[0]
        }

        // Add 1 day to both start and end dates
        const startDate = addDays(this.selectedDateRange[0], 1)
        const endDate = addDays(this.selectedDateRange[1], 1)

        const userId = getUserId()

        if (!userId) {
          this.hasError = true
          this.activeErrorMessage = 'User ID is missing.'
          this.isLoading = false
          return
        }

        try {
          const categorySpending = await this.fetchCategorySpendingByDate(
            startDate,
            endDate,
            userId
          )
          const expenceData = await this.fetchMonthlyUserExpensesByDate(startDate, endDate, userId)
          const incomeData = await this.fetchMonthlyUserIncomeByDate(startDate, endDate, userId)

          // Convert CategorySpendingResponse (Record<string, number>) to array format
          if (categorySpending) {
            this.financialData.expenseDistribution = Object.entries(categorySpending).map(
              ([category, amount]) => ({
                category,
                amount,
              })
            )
          }

          if (incomeData && expenceData) {
            this.financialData.incomeExpenseData = this.combineIncomeAndExpenseData(
              incomeData as Record<string, number>,
              expenceData as Record<string, number>
            )
          }

          this.isLoading = false
        } catch (error) {
          console.error('Error fetching data:', error)
          this.hasError = true
          this.activeErrorMessage = 'Failed to fetch data. Please try again.'
          this.isLoading = false
        }
      }
    },

    combineIncomeAndExpenseData(
      incomeData: Record<string, number>,
      expenseData: Record<string, number>
    ) {
      // Combine income and expense data by month
      const combinedData: Record<string, { month: string; income: number; expenses: number }> = {}
      // Process income data
      for (const [month, amount] of Object.entries(incomeData)) {
        if (!combinedData[month]) {
          combinedData[month] = { month, income: 0, expenses: 0 }
        }
        combinedData[month].income = amount
      }

      // Process expense data
      for (const [month, amount] of Object.entries(expenseData)) {
        if (!combinedData[month]) {
          combinedData[month] = { month, income: 0, expenses: 0 }
        }
        combinedData[month].expenses = amount
      }

      // Convert to array and sort by month
      return Object.values(combinedData).sort((a, b) => a.month.localeCompare(b.month))
    },
  },

  mounted() {
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      this.selectedLanguage = savedLanguage as 'English' | 'Turkish'
    }

    window.addEventListener('resize', this.handleResize)

    this.loadAppropriateData()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },

  watch: {},
}
</script>

<style scoped lang="scss">
.analytics-c {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;

  .right-side-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    padding: 0.5rem;
    background-color: var(--background-color);
    overflow-y: auto;
    gap: 1rem;

    .right-side-top-wrapper {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0 2rem;
      gap: 1rem;

      .financial-reports-header {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--header-text-color);
      }
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
      padding: 0 2rem;
      gap: 1rem;

      .analytics-data-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        height: 90%;
        padding: 0 2rem;
        gap: 1rem;
      }
    }
    .analytics-data-not-available {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 0 2rem;
      gap: 1rem;
      font-size: 2rem;
      color: var(--normal-text-color);
    }
  }
}
@media (max-width: 768px) {
  .analytics-c {
    flex-direction: column;
    align-items: center;

    .right-side-wrapper {
      width: 100%;
      height: 100%;
      padding: 0.5rem;
      gap: 2rem;
      flex-direction: column;
      overflow: auto;

      .right-side-top-wrapper {
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0 1rem;
        gap: 0.5rem;

        .financial-reports-header {
          font-size: 1.2rem;
        }
      }

      .analytics-data-available {
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100vh;
        padding: 0 1rem;
        gap: 0.5rem;

        .analytics-data-wrapper {
          flex-direction: column;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 0 1rem;
          gap: 0.5rem;
        }
      }
    }
  }
}
</style>

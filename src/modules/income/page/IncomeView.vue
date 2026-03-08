<template>
  <div class="income-content">
      <div class="information-wrapper">
        <UIInformationBox
          :currentAmount="financialData.weeklyTotalIncome"
          :lastAmount="0"
          color="green"
          type="income"
          :title="incomeTexts[selectedLanguage].weeklyIncome"
          icon="fas fa-calendar-week"
          icon-color="var(--primary-green-color)"
          :showTrend="false"
        />
        <UIInformationBox
          :currentAmount="financialData.monthlyTotalIncome"
          :lastAmount="0"
          color="green"
          type="income"
          :title="incomeTexts[selectedLanguage].monthlyIncome"
          icon="fas fa-calendar-day"
          icon-color="var(--primary-green-color)"
          :showTrend="false"
        />
        <UIInformationBox
          :currentAmount="financialData.averageMonthlyIncome"
          :lastAmount="0"
          color="green"
          type="income"
          :title="incomeTexts[selectedLanguage].averageMonthlyIncome"
          icon="fas fa-chart-line"
          icon-color="var(--primary-green-color)"
          :showTrend="false"
        />
        <UIInformationBox
          :currentAmount="financialData.yearlyTotalIncome"
          :lastAmount="0"
          color="green"
          type="income"
          :title="incomeTexts[selectedLanguage].annualIncome"
          icon="fas fa-calendar"
          icon-color="var(--primary-green-color)"
          :showTrend="false"
        />
      </div>
      <div class="statistics-wrapper">
        <UIIncomeSourcesComponent
          :incomeSources="financialData.incomeSources"
          :hasMoreItems="financialData.incomeHasMoreItems"
          :selectedLanguage="selectedLanguage"
          :pageNumber="financialData.pageNumberIncome"
          :pageSize="financialData.pageSizeIncome"
          :totalCount="financialData.totalCountIncome"
          :totalPages="financialData.totalPagesIncome"
          :startDate="startDateIncome ?? undefined"
          :endDate="endDateIncome ?? undefined"
          :getIncomeById="getIncomeById"
          @changePage="handleChangePage"
          @updateDateRange="handleDateRangeUpdate"
          @updatePageSize="handlePageSizeUpdate"
          @addIncomeSource="handleAddIncome"
          @updateIncomeSource="handleUpdateIncomeSource"
          @deleteSource="handleDeleteIncome"
        />
      </div>
    </div>
</template>

<script lang="ts">
import UIInformationBox from '@/modules/dashboard/components/UIInformationBox.vue'
import UIIncomeSourcesComponent from '@/modules/income/components/UIIncomeSourcesComponent.vue'

import { incomeTexts } from '@/data/incomeTexts'
import type { FinancialData } from '@/interfaces/FinancialData'
import { incomeService } from '@/services/api/income/income.service'

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDefaultIncomeDateRange(): { start: string; end: string } {
  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - 30)
  return { start: toYmd(start), end: toYmd(today) }
}

export default {
  name: 'IncomeView',
  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
  },
  components: {
    UIInformationBox,
    UIIncomeSourcesComponent,
  },
  data() {
    const { start, end } = getDefaultIncomeDateRange()
    return {
      incomeTexts: incomeTexts,
      isLoading: false,
      hasError: false,
      financialData: {} as FinancialData,
      page: 1,
      pageSizeIncome: 10,
      startDateIncome: start as string | null,
      endDateIncome: end as string | null,
    }
  },
  methods: {

    getIncomeById(id: number) {
      return incomeService.getIncomeById(id)
    },

    handleDeleteIncome(source: {
      id: number
      name: string
      amount: number
      isRecurring: boolean
      method: string
      transactionDate?: string
    }) {
      this.handleDeleteIncomeSource(source)
    },

    handleAddIncome(source: {
      name: string
      amount: number
      isRecurring: boolean
      method: string
      transactionDate: string
    }) {
      this.handleAddIncomeSource(source)
    },

    async handleDeleteIncomeSource(source: {
      id: number
      name: string
      amount: number
      isRecurring: boolean
      method: string
      transactionDate?: string
    }) {
      try {
        await incomeService.deleteIncome(source.id)
        await this.loadAppropriateData()
      } catch (error) {
        console.error('Error deleting income source:', error)
      }
    },

    async handleAddIncomeSource(source: {
      name: string
      amount: number
      isRecurring: boolean
      method: string
      transactionDate: string
    }) {
      try {
        await incomeService.createIncome({
          name: source.name,
          amount: source.amount,
          method: source.method,
          isRecurring: source.isRecurring,
          transactionDate: new Date(source.transactionDate).toISOString(),
        })
        await this.loadAppropriateData()
      } catch (error) {
        console.error('Error adding income source:', error)
      }
    },

    async handleUpdateIncomeSource(
      id: number,
      data: {
        name: string
        amount: number
        isRecurring: boolean
        method: string
        transactionDate: string
      }
    ) {
      try {
        await incomeService.updateIncome(id, {
          name: data.name,
          amount: data.amount,
          method: data.method,
          isRecurring: data.isRecurring,
          transactionDate: new Date(data.transactionDate).toISOString(),
        })
        await this.loadAppropriateData()
      } catch (error) {
        console.error('Error updating income source:', error)
      }
    },

    async fetchIncomeSources() {
      try {
        const params: {
          PageNumber: number
          PageSize: number
          StartDate?: string
          EndDate?: string
        } = {
          PageNumber: this.page,
          PageSize: this.pageSizeIncome,
        }
        if (this.startDateIncome) params.StartDate = this.startDateIncome
        if (this.endDateIncome) params.EndDate = this.endDateIncome

        const data = await incomeService.getIncomes(params)

        this.financialData.incomeSources = data.items.map(item => ({
          id: item.id!,
          name: item.name,
          amount: item.amount,
          isRecurring: item.isRecurring,
          method: item.method,
        }))
        this.financialData.incomeHasMoreItems = data.hasNextPage
        this.financialData.pageNumberIncome = data.pageNumber
        this.financialData.pageSizeIncome = this.pageSizeIncome
        this.financialData.totalCountIncome = data.totalCount
        this.financialData.totalPagesIncome = data.totalPages
      } catch (error) {
        console.error('Error fetching income sources:', error)
      }
    },

    async fetchFinancialData() {
      this.isLoading = true
      this.hasError = false

      try {
        const data = await incomeService.getIncomeGeneralInfo()

        this.financialData.weeklyTotalIncome = data.weeklyTotal
        this.financialData.monthlyTotalIncome = data.monthlyTotal
        this.financialData.yearlyTotalIncome = data.yearlyTotal
        this.financialData.averageMonthlyIncome = data.averageMonthlyIncome
      } catch (error) {
        console.error('Error fetching financial data:', error)
      }
    },

    handleChangePage(page: number) {
      this.page = page
      this.loadAppropriateData()
    },

    handleDateRangeUpdate(startDate: string | null, endDate: string | null) {
      this.startDateIncome = startDate
      this.endDateIncome = endDate
      this.page = 1
      this.loadAppropriateData()
    },

    handlePageSizeUpdate(size: number) {
      this.pageSizeIncome = size
      this.page = 1
      this.loadAppropriateData()
    },

    loadAppropriateData() {
      this.fetchFinancialData()
      this.fetchIncomeSources()
    },
  },
  mounted() {
    this.loadAppropriateData()
  },
  beforeUnmount() {
  },
}
</script>

<style scoped lang="scss">
.income-title {
  display: flex;
  width: 100%;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0 2rem;
  color: var(--header-text-color);
}

.income-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  gap: 2rem;
  flex: 1 1 auto;

  .information-wrapper {
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .statistics-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    min-height: 0;
    min-width: 0;
  }
}

@media (max-width: 1024px) {
  .income-content {
    flex: 0 0 auto;
    min-height: min-content;

    .information-wrapper {
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .statistics-wrapper {
      flex: none;
      min-height: 0;
    }
  }
}

@media (max-width: 768px) {
  .income-title {
    font-size: 1.2rem;
    padding: 0 1rem;
  }

  .income-content {
    padding: 0 0.5rem;
    gap: 1rem;

    .information-wrapper {
      flex-direction: column;
      gap: 0.5rem;
    }
    .statistics-wrapper {
      flex-direction: column;
      gap: 1rem;
    }
  }
}
</style>

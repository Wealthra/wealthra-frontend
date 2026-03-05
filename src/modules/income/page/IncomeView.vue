<template>
  <ModuleLayout
    :selectedLanguage="selectedLanguage"
    :selectedPage="selectedPage"
    @update-language="handleLanguageUpdate"
  >
    <div class="income-content">
      <div class="information-wrapper">
        <UIInformationBox
          :currentAmount="financialData.weeklyTotalIncome"
          :lastAmount="financialData.previousWeekTotalIncome"
          color="green"
          type="income"
          :title="incomeTexts[selectedLanguage].weeklyIncome"
        />
        <UIInformationBox
          :currentAmount="financialData.monthlyTotalIncome"
          :lastAmount="financialData.previousMonthTotalIncome"
          color="yellow"
          type="income"
          :title="incomeTexts[selectedLanguage].monthlyIncome"
        />
        <UIInformationBox
          :currentAmount="financialData.yearlyTotalIncome"
          :lastAmount="financialData.previousYearTotalIncome"
          color="blue"
          type="income"
          :title="incomeTexts[selectedLanguage].annualIncome"
        />
      </div>
      <div class="statistics-wrapper">
        <div class="income-sources-wrapper">
          <UIIncomeSourcesComponent
            :incomeSources="financialData.incomeSources"
            :hasMoreItems="financialData.incomeHasMoreItems"
            :selectedLanguage="selectedLanguage"
            :pageNumber="financialData.pageNumberIncome"
            :pageSize="financialData.pageSizeIncome"
            :totalCount="financialData.totalCountIncome"
            :totalPages="financialData.totalPagesIncome"
            @changePage="handleChangePage"
            @addIncomeSource="handleAddIncome"
            @deleteSource="handleDeleteIncome"
          />
        </div>
        <div class="income-transactions-wrapper">
          <UIIncomeTransactionsComponent
            :incomeRecentTransactions="financialData.incomeRecentTransactions"
            :selectedLanguage="selectedLanguage"
          />
        </div>
      </div>
    </div>
  </ModuleLayout>
</template>

<script lang="ts">
import UIInformationBox from '@/modules/dashboard/components/UIInformationBox.vue'
import UIIncomeSourcesComponent from '@/modules/income/components/UIIncomeSourcesComponent.vue'
import UIIncomeTransactionsComponent from '@/modules/income/components/UIIncomeTransactionsComponent.vue'
import ModuleLayout from '@/layouts/ModuleLayout.vue'

import { incomeTexts } from '@/data/incomeTexts'
import type { FinancialData } from '@/interfaces/FinancialData'
import { incomeService } from '@/services/api/income/income.service'

export default {
  name: 'IncomeView',
  components: {
    ModuleLayout,
    UIInformationBox,
    UIIncomeSourcesComponent,
    UIIncomeTransactionsComponent,
  },
  data() {
    return {
      selectedLanguage: 'English' as 'English' | 'Turkish',
      incomeTexts: incomeTexts,
      isLoading: false,
      hasError: false,
      financialData: {} as FinancialData,
      page: 1,
    }
  },
  computed: {
    selectedPage() {
      return this.selectedLanguage === 'English' ? 'Income' : 'Gelir'
    },
  },

  methods: {
    handleLanguageUpdate(language: 'English' | 'Turkish') {
      this.selectedLanguage = language
      localStorage.setItem('selectedLanguage', language)
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
        await incomeService.apiDeleteIncome(source.id)
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
      console.log('Adding income source:', source)
      try {
        await incomeService.apiCreateIncome({
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

    async fetchIncomeSources() {
      try {
        const pageSize = 4
        const data = await incomeService.apiGetIncomes({
          PageNumber: this.page,
          PageSize: pageSize,
        })

        this.financialData.incomeSources = data.items.map(item => ({
          id: item.id!,
          name: item.name,
          amount: item.amount,
          isRecurring: item.isRecurring,
          method: item.method,
        }))
        this.financialData.incomeHasMoreItems = data.hasNextPage
        this.financialData.pageNumberIncome = data.pageNumber
        this.financialData.pageSizeIncome = pageSize
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

        this.financialData.weeklyTotalIncome = data.weeklyTotalIncome
        this.financialData.previousWeekTotalIncome = data.previousWeekTotalIncome
        this.financialData.monthlyTotalIncome = data.monthlyTotalIncome
        this.financialData.previousMonthTotalIncome = data.previousMonthTotalIncome
        this.financialData.yearlyTotalIncome = data.yearlyTotalIncome
        this.financialData.previousYearTotalIncome = data.previousYearTotalIncome
        this.financialData.incomeRecentTransactions = data.recentTransactions.map(inc => ({
          ...inc,
          created: inc.created || '',
          createdBy: inc.createdBy || '',
          lastModified: inc.lastModified || '',
          lastModifiedBy: inc.lastModifiedBy || '',
        }))
      } catch (error) {
        console.error('Error fetching financial data:', error)
      }
    },

    handleChangePage(page: number) {
      this.page = page
      this.loadAppropriateData()
    },

    loadAppropriateData() {
      this.fetchFinancialData()
      this.fetchIncomeSources()
    },
  },
  mounted() {
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      this.selectedLanguage = savedLanguage as 'English' | 'Turkish'
    }
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
  height: 100%;
  gap: 2rem;

  .information-wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .statistics-wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    justify-content: space-between;
    gap: 0.5rem;

    .income-sources-wrapper {
      width: 100%;
    }
    .income-transactions-wrapper {
      width: 100%;
      gap: 0.5rem;
      display: flex;
      flex-direction: column;
    }
  }
}

@media (max-width: 768px) {
  .income-title {
    font-size: 1.2rem;
    padding: 0 1rem;
  }

  .income-content {
    padding: 0rem 1rem;
    gap: 0.5rem;

    .information-wrapper {
      flex-direction: column;
      gap: 0.5rem;
    }
    .statistics-wrapper {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
}
</style>

<template>
  <div class="income-c">
    <UIHorizontalNavbar v-if="isMobile" :initialLanguage="selectedLanguage" />
    <UILeftSideBar
      :initialLanguage="selectedLanguage"
      :selectedPage="selectedLanguage == 'English' ? 'Income' : 'Gelir'"
      v-else
    />

    <div class="right-wrapper">
      <UITopBar :selectedLanguage="selectedLanguage" @updateLanguage="handleLanguageUpdate" />

      <div class="income-title">
        {{ incomeTexts[selectedLanguage].title }}
      </div>
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
    </div>
  </div>
</template>

<script lang="ts">
import UITopBar from '@/components/UITopBar.vue'
import UILeftSideBar from '@/components/UILeftSideBar.vue'
import UIInformationBox from '@/components/DashboardComponents/UIInformationBox.vue'
import UIIncomeSourcesComponent from '@/components/IncomeComponents/UIIncomeSourcesComponent.vue'
import UIIncomeTransactionsComponent from '@/components/IncomeComponents/UIIncomeTransactionsComponent.vue'
import UIHorizontalNavbar from '@/components/UIHorizontalNavbar.vue'

import { incomeTexts } from '@/data/incomeTexts'
import type { FinancialData } from '@/interfaces/FinancialData'
import { getUserId } from '@/utils/auth'
import { incomeService } from '@/services/income/income.service'

export default {
  name: 'IncomeView',
  components: {
    UITopBar,
    UILeftSideBar,
    UIInformationBox,
    UIIncomeSourcesComponent,
    UIIncomeTransactionsComponent,
    UIHorizontalNavbar,
  },
  data() {
    return {
      selectedLanguage: 'English' as 'English' | 'Turkish',
      incomeTexts: incomeTexts,
      isLoading: false,
      hasError: false,
      financialData: {} as FinancialData,
      page: 1,
      isMobile: window.innerWidth <= 768,
      windowWidth: window.innerWidth,
    }
  },

  methods: {
    handleLanguageUpdate(language: 'English' | 'Turkish') {
      this.selectedLanguage = language
      localStorage.setItem('selectedLanguage', language)
    },
    handleResize() {
      this.windowWidth = window.innerWidth
      this.isMobile = this.windowWidth <= 768
    },

    handleDeleteIncome(source: {
      id: number
      name: string
      amount: number
      isRecurring: boolean
      method: string
    }) {
      this.handleDeleteIncomeSource(source)
    },

    handleAddIncome(source: {
      name: string
      amount: number
      isRecurring: boolean
      method: string
    }) {
      this.handleAddIncomeSource(source)
    },

    async handleDeleteIncomeSource(source: {
      id: number
      name: string
      amount: number
      isRecurring: boolean
      method: string
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
    }) {
      console.log('Adding income source:', source)
      try {
        await incomeService.createIncome({
          name: source.name,
          amount: source.amount,
          method: source.method,
          isRecurring: source.isRecurring,
        })
        await this.loadAppropriateData()
      } catch (error) {
        console.error('Error adding income source:', error)
      }
    },

    async fetchIncomeSources() {
      try {
        const data = await incomeService.getUserIncomes(this.page, 4)

        this.financialData.incomeSources = data.data
        this.financialData.incomeHasMoreItems = data.hasMoreItems
        this.financialData.pageNumberIncome = data.pageNumber
        this.financialData.pageSizeIncome = data.pageSize
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

    window.addEventListener('resize', this.handleResize)

    this.loadAppropriateData()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
}
</script>

<style scoped lang="scss">
.income-c {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;

  .right-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0.5rem;
    background-color: var(--background-color);
    overflow-y: auto;
    gap: 1rem;

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
      gap: 3rem;
      padding: 0rem 2rem;

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
  }
}

@media (max-width: 768px) {
  .income-c {
    flex-direction: column;
    height: auto;

    .right-wrapper {
      width: 100%;
      height: auto;
      padding: 0.5rem;
      gap: 1rem;

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
  }
}
</style>

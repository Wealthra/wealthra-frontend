<template>
  <div class="expenses-c">
    <UIHorizontalNavbar v-if="isMobile" :initialLanguage="selectedLanguage" />
    <UILeftSideBar
      :initialLanguage="selectedLanguage"
      v-else
      :selectedPage="selectedLanguage === 'English' ? 'Expenses' : 'Giderler'"
    />
    <div class="right-wrapper">
      <UITopBar :selectedLanguage="selectedLanguage" @updateLanguage="handleLanguageUpdate" />

      <div class="expenses-title">
        {{ expensesTexts[selectedLanguage].title }}
      </div>
      <div class="expenses-content">
        <div class="information-wrapper">
          <UIInformationBox
            :currentAmount="financialData?.weeklyTotalExpense"
            :lastAmount="financialData?.previousWeekTotalExpense"
            color="green"
            type="spending"
            :title="expensesTexts[selectedLanguage].weeklyExpenses"
          />
          <UIInformationBox
            :currentAmount="financialData?.monthlyTotalExpense"
            :lastAmount="financialData?.previousMonthTotalExpense"
            color="yellow"
            type="spending"
            :title="expensesTexts[selectedLanguage].monthlyExpenses"
          />
          <UIInformationBox
            :currentAmount="financialData?.yearlyTotalExpense"
            :lastAmount="financialData?.previousYearTotalExpense"
            color="blue"
            type="spending"
            :title="expensesTexts[selectedLanguage].annualExpenses"
          />
        </div>
        <div class="statistics-wrapper">
          <UIExpenseHistoryComponent
            :expenseHistory="financialData.expenseSources"
            :hasMoreItems="financialData.expenseHasMoreItems"
            :pageNumber="financialData.pageNumberExpense"
            :pageSize="financialData.pageSizeExpense"
            :totalCount="financialData.totalCountExpense"
            :totalPages="financialData.totalPagesExpense"
            :selectedLanguage="selectedLanguage"
            :page="page"
            @changePage="handleChangePage"
            @addExpense="handleAddExpense"
            @deleteExpense="handleDeleteExpense"
          />
          <UIExpenseTransactionsComponent
            :recentTransactions="financialData.expenseRecentTransactions"
            :selectedLanguage="selectedLanguage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import UITopBar from '@/components/UITopBar.vue'
import UILeftSideBar from '@/components/UILeftSideBar.vue'
import UIInformationBox from '@/components/DashboardComponents/UIInformationBox.vue'
import UIExpenseHistoryComponent from '@/components/ExpensesComponents/UIExpenseHistoryComponent.vue'
import UIExpenseTransactionsComponent from '@/components/ExpensesComponents/UIExpenseTransactionsComponent.vue'
import UIHorizontalNavbar from '@/components/UIHorizontalNavbar.vue'

import { expensesTexts } from '../data/expensesTexts'
import type { FinancialData } from '@/interfaces/FinancialData'
import { getUserId } from '@/utils/auth'
import { expenseService } from '@/services/expense/expense.service'

export default {
  name: 'ExpensesView',
  components: {
    UITopBar,
    UILeftSideBar,
    UIInformationBox,
    UIExpenseHistoryComponent,
    UIExpenseTransactionsComponent,
    UIHorizontalNavbar,
  },
  data() {
    return {
      selectedLanguage: 'English' as 'English' | 'Turkish',
      expensesTexts: expensesTexts,
      isLoading: false,
      hasError: false,
      financialData: {} as FinancialData,
      page: 1,
      isMobile: window.innerWidth <= 768,
      windowWidth: window.innerWidth,
    }
  },

  methods: {
    async handleAddExpense(newExpense: {
      description: string
      amount: number
      paymentMethod: string
      isRecurring: boolean
      categoryId: number
    }) {
      try {
        await expenseService.createExpense({
          ...newExpense,
          categoryId: Number(newExpense.categoryId),
          amount: Number(newExpense.amount),
        })

        this.loadAppropriateData()
      } catch {
        this.hasError = true
      }
    },

    handleDeleteExpense(expenseId: number) {
      this.deleteExpense(expenseId)
    },
    handleResize() {
      this.isMobile = window.innerWidth <= 768
    },
    handleChangePage(newPage: number) {
      this.page = newPage
      this.loadAppropriateData()
    },

    async deleteExpense(expenseId: number) {
      try {
        await expenseService.deleteExpense(expenseId)
        await this.loadAppropriateData()
      } catch (error) {
        console.error('Error deleting expense:', error)
        this.hasError = true
      }
    },

    async fetchExpenseGeneralInfo() {
      try {
        const data = await expenseService.getExpenseGeneralInfo()
        return data
      } catch (error) {
        console.error('Error fetching financial data:', error)
        this.hasError = true
      } finally {
        this.isLoading = false
      }
    },

    async fetchExpenseSources() {
      try {
        const data = await expenseService.getUserExpenses(this.page, 4)
        return data
      } catch (error) {
        console.error('Error fetching income sources:', error)
      }
    },

    async fetchExpenseFromServer() {
      try {
        const expenseSources = await this.fetchExpenseSources()
        const expenseGeneralInfo = await this.fetchExpenseGeneralInfo()

        if (!expenseGeneralInfo || !expenseSources) {
          throw new Error('Failed to fetch expense data')
        }

        this.financialData.weeklyTotalExpense = expenseGeneralInfo.weeklyTotalExpense
        this.financialData.previousWeekTotalExpense = expenseGeneralInfo.previousWeekTotalExpense
        this.financialData.monthlyTotalExpense = expenseGeneralInfo.monthlyTotalExpense
        this.financialData.previousMonthTotalExpense = expenseGeneralInfo.previousMonthTotalExpense
        this.financialData.yearlyTotalExpense = expenseGeneralInfo.yearlyTotalExpense
        this.financialData.previousYearTotalExpense = expenseGeneralInfo.previousYearTotalExpense
        this.financialData.expenseRecentTransactions = expenseGeneralInfo.recentTransactions.map(
          exp => ({
            ...exp,
            name: exp.description || '',
            created: exp.created || '',
            createdBy: '',
            lastModified: '',
            lastModifiedBy: '',
          })
        )

        this.financialData.expenseSources = expenseSources.data.map(exp => ({
          ...exp,
          categoryName: exp.categoryName || '',
          created: exp.created || '',
        }))
        this.financialData.expenseHasMoreItems = expenseSources.hasMoreItems
        this.financialData.pageNumberExpense = expenseSources.pageNumber
        this.financialData.pageSizeExpense = expenseSources.pageSize
        this.financialData.totalCountExpense = expenseSources.totalCount
        this.financialData.totalPagesExpense = expenseSources.totalPages
      } catch (error) {
        console.error('Error fetching financial data:', error)
        this.hasError = true
      } finally {
        this.isLoading = false
      }
    },

    handleLanguageUpdate(language: 'English' | 'Turkish') {
      this.selectedLanguage = language
      localStorage.setItem('selectedLanguage', language)
    },

    loadAppropriateData() {
      this.fetchExpenseFromServer()
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
.expenses-c {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;

  .right-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    background-color: var(--background-color);
    overflow-y: auto;
    gap: 1rem;

    @media (max-width: 768px) {
      min-height: auto;
      padding: 0.3rem;
    }

    .expenses-title {
      display: flex;
      width: 100%;
      font-size: 1.5rem;
      font-weight: bold;
      padding: 0 2rem;
      color: var(--header-text-color);
    }

    .expenses-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      gap: 3rem;
      padding: 0rem 2rem;

      @media (max-width: 768px) {
        flex-direction: column;
        padding: 0rem 1rem;
        gap: 0.5rem;
      }

      .information-wrapper {
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: space-between;
        gap: 0.5rem;

        @media (max-width: 768px) {
          flex-direction: column;
          gap: 0.5rem;
        }
      }

      .statistics-wrapper {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
        justify-content: space-between;
        gap: 0.5rem;

        @media (max-width: 768px) {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    }
  }
}
@media (max-width: 768px) {
  .expenses-c {
    flex-direction: column;
    height: auto;

    .right-wrapper {
      width: 100%;
      height: auto;
      padding: 0.5rem;
      gap: 1rem;

      .expenses-title {
        font-size: 1.2rem;
        padding: 0 1rem;
      }

      .expenses-content {
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

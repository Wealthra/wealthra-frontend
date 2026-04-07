<template>
  <div class="expenses-content">
      <div class="information-wrapper">
        <UIInformationBox
          :currentAmount="financialData?.weeklyTotalExpense ?? 0"
          :lastAmount="0"
          color="green"
          type="spending"
          :title="expensesTexts[selectedLanguage].weeklyExpenses"
          icon="fas fa-calendar-week"
          icon-color="var(--primary-green-color)"
          :showTrend="false"
        />
        <UIInformationBox
          :currentAmount="financialData?.monthlyTotalExpense ?? 0"
          :lastAmount="0"
          color="green"
          type="spending"
          :title="expensesTexts[selectedLanguage].monthlyExpenses"
          icon="fas fa-calendar-day"
          icon-color="var(--primary-green-color)"
          :showTrend="false"
        />
        <UIInformationBox
          :currentAmount="financialData?.recurringExpensesThisMonth ?? 0"
          :lastAmount="0"
          color="green"
          type="spending"
          :title="expensesTexts[selectedLanguage].recurringThisMonth"
          icon="fas fa-chart-line"
          icon-color="var(--primary-green-color)"
          :showTrend="false"
        />
        <UIInformationBox
          :currentAmount="financialData?.yearlyTotalExpense ?? 0"
          :lastAmount="0"
          color="green"
          type="spending"
          :title="expensesTexts[selectedLanguage].annualExpenses"
          icon="fas fa-calendar"
          icon-color="var(--primary-green-color)"
          :showTrend="false"
        />
      </div>
      <div class="statistics-wrapper">
        <UIExpenseHistoryComponent
          :expenseHistory="financialData.expenseSources ?? []"
          :hasMoreItems="!!financialData.expenseHasMoreItems"
          :pageNumber="financialData.pageNumberExpense ?? 1"
          :pageSize="financialData.pageSizeExpense ?? 10"
          :totalCount="financialData.totalCountExpense ?? 0"
          :totalPages="financialData.totalPagesExpense ?? 0"
          :startDate="startDateExpense ?? undefined"
          :endDate="endDateExpense ?? undefined"
          :categoryId="categoryIdFilter ?? undefined"
          :categories="categories"
          :selectedLanguage="selectedLanguage"
          :getExpenseById="getExpenseById"
          @changePage="handleChangePage"
          @updateDateRange="handleDateRangeUpdate"
          @updateCategory="handleCategoryUpdate"
          @categoriesUpdated="fetchCategories"
          @updatePageSize="handlePageSizeUpdate"
          @addExpense="handleAddExpense"
          @updateExpense="handleUpdateExpense"
          @deleteExpense="handleDeleteExpense"
        />
      </div>
    </div>
</template>

<script lang="ts">
import UIInformationBox from '@/modules/dashboard/components/UIInformationBox.vue'
import UIExpenseHistoryComponent from '@/modules/expenses/components/UIExpenseHistoryComponent.vue'

import { expensesTexts } from '@/data/expensesTexts'
import type { FinancialData } from '@/interfaces/FinancialData'
import type { Category } from '@/services/api/category/category.models'
import { categoryService } from '@/services/api/category/category.service'
import { expenseService } from '@/services/api/expense/expense.service'

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDefaultExpenseDateRange(): { start: string; end: string } {
  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - 30)
  return { start: toYmd(start), end: toYmd(today) }
}

export default {
  name: 'ExpensesView',
  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
  },
  components: {
    UIInformationBox,
    UIExpenseHistoryComponent,
  },
  data() {
    const { start, end } = getDefaultExpenseDateRange()
    return {
      expensesTexts: expensesTexts,
      isLoading: false,
      hasError: false,
      financialData: {} as FinancialData,
      page: 1,
      pageSizeExpense: 10,
      startDateExpense: start as string | null,
      endDateExpense: end as string | null,
      categoryIdFilter: null as number | null,
      categories: [] as Category[],
    }
  },
  methods: {
    getExpenseById(id: number) {
      return expenseService.apiGetExpenseById(id)
    },

    handleDeleteExpense(expenseId: number) {
      this.deleteExpense(expenseId)
    },

    handleChangePage(newPage: number) {
      this.page = newPage
      this.loadAppropriateData()
    },

    handleDateRangeUpdate(startDate: string | null, endDate: string | null) {
      this.startDateExpense = startDate
      this.endDateExpense = endDate
      this.page = 1
      this.loadAppropriateData()
    },

    handleCategoryUpdate(categoryId: number | null) {
      this.categoryIdFilter = categoryId
      this.page = 1
      this.loadAppropriateData()
    },

    handlePageSizeUpdate(size: number) {
      this.pageSizeExpense = size
      this.page = 1
      this.loadAppropriateData()
    },

    async handleAddExpense(payload: {
      description: string
      amount: number
      paymentMethod: string
      isRecurring: boolean
      categoryId: number
      transactionDate: string
    }) {
      try {
        await expenseService.apiCreateExpense({
          description: payload.description,
          amount: Number(payload.amount),
          paymentMethod: payload.paymentMethod,
          isRecurring: payload.isRecurring,
          categoryId: Number(payload.categoryId),
          transactionDate: payload.transactionDate,
        })
        await this.loadAppropriateData()
      } catch {
        this.hasError = true
      }
    },

    async handleUpdateExpense(
      id: number,
      payload: {
        description: string
        amount: number
        paymentMethod: string
        isRecurring: boolean
        categoryId: number
        transactionDate: string
      }
    ) {
      try {
        await expenseService.apiUpdateExpense(id, {
          description: payload.description,
          amount: Number(payload.amount),
          paymentMethod: payload.paymentMethod,
          isRecurring: payload.isRecurring,
          categoryId: Number(payload.categoryId),
          transactionDate: payload.transactionDate,
        })
        await this.loadAppropriateData()
      } catch {
        this.hasError = true
      }
    },

    async deleteExpense(expenseId: number) {
      try {
        await expenseService.apiDeleteExpense(expenseId)
        await this.loadAppropriateData()
      } catch (error) {
        console.error('Error deleting expense:', error)
        this.hasError = true
      }
    },

    async fetchCategories() {
      try {
        const list = await categoryService.apiGetCategories()
        this.categories = Array.isArray(list) ? list : []
      } catch (error) {
        console.error('Error fetching categories:', error)
        this.categories = []
      }
    },

    async fetchExpenseGeneralInfo() {
      try {
        const data = await expenseService.getExpenseGeneralInfo()
        return data
      } catch (error) {
        console.error('Error fetching expense general info:', error)
        this.hasError = true
        return null
      } finally {
        this.isLoading = false
      }
    },

    async fetchExpenseList() {
      try {
        const params: {
          PageNumber: number
          PageSize: number
          StartDate?: string
          EndDate?: string
          CategoryId?: number
        } = {
          PageNumber: this.page,
          PageSize: this.pageSizeExpense,
        }
        if (this.startDateExpense) params.StartDate = this.startDateExpense
        if (this.endDateExpense) params.EndDate = this.endDateExpense
        if (this.categoryIdFilter != null) params.CategoryId = this.categoryIdFilter

        const data = await expenseService.apiGetExpenses(params)

        this.financialData.expenseSources = data.items.map(item => ({
          id: item.id,
          description: item.description,
          amount: item.amount,
          paymentMethod: item.paymentMethod,
          isRecurring: item.isRecurring,
          categoryId: item.categoryId,
          categoryName: item.categoryName ?? '',
          transactionDate: item.transactionDate,
          created: item.transactionDate,
        }))
        this.financialData.expenseHasMoreItems = data.hasNextPage
        this.financialData.pageNumberExpense = data.pageNumber
        this.financialData.pageSizeExpense = this.pageSizeExpense
        this.financialData.totalCountExpense = data.totalCount
        this.financialData.totalPagesExpense = data.totalPages
      } catch (error) {
        console.error('Error fetching expense list:', error)
        this.hasError = true
      }
    },

    async fetchExpenseFromServer() {
      this.isLoading = true
      this.hasError = false

      try {
        const [generalInfo] = await Promise.all([
          this.fetchExpenseGeneralInfo(),
          this.fetchExpenseList(),
        ])

        if (generalInfo) {
          // API returns weeklyTotal, monthlyTotal, yearlyTotal, recurringExpensesThisMonth
          this.financialData.weeklyTotalExpense = generalInfo.weeklyTotal ?? 0
          this.financialData.monthlyTotalExpense = generalInfo.monthlyTotal ?? 0
          this.financialData.yearlyTotalExpense = generalInfo.yearlyTotal ?? 0
          this.financialData.recurringExpensesThisMonth =
            generalInfo.recurringExpensesThisMonth ?? 0
          this.financialData.previousWeekTotalExpense = 0
          this.financialData.previousMonthTotalExpense = 0
          this.financialData.previousYearTotalExpense = 0
        }
      } finally {
        this.isLoading = false
      }
    },

    loadAppropriateData() {
      this.fetchExpenseFromServer()
    },
  },
  mounted() {
    this.fetchCategories()
    this.loadAppropriateData()
    window.addEventListener('app:refetch', this.loadAppropriateData)
  },
  beforeUnmount() {
    window.removeEventListener('app:refetch', this.loadAppropriateData)
  },
}
</script>

<style scoped lang="scss">
.expenses-content {
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
  .expenses-content {
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
  .expenses-content {
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

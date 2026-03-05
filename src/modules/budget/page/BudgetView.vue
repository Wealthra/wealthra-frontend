<template>
  <div class="budget-c">
    <UIHorizontalNavbar v-if="isMobile" :initialLanguage="selectedLanguage" />
    <UILeftSideBar
      :initialLanguage="selectedLanguage"
      :selectedPage="selectedLanguage === 'English' ? 'Budget' : 'Bütçe'"
      v-else
    />

    <div class="right-wrapper">
      <UITopBar :selectedLanguage="selectedLanguage" @updateLanguage="handleLanguageUpdate" />
      <div class="budget-title">
        {{ budgetTexts[selectedLanguage].budget }}
      </div>
      <div class="budget-content">
        <BudgetOverviewComponent
          :selectedLanguage="selectedLanguage"
          :currentAmount="financialData.currentAmount"
          :limitAmount="financialData.limitAmount"
        />

        <div class="budget-categories-notifications">
          <BudgetCategoriesComponent
            :selectedLanguage="selectedLanguage"
            :budgetCategoriesData="financialData.budgetCategoriesData"
            :budgetHasMoreItems="financialData.budgetHasMoreItems"
            :pageNumberBudget="financialData.pageNumberBudget"
            :pageSizeBudget="financialData.pageSizeBudget"
            :totalCountBudget="financialData.totalCountBudget"
            :totalPagesBudget="financialData.totalPagesBudget"
            :page="page"
            @changePage="handleChangePage"
            @handleAddNewBudgetCategory="handleAddNewBudgetCategory"
            @handleDeleteBudgetCategoryItem="handleDeleteBudgetCategoryItem"
          />
          <NotificationsComponent
            :selectedLanguage="selectedLanguage"
            :notifications="financialData.budgetNotifications"
            @deleteNotifications="handleDeleteNotifications"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Types
import type { FinancialData } from '@/interfaces/FinancialData'

// Utilities
import { budgetTexts } from '@/data/budgetTexts'
import { budgetService } from '@/services/api/budget/budget.service'
import { notificationService } from '@/services/api/notification/notification.service'

// Shared Components
import UITopBar from '@/components/UITopBar.vue'
import UILeftSideBar from '@/components/UILeftSideBar.vue'
import UIHorizontalNavbar from '@/components/UIHorizontalNavbar.vue'

// Budget Components
import BudgetOverviewComponent from '@/modules/budget/components/BudgetOverviewComponent.vue'
import NotificationsComponent from '@/modules/budget/components/NotificationsComponent.vue'
import BudgetCategoriesComponent from '@/modules/budget/components/BudgetCategoriesComponent.vue'

export default {
  name: 'BudgetView',
  components: {
    UITopBar,
    UILeftSideBar,
    BudgetOverviewComponent,
    NotificationsComponent,
    BudgetCategoriesComponent,
    UIHorizontalNavbar,
  },
  data() {
    return {
      financialData: {} as FinancialData,
      selectedLanguage: 'English' as 'English' | 'Turkish',
      budgetTexts: budgetTexts,
      isLoading: false,
      hasError: false,
      page: 1,
      isMobile: window.innerWidth <= 768,
    }
  },
  methods: {
    // Budget categories fetching
    async fetchBudgetCategories() {
      try {
        const data = await budgetService.getUserBudgets(this.page, 3)
        this.financialData.budgetCategoriesData = data.data
        this.financialData.budgetHasMoreItems = data.hasMoreItems
        this.financialData.pageNumberBudget = data.pageNumber
        this.financialData.pageSizeBudget = data.pageSize
        this.financialData.totalCountBudget = data.totalCount
        this.financialData.totalPagesBudget = data.totalPages
      } catch {
        console.error('Error fetching budget categories')
      }
    },

    // Monthly budget data fetching
    async fetchMonthlyBudget() {
      try {
        const data = await budgetService.getMonthlyBudget()
        this.financialData.currentAmount = data.currentAmount
        this.financialData.limitAmount = data.limitAmount
      } catch {
        console.error('Error fetching monthly budget data')
        this.hasError = true
      }
    },

    // Notification fetching
    async fetchNotifications() {
      try {
        const data = await notificationService.getNotifications()
        this.financialData.budgetNotifications = data
      } catch {
        console.error('Error fetching notifications')
        this.hasError = true
      }
    },

    // Remove notifications
    async deleteNotifications() {
      try {
        await notificationService.deleteNotifications()
        this.loadAppropriateData()
      } catch (error) {
        console.error('Error deleting notifications:', error)
        this.hasError = true
      }
    },

    // Create a new budget category
    async createBudgetCategory(newCategory: {
      categoryId: number
      limitAmount: number
      currentAmount: number
    }) {
      try {
        await budgetService.createBudget({
          limitAmount: newCategory.limitAmount,
          currentAmount: newCategory.currentAmount,
          categoryId: newCategory.categoryId,
        })
        this.loadAppropriateData()
      } catch (error) {
        console.error('Error creating budget category:', error)
      }
    },

    // Delete a budget category
    async deleteBudgetCategoryItem(categoryId: number) {
      try {
        await budgetService.deleteBudget(categoryId)
        this.loadAppropriateData()
      } catch (error) {
        console.error('Error deleting budget category:', error)
      }
    },

    // Helper function to handle the deletion of notifications
    handleDeleteNotifications() {
      this.deleteNotifications()
    },

    // Helper function to handle page changes
    handleChangePage(page: number) {
      this.page = page
      this.fetchBudgetCategories()
    },

    // Helper function to add a new budget category
    handleAddNewBudgetCategory(newCategory: {
      categoryId: number
      limitAmount: number
      currentAmount: number
    }) {
      this.createBudgetCategory(newCategory)
    },

    // Helper function to remove a budget category
    handleDeleteBudgetCategoryItem(categoryId: number) {
      this.deleteBudgetCategoryItem(categoryId)
    },

    // Language state management
    handleLanguageUpdate(language: 'English' | 'Turkish') {
      this.selectedLanguage = language
      localStorage.setItem('selectedLanguage', language)
    },

    loadAppropriateData() {
      this.fetchMonthlyBudget()
      this.fetchBudgetCategories()
      this.fetchNotifications()
    },
  },
  mounted() {
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      this.selectedLanguage = savedLanguage as 'English' | 'Turkish'
    }

    this.loadAppropriateData()
  },
  watch: {},
}
</script>

<style scoped lang="scss">
.budget-c {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;

  .right-wrapper {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;

    width: 100%;
    height: 100vh;
    padding: 0.5rem;
    background-color: var(--background-color);
    overflow-y: auto;
    gap: 1rem;

    @media (max-width: 768px) {
      padding: 0.3rem;
    }

    .budget-title {
      display: flex;
      width: 100%;
      font-size: 1.5rem;
      font-weight: bold;
      padding: 0 2rem;
      color: var(--header-text-color);

      @media (max-width: 768px) {
        padding: 0 1rem;
      }
    }

    .budget-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      align-items: center;
      gap: 2rem;
      padding: 0rem 2rem;
      margin-top: 1rem;

      @media (max-width: 768px) {
        padding: 0rem 1rem;
        gap: 0.5rem;
      }
      .budget-categories-notifications {
        display: flex;
        width: 100%;
        height: 100%;
        gap: 1rem;
      }
    }
  }
}
@media (max-width: 768px) {
  .budget-c {
    flex-direction: column;
    align-items: center;
    .right-wrapper {
      width: 100%;
      padding: 0.5rem;
      gap: 1rem;
      overflow-y: auto;
      S .budget-title {
        font-size: 1.2rem;
        padding: 0 1rem;
      }

      .budget-content {
        padding: 0rem 1rem;
        gap: 0.5rem;

        .budget-categories-notifications {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    }
  }
}
</style>

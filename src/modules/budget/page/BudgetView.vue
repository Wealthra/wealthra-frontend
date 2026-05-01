<template>
  <div class="budget-content">
    <BudgetOverviewComponent
      :selectedLanguage="selectedLanguage"
      :loading="isLoading"
      :currentAmount="overviewTotalSpent"
      :limitAmount="overviewTotalLimit"
    />

    <div class="budget-categories-notifications">
      <div class="budget-table-wrap">
        <UIBudgetTableComponent
          :loading="isLoading"
          :budgets="budgets"
          :categories="categories"
          :selectedLanguage="selectedLanguage"
          @createBudget="handleCreateBudget"
          @updateBudget="handleUpdateBudget"
          @deleteBudget="handleDeleteBudget"
          @categoriesUpdated="fetchCategories"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Types
import type { FinancialData } from '@/interfaces/FinancialData'
import type { BudgetApiModel } from '@/services/api/budget/budget.models'
import type { Category } from '@/services/api/category/category.models'

// Utilities
import { budgetTexts } from '@/data/budgetTexts'
import { budgetService } from '@/services/api/budget/budget.service'
import { categoryService } from '@/services/api/category/category.service'
import { notificationService } from '@/services/api/notification/notification.service'
import { useCurrency } from '@/composables/useCurrency'

// Budget Components
import BudgetOverviewComponent from '@/modules/budget/components/BudgetOverviewComponent.vue'
import UIBudgetTableComponent from '@/modules/budget/components/UIBudgetTableComponent.vue'

export default {
  name: 'BudgetView',
  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
  },
  components: {
    BudgetOverviewComponent,
    UIBudgetTableComponent,
  },
  setup() {
    const { currency } = useCurrency()
    return { currency }
  },
  data() {
    return {
      financialData: {} as FinancialData,
      budgetTexts: budgetTexts,
      isLoading: false,
      hasError: false,
      overviewTotalSpent: 0,
      overviewTotalLimit: 0,
      budgets: [] as BudgetApiModel[],
      categories: [] as Category[],
    }
  },
  methods: {
    async fetchOverview() {
      try {
        const data = await budgetService.apiGetBudgetsOverview()
        this.overviewTotalSpent = data.totalSpent ?? 0
        this.overviewTotalLimit = data.totalLimit ?? 0
      } catch {
        console.error('Error fetching budget overview')
        this.hasError = true
      }
    },

    async fetchBudgets() {
      try {
        const data = await budgetService.apiGetBudgets()
        this.budgets = data ?? []
      } catch {
        console.error('Error fetching budgets')
      }
    },

    async fetchCategories() {
      try {
        const data = await categoryService.apiGetCategories()
        this.categories = (data ?? []).map(c => ({
          id: c.id,
          name: c.categoryName,
        }))
      } catch {
        console.error('Error fetching categories')
      }
    },

    async handleCreateBudget(payload: { categoryId: number; limitAmount: number }) {
      try {
        await budgetService.apiCreateBudget({ ...payload, currency: this.currency })
        this.loadAppropriateData()
      } catch (error) {
        console.error('Error creating budget:', error)
      }
    },

    async handleUpdateBudget(id: number, limitAmount: number) {
      try {
        await budgetService.apiUpdateBudget(id, limitAmount, this.currency)
        this.loadAppropriateData()
      } catch (error) {
        console.error('Error updating budget:', error)
      }
    },

    async handleDeleteBudget(id: number) {
      try {
        await budgetService.apiDeleteBudget(id)
        this.loadAppropriateData()
      } catch (error) {
        console.error('Error deleting budget:', error)
      }
    },



    async loadAppropriateData() {
      this.isLoading = true
      try {
        await Promise.all([
          this.fetchOverview(),
          this.fetchBudgets(),
          this.fetchCategories(),
        ])
      } finally {
        this.isLoading = false
      }
    },
  },
  mounted() {
    this.loadAppropriateData()
    window.addEventListener('app:refetch', this.loadAppropriateData)
  },
  beforeUnmount() {
    window.removeEventListener('app:refetch', this.loadAppropriateData)
  },
}
</script>

<style scoped lang="scss">
/* Same structure as expenses-content: column layout, proper gap and responsive stacking */
.budget-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  gap: 2rem;
  flex: 1 1 auto;
}

.budget-categories-notifications {
  display: flex;
  flex-direction: row;
  width: 100%;
  flex: 1;
  min-height: 0;
  min-width: 0;
  gap: 1rem;
}

.budget-table-wrap {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1024px) {
  .budget-content {
    flex: 0 0 auto;
    min-height: min-content;
  }

  .budget-categories-notifications {
    flex: none;
    min-height: 0;
  }

  .budget-table-wrap {
    min-height: 20rem;
  }
}

@media (max-width: 768px) {
  .budget-content {
    padding: 0 0.5rem;
    gap: 1rem;
  }

  .budget-categories-notifications {
    flex-direction: column;
    gap: 1rem;
  }

  .budget-table-wrap {
    flex: 1 1 auto;
    min-height: 18rem;
  }
}
</style>

<template>
  <ModuleLayout
    :selectedLanguage="selectedLanguage"
    :selectedPage="selectedPage"
    @update-language="handleLanguageUpdate"
  >
    <div class="goals-content">
      <GoalsOverviewComponent
        :selectedLanguage="selectedLanguage"
        :totalInitialAmount="financialData.totalInitialAmount"
        :totalTargetAmount="financialData.totalTargetAmount"
      />

      <div class="goals-categories-wrapper">
        <GoalsCategoriesComponent
          :selectedLanguage="selectedLanguage"
          :goalCategoriesData="financialData.goalCategoriesData"
          @handleDeleteGoalCategoryItem="handleDeleteGoalCategoryItem"
          @handleUpdateGoalCategoryItem="handleUpdateGoalCategoryItem"
        />

        <GoalsAddCategoryComponent
          :selectedLanguage="selectedLanguage"
          @handleAddNewGoalCategory="handleAddNewGoalCategory"
        />
      </div>
    </div>
  </ModuleLayout>
</template>

<script lang="ts">
// Types
import type { FinancialData } from '@/interfaces/FinancialData'

// Utilities
import { goalService } from '@/services/api/goal/goal.service'
import { goalsTexts } from '@/data/goalsTexts'

// Shared Components
import ModuleLayout from '@/layouts/ModuleLayout.vue'

// Goals Components
import GoalsOverviewComponent from '@/modules/goals/components/GoalsOverviewComponent.vue'
import GoalsCategoriesComponent from '@/modules/goals/components/GoalsCategoriesComponent.vue'
import GoalsAddCategoryComponent from '@/modules/goals/components/GoalsAddCategoryComponent.vue'

export default {
  name: 'GoalsView',
  components: {
    ModuleLayout,
    GoalsOverviewComponent,
    GoalsCategoriesComponent,
    GoalsAddCategoryComponent,
  },
  data() {
    return {
      financialData: {} as FinancialData,
      selectedLanguage: 'English' as 'English' | 'Turkish',
      goalsTexts: goalsTexts,
      isLoading: false,
      hasError: false,
      page: 1,
    }
  },
  computed: {
    selectedPage() {
      return this.selectedLanguage === 'English' ? 'Goals' : 'Hedefler'
    },
  },
  methods: {
    // Goals categories fetching
    async fetchGoalCategories() {
      try {
        const data = await goalService.getUserGoals()
        this.financialData.goalCategoriesData = data
      } catch (error) {
        console.error('Error fetching goal categories:', error)
      }
    },

    // Monthly goals data fetching
    async fetchGoalsProgress() {
      try {
        const data = await goalService.getGoalTotal()
        this.financialData.totalInitialAmount = data.totalInitialAmount
        this.financialData.totalTargetAmount = data.totalTargetAmount
      } catch (error) {
        console.error('Error fetching goals progress:', error)
      }
    },

    // Create a new goal category
    async createGoalCategory(newCategory: {
      name: string
      initialDeposit: number
      targetAmount: number
      deadline: string
    }) {
      try {
        await goalService.createGoal({
          name: newCategory.name,
          targetAmount: newCategory.targetAmount,
          initialAmount: newCategory.initialDeposit,
          deadline: newCategory.deadline,
        })

        await this.fetchGoalCategories()
        await this.fetchGoalsProgress()
      } catch (error) {
        console.error('Error creating goal category:', error)
      }
    },

    // Delete a goal category
    async deleteGoalCategoryItem(goalId: number) {
      try {
        await goalService.deleteGoal(goalId)
        await this.fetchGoalCategories()
        await this.fetchGoalsProgress()
      } catch (error) {
        console.error('Error deleting goal category:', error)
      }
    },

    // Update a goal category
    async updateGoalCategoryItem(updatedCategory: {
      id: number
      name: string
      initialAmount: number
      targetAmount: number
      deadline: string
    }) {
      try {
        await goalService.updateGoal(updatedCategory.id, {
          name: updatedCategory.name,
          targetAmount: updatedCategory.targetAmount,
          initialAmount: updatedCategory.initialAmount,
          deadline: updatedCategory.deadline,
        })

        await this.fetchGoalCategories()
        await this.fetchGoalsProgress()
      } catch (error) {
        console.error('Error updating goal category:', error)
      }
    },

    // Helper function to handle the pagination of goal categories
    handlePrevPage() {
      if (this.page > 1) {
        this.page--
        this.loadAppropriateData()
      }
    },
    handleNextPage() {
      this.page++
      this.loadAppropriateData()
    },
    handleUpdateGoalCategoryItem(updatedCategory: {
      id: number
      name: string
      initialAmount: number
      targetAmount: number
      deadline: string
    }) {
      this.updateGoalCategoryItem(updatedCategory)
    },

    // Helper function to add a new goal category
    handleAddNewGoalCategory(newCategory: {
      name: string
      initialDeposit: number
      targetAmount: number
      deadline: string
    }) {
      this.createGoalCategory(newCategory)
    },

    // Helper function to remove a goal category
    handleDeleteGoalCategoryItem(goalId: number) {
      this.deleteGoalCategoryItem(goalId)
    },

    // Language state management
    handleLanguageUpdate(language: 'English' | 'Turkish') {
      this.selectedLanguage = language
      localStorage.setItem('selectedLanguage', language)
    },

    loadAppropriateData() {
      this.fetchGoalCategories()
      this.fetchGoalsProgress()
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

  watch: {},
}
</script>

<style scoped lang="scss">
.goals-title {
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

.goals-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 2rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    padding: 0rem 1rem;
    gap: 0.5rem;
  }
}

.goals-categories-wrapper {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
}
</style>

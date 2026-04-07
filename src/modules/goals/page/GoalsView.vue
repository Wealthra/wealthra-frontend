<template>
  <div class="goals-content">
    <GoalsOverviewComponent
      :selectedLanguage="selectedLanguage"
      :currentAmount="overviewTotalCurrent"
      :limitAmount="overviewTotalTarget"
      :totalGoals="totalGoalsCount || goals.length"
      :achievedGoals="achievedGoalsCount"
    />

    <div class="goals-table-wrap">
      <UIGoalsTableComponent
        :goals="goals"
        :selectedLanguage="selectedLanguage"
        @createGoal="handleCreateGoal"
        @updateGoal="handleUpdateGoal"
        @deleteGoal="handleDeleteGoal"
      />
    </div>
  </div>
</template>

<script lang="ts">
// Types
import type { Goal } from '@/services/api/goal/goal.models'

// Utilities
import { goalService } from '@/services/api/goal/goal.service'

// Goals Components
import GoalsOverviewComponent from '@/modules/goals/components/GoalsOverviewComponent.vue'
import UIGoalsTableComponent from '@/modules/goals/components/UIGoalsTableComponent.vue'

export default {
  name: 'GoalsView',

  components: {
    GoalsOverviewComponent,
    UIGoalsTableComponent,
  },

  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
  },

  data() {
    return {
      isLoading: false,
      hasError: false,
      overviewTotalCurrent: 0,
      overviewTotalTarget: 0,
      goals: [] as Goal[],
      totalGoalsCount: 0,
      achievedGoalsCountFromApi: 0,
    }
  },

  computed: {
    achievedGoalsCount(): number {
      return this.achievedGoalsCountFromApi ?? this.goals.filter((g) => g.isCompleted === true).length
    },
  },

  methods: {
    async fetchGoals() {
      try {
        const data = await goalService.getGoals()
        this.goals = data ?? []
      } catch (error) {
        console.error('Error fetching goals:', error)
      }
    },

    async fetchGoalsTotal() {
      try {
        const data = await goalService.getGoalsTotal()
        this.overviewTotalCurrent = data.totalCurrentAmount ?? 0
        this.overviewTotalTarget = data.totalTargetAmount ?? 0
        this.totalGoalsCount = data.totalGoals ?? 0
        this.achievedGoalsCountFromApi = data.achievedGoals ?? 0
      } catch (error) {
        console.error('Error fetching goals total:', error)
      }
    },

    async handleCreateGoal(payload: {
      name: string
      targetAmount: number
      initialAmount?: number
      currentAmount?: number
      deadline: string
    }) {
      try {
        const currentAmount = payload.currentAmount ?? payload.initialAmount ?? 0
        await goalService.createGoal({
          name: payload.name,
          targetAmount: payload.targetAmount,
          currentAmount,
          deadline: payload.deadline,
        })
        this.loadAppropriateData()
      } catch (error) {
        console.error('Error creating goal:', error)
      }
    },

    async handleUpdateGoal(payload: {
      id: number
      name: string
      targetAmount: number
      initialAmount?: number
      currentAmount?: number
      deadline: string
    }) {
      try {
        const currentAmount = payload.currentAmount ?? payload.initialAmount ?? 0
        await goalService.updateGoal(payload.id, {
          id: payload.id,
          name: payload.name,
          targetAmount: payload.targetAmount,
          currentAmount,
          deadline: payload.deadline,
        })
        this.loadAppropriateData()
      } catch (error) {
        console.error('Error updating goal:', error)
      }
    },

    async handleDeleteGoal(id: number) {
      try {
        await goalService.deleteGoal(id)
        this.loadAppropriateData()
      } catch (error) {
        console.error('Error deleting goal:', error)
      }
    },

    loadAppropriateData() {
      this.fetchGoals()
      this.fetchGoalsTotal()
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
.goals-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  gap: 2rem;
  flex: 1 1 auto;
}

.goals-table-wrap {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .goals-content {
    padding: 0 0.5rem;
    gap: 1rem;
  }

  .goals-table-wrap {
    min-height: 18rem;
  }
}
</style>

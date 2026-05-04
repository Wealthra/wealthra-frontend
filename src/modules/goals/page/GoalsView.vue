<template>
  <div class="goals-content">
    <GoalsOverviewComponent
      :selectedLanguage="selectedLanguage"
      :currentAmount="overviewTotalCurrent"
      :limitAmount="overviewTotalTarget"
      :totalGoals="totalGoalsCount || goals.length"
      :achievedGoals="achievedGoalsCount"
      :loading="isLoading"
      @showAnalysis="openGoalsOverview"
    />

    <div class="goals-table-wrap">
      <UIGoalsTableComponent
        :goals="goals"
        :selectedLanguage="selectedLanguage"
        :loading="isLoading"
        :pageNumber="pageNumber"
        :pageSize="pageSize"
        :totalCount="totalCount"
        :totalPages="totalPages"
        @changePage="handleChangePage"
        @updatePageSize="handlePageSizeUpdate"
        @createGoal="handleCreateGoal"
        @updateGoal="handleUpdateGoal"
        @deleteGoal="handleDeleteGoal"
        @viewGoal="handleViewGoal"
      />
    </div>

    <UIGoalsOverviewPanel
      :is-open="isGoalsOverviewOpen"
      :loading="goalsOverviewLoading"
      :goals="goalsOverviewList"
      :selected-language="selectedLanguage"
      @close="closeGoalsOverview"
    />

    <UIGoalDetailPanel
      :is-open="isGoalDetailOpen"
      :loading="goalDetailLoading"
      :goal="goalDetail"
      :selected-language="selectedLanguage"
      @close="closeGoalDetail"
    />
  </div>
</template>

<script lang="ts">
// Types
import type { Goal } from '@/services/api/goal/goal.models'

// Utilities
import { goalService } from '@/services/api/goal/goal.service'
import { useCurrency } from '@/composables/useCurrency'

// Goals Components
import GoalsOverviewComponent from '@/modules/goals/components/GoalsOverviewComponent.vue'
import UIGoalsTableComponent from '@/modules/goals/components/UIGoalsTableComponent.vue'
import UIGoalsOverviewPanel from '@/modules/goals/components/UIGoalsOverviewPanel.vue'
import UIGoalDetailPanel from '@/modules/goals/components/UIGoalDetailPanel.vue'

export default {
  name: 'GoalsView',

  components: {
    GoalsOverviewComponent,
    UIGoalsTableComponent,
    UIGoalsOverviewPanel,
    UIGoalDetailPanel,
  },
  setup() {
    const { currency } = useCurrency()
    return { currency }
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
      totalCount: 0,
      totalPages: 0,
      pageNumber: 1,
      pageSize: 10,
      achievedGoalsCountFromApi: 0,
      totalGoalsCount: 0,
      isGoalsOverviewOpen: false,
      goalsOverviewLoading: false,
      goalsOverviewList: [] as Goal[],
      isGoalDetailOpen: false,
      goalDetailLoading: false,
      goalDetail: null as Goal | null,
    }
  },
  watch: {
    currency() {
      this.loadAppropriateData()
    },
  },

  computed: {
    achievedGoalsCount(): number {
      return this.achievedGoalsCountFromApi ?? this.goals.filter((g) => g.isCompleted === true).length
    },
  },

  methods: {
    async fetchGoals() {
      try {
        const data = await goalService.getGoalsUser(this.pageNumber, this.pageSize, this.currency)
        this.goals = data.items ?? []
        this.totalCount = data.totalCount ?? 0
        this.totalPages = data.totalPages ?? 0
      } catch (error) {
        console.error('Error fetching goals:', error)
      }
    },

    handleChangePage(page: number) {
      this.pageNumber = page
      this.loadAppropriateData()
    },

    handlePageSizeUpdate(size: number) {
      this.pageSize = size
      this.pageNumber = 1
      this.loadAppropriateData()
    },

    async fetchGoalsTotal() {
      try {
        const data = await goalService.getGoalsTotal(this.currency)
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
          currency: (payload as any).currency || this.currency,
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
          currency: this.currency,
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

    openGoalsOverview() {
      this.isGoalsOverviewOpen = true
      void this.fetchGoalsOverviewList()
    },

    closeGoalsOverview() {
      this.isGoalsOverviewOpen = false
    },

    async fetchGoalsOverviewList() {
      this.goalsOverviewLoading = true
      try {
        const list = await goalService.getGoals(this.currency)
        this.goalsOverviewList = Array.isArray(list) ? list : []
      } catch {
        this.goalsOverviewList = []
      } finally {
        this.goalsOverviewLoading = false
      }
    },

    async handleViewGoal(id: number) {
      this.isGoalDetailOpen = true
      this.goalDetailLoading = true
      this.goalDetail = null
      try {
        this.goalDetail = await goalService.getGoalById(id)
      } catch {
        this.goalDetail = null
      } finally {
        this.goalDetailLoading = false
      }
    },

    closeGoalDetail() {
      this.isGoalDetailOpen = false
      this.goalDetail = null
    },

    async loadAppropriateData() {
      this.isLoading = true
      try {
        await Promise.all([
          this.fetchGoals(),
          this.fetchGoalsTotal()
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
.goals-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  gap: 1rem;
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

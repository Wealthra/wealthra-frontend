<template>
  <ModuleLayout
    :selectedLanguage="selectedLanguage"
    :selectedPage="selectedPage"
    @update-language="handleLanguageUpdate"
  >
    <UILoading
      v-if="isLoading || hasError"
      :isLoading="isLoading"
      :hasError="hasError"
      :loadingText="dashboardTexts[selectedLanguage].loading"
      :errorMessage="dashboardTexts[selectedLanguage].dataError"
      :retryText="dashboardTexts[selectedLanguage].retry"
    />

    <template v-else>
      <div class="welcome-header">
        <span>{{ dashboardTexts[selectedLanguage].welcomeBack }}</span>
        <small>{{ dashboardTexts[selectedLanguage].welcomeSubtext }}</small>
      </div>

      <div class="information-box-wrapper">
        <UIInformationBox
          :currentAmount="dashboardSummary?.totalBalance || 0"
          :lastAmount="dashboardSummary?.totalBalance || 0"
          :title="dashboardTexts[selectedLanguage].totalNetWorth"
          color="yellow"
          type="income"
        />
        <UIInformationBox
          :currentAmount="dashboardSummary?.totalExpenses || 0"
          :lastAmount="dashboardSummary?.totalIncome || 0"
          :title="dashboardTexts[selectedLanguage].totalSpendingThisMonth"
          color="blue"
          type="spending"
        />
        <UIExpenseBox
          :title="dashboardTexts[selectedLanguage].upcomingExpenses"
          :amount="dashboardSummary?.totalExpenses || 0"
        />
      </div>

      <div class="data-wrapper">
        <div class="chart-wrapper">
          <UIDonutChart
            :categories="categorySpending"
            :title="dashboardTexts[selectedLanguage].spendingsBreakdown"
            :donutChartText="dashboardTexts[selectedLanguage].donutChartText"
            :selectedLanguage="selectedLanguage"
          />
        </div>

        <div class="chart-bar-wrapper">
          <div class="chart-wrapper">
            <UIDataChart
              :data="{}"
              :title="dashboardTexts[selectedLanguage].spendings"
              color="blue"
            />
          </div>

          <div class="chart-wrapper">
            <UIDataChart
              :data="{}"
              :title="dashboardTexts[selectedLanguage].incomes"
              color="green"
            />
          </div>
        </div>

        <div class="additional-info">
          <div class="spendings-container">
            <UITopSpendingsBox
              :spendings="topSpendings"
              :title="dashboardTexts[selectedLanguage].topSpendings"
              :selectedLanguage="selectedLanguage"
            />
          </div>
          <div class="goal-container">
            <UIGoalBox :selectedLanguage="selectedLanguage" />
          </div>
        </div>
      </div>
    </template>
  </ModuleLayout>
</template>

<script lang="ts">
import UILoading from '../../../components/UILoading.vue'
import ModuleLayout from '@/layouts/ModuleLayout.vue'

import UIInformationBox from '../components/UIInformationBox.vue'
import UIExpenseBox from '../components/UIExpenseBox.vue'
import UIDonutChart from '../components/UIDonutChart.vue'
import UIDataChart from '../components/UIDataChart.vue'
import UIGoalBox from '../components/UIGoalBox.vue'
import UITopSpendingsBox from '../components/UITopSpendingsBox.vue'

import type { Spendings } from '@/interfaces/Spendings'
import type { DashboardSummaryResponse } from '@/services/api/summary/summary.models'
import { summaryService } from '@/services/api/summary/summary.service'
import { dashboardTexts } from '@/data/dashboardTexts'

type Language = 'English' | 'Turkish'

export default {
  name: 'DashboardView',
  components: {
    ModuleLayout,
    UIInformationBox,
    UIExpenseBox,
    UIDonutChart,
    UIDataChart,
    UIGoalBox,
    UITopSpendingsBox,
    UILoading,
  },
  data() {
    return {
      selectedLanguage: 'English' as Language,
      isLoading: false,
      hasError: false,
      dashboardSummary: {} as DashboardSummaryResponse,
      categorySpending: {} as Record<string, number>,
      topSpendings: [] as Spendings[],
      dashboardTexts: dashboardTexts,
    }
  },
  computed: {
    selectedPage() {
      return this.selectedLanguage === 'English' ? 'Dashboard' : 'Kontrol Paneli'
    },
  },
  methods: {
    handleLanguageUpdate(language: string) {
      this.selectedLanguage = language as Language
      localStorage.setItem('selectedLanguage', this.selectedLanguage)
    },

    async fetchFinancialData() {
      this.isLoading = true
      this.hasError = false

      try {
        const data = await summaryService.getDashboardSummary()

        this.dashboardSummary = data

        // Map top spending categories into a Record for the donut chart
        const categories: Record<string, number> = {}
        data.topSpendingCategories.forEach(item => {
          categories[item.categoryName] = item.totalAmount
        })
        this.categorySpending = categories

        // Map top spending categories into Spendings[] for the top spendings box
        this.topSpendings = data.topSpendingCategories.map((item, index) => ({
          categoryId: index,
          categoryName: item.categoryName,
          totalAmount: item.totalAmount,
        }))
      } catch {
        this.hasError = true
      } finally {
        this.isLoading = false
      }
    },
  },
  mounted() {
    // Load saved preferences
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      this.selectedLanguage = savedLanguage as Language
    }

    // Fetch data
    this.fetchFinancialData()
  },

  beforeUnmount() {
  },

  watch: {},
}
</script>

<style scoped lang="scss">
.welcome-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding: 0 0.7rem;

  span {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--header-text-color);
  }

  small {
    font-size: 0.7rem;
    color: var(--normal-text-color);
  }
}

.information-box-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 0.7rem;
  width: 100%;
}

.data-wrapper {
  display: flex;
  align-items: start;
  gap: 1.2rem;
  width: 100%;
  height: 100%;

  .chart-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 95%;
    padding: 0.7rem;
    gap: 1.2rem;
    border: var(--border-color) solid 1px;
    border-radius: var(--border-radius);

    &.no-data-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      min-height: 240px;

      .no-data-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        max-width: 80%;

        .no-data-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          opacity: 0.6;
        }

        .no-data-message {
          font-size: 1rem;
          color: var(--normal-text-color);
          text-align: center;
          line-height: 1.5;
        }
      }
    }
  }

  .chart-bar-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 95%;
    width: 100%;
    gap: 1rem;
  }

  .additional-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 95%;
    width: 100%;
    gap: 1rem;

    .spendings-container,
    .goal-container {
      width: 100%;
      height: 100%;
    }
  }
}

@media (max-width: 768px) {
  .information-box-wrapper {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .data-wrapper {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
}
</style>

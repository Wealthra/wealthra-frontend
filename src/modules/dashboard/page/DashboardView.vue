<template>
  <div class="dashboard-c">
    <UIHorizontalNavbar v-if="isMobile" :initialLanguage="selectedLanguage" />
    <UILeftSideBar
      :initialLanguage="selectedLanguage"
      :selectedPage="selectedLanguage === 'English' ? 'Dashboard' : 'Kontrol Paneli'"
      v-else
    />

    <div class="right-bar">
      <UITopBar :selectedLanguage="selectedLanguage" @update-language="handleLanguageUpdate" />

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
          <span
            >{{ dashboardTexts[selectedLanguage].welcomeBack }},
            {{ financialData.firstName }}!</span
          >
          <small>{{ dashboardTexts[selectedLanguage].welcomeSubtext }}</small>
        </div>

        <div class="information-box-wrapper">
          <UIInformationBox
            :currentAmount="financialData?.totalBalance"
            :lastAmount="financialData?.lastMonthBalance"
            :title="dashboardTexts[selectedLanguage].totalNetWorth"
            color="yellow"
            type="income"
          />
          <UIInformationBox
            :currentAmount="financialData?.currentMonthSpending"
            :lastAmount="financialData?.lastMonthSpending || financialData?.currentMonthSpending"
            :title="dashboardTexts[selectedLanguage].totalSpendingThisMonth"
            color="blue"
            type="spending"
          />
          <UIExpenseBox
            :title="dashboardTexts[selectedLanguage].upcomingExpenses"
            :amount="financialData?.totalRecurringExpenses"
          />
        </div>

        <div class="data-wrapper">
          <div class="chart-wrapper">
            <UIDonutChart
              :categories="financialData.categorySpending"
              :title="dashboardTexts[selectedLanguage].spendingsBreakdown"
              :donutChartText="dashboardTexts[selectedLanguage].donutChartText"
              :selectedLanguage="selectedLanguage"
            />
          </div>

          <div class="chart-bar-wrapper">
            <div class="chart-wrapper">
              <UIDataChart
                :data="financialData.monthlyExpensesLastYear"
                :title="dashboardTexts[selectedLanguage].spendings"
                color="blue"
              />
            </div>

            <div class="chart-wrapper">
              <UIDataChart
                :data="financialData.monthlyIncomesLastYear"
                :title="dashboardTexts[selectedLanguage].incomes"
                color="green"
              />
            </div>
          </div>

          <div class="additional-info">
            <div class="spendings-container">
              <UITopSpendingsBox
                :spendings="financialData.topSpendingCategories"
                :title="dashboardTexts[selectedLanguage].topSpendings"
                :selectedLanguage="selectedLanguage"
              />
            </div>
            <div class="goal-container">
              <UIGoalBox
                :financialGoal="financialData.latestGoal"
                :selectedLanguage="selectedLanguage"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import UITopBar from '../../../components/UITopBar.vue'
import UILeftSideBar from '../../../components/UILeftSideBar.vue'
import UILoading from '../../../components/UILoading.vue'
import UIHorizontalNavbar from '@/components/UIHorizontalNavbar.vue'

import UIInformationBox from '../components/UIInformationBox.vue'
import UIExpenseBox from '../components/UIExpenseBox.vue'
import UIDonutChart from '../components/UIDonutChart.vue'
import UIDataChart from '../components/UIDataChart.vue'
import UIGoalBox from '../components/UIGoalBox.vue'
import UITopSpendingsBox from '../components/UITopSpendingsBox.vue'

import { getUserId } from '../../../utils/auth'

import type { FinancialData } from '../../../interfaces/FinancialData'
import { dashboardTexts } from '@/data/dashboardTexts'
import { financialSummaryService } from '@/services/api/financialSummary/financialSummary.service'

type Language = 'English' | 'Turkish'

export default {
  name: 'DashboardView',
  components: {
    UITopBar,
    UIInformationBox,
    UIExpenseBox,
    UIDonutChart,
    UIDataChart,
    UIGoalBox,
    UITopSpendingsBox,
    UILeftSideBar,
    UILoading,
    UIHorizontalNavbar,
  },
  data() {
    return {
      selectedLanguage: 'English' as Language,
      isLoading: false,
      hasError: false,
      financialData: {} as FinancialData,
      dashboardTexts: dashboardTexts,
      isMobile: window.innerWidth <= 768,
      windowWidth: window.innerWidth,
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

    handleResize() {
      this.windowWidth = window.innerWidth
      this.isMobile = this.windowWidth <= 768
    },

    async fetchFinancialData() {
      const userId = getUserId()

      if (!userId) {
        this.hasError = true
        return
      }

      this.isLoading = true
      this.hasError = false

      try {
        const data = await financialSummaryService.getUserFinancialSummary(userId)

        this.financialData.firstName = data.firstName
        this.financialData.categorySpending = data.categorySpending
        this.financialData.currentMonthSpending = data.currentMonthSpending
        this.financialData.goalProgress = data.goalProgress
        this.financialData.lastMonthBalance = data.lastMonthBalance
        this.financialData.lastMonthSpending = data.lastMonthSpending
        this.financialData.latestGoal = data.latestGoal
        this.financialData.monthlyExpensesLastYear = data.monthlyExpensesLastYear
        this.financialData.monthlyIncomesLastYear = data.monthlyIncomesLastYear
        this.financialData.topSpendingCategories = data.topSpendingCategories
        this.financialData.totalBalance = data.totalBalance
        this.financialData.totalRecurringExpenses = data.totalRecurringExpenses
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

    window.addEventListener('resize', this.handleResize)

    // Fetch data
    this.fetchFinancialData()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },

  watch: {},
}
</script>

<style scoped lang="scss">
.dashboard-c {
  display: flex;
  align-items: flex-start;
  width: 100%;
  height: 100vh;

  .right-bar {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    align-items: center;
    padding: 0.5rem;
    background-color: var(--background-color);
    gap: 1.5rem;

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
      padding: 0 0.7rem;
    }

    .data-wrapper {
      display: flex;
      align-items: start;
      padding: 0 0.7rem;
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

    .loading-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 2rem;
      gap: 0.7rem;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--border-color);
        border-top: 4px solid var(--primary-blue-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text {
        font-size: 0.9rem;
        color: var(--normal-text-color);
      }
    }

    .box-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;

      &.no-data-box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 1.2rem;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        background-color: var(--background-color);
        margin-bottom: 0.7rem;

        .no-data-box-title {
          font-size: 0.9rem;
          font-weight: bold;
          color: var(--header-text-color);
          margin-bottom: 0.7rem;
        }

        .no-data-box-message {
          font-size: 0.8rem;
          color: var(--normal-text-color);
          text-align: center;
        }
      }

      &.no-goal-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: 1.2rem;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        background-color: var(--background-color);
        margin-bottom: 0;

        .no-goal-text {
          font-size: 0.9rem;
          color: var(--normal-text-color);
          text-align: center;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-c {
    flex-direction: column;
    align-items: center;

    .right-bar {
      width: 100%;
      padding: 0.5rem;
      gap: 1rem;
      overflow: auto;

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
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>

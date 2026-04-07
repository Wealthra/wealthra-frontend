<template>
  <UILoading
      v-if="isLoading || hasError"
      :isLoading="isLoading"
      :hasError="hasError"
      :loadingText="dashboardTexts[selectedLanguage].loading"
      :errorMessage="dashboardTexts[selectedLanguage].dataError"
      :retryText="dashboardTexts[selectedLanguage].retry"
    />

    <template v-else>
      <div class="dashboard-page">
      <div class="information-box-wrapper">
        <div class="information-box-wrapper__item">
          <UIInformationBox
            :currentAmount="summaryHeader.totalBalance"
            :lastAmount="summaryHeader.totalBalance"
            :title="dashboardTexts[selectedLanguage].totalNetWorth"
            color="yellow"
            type="income"
            icon="fas fa-wallet"
            icon-color="var(--primary-yellow-color)"
            :showTrend="false"
          />
        </div>
        <div class="information-box-wrapper__item">
          <UIInformationBox
            :currentAmount="summaryHeader.totalExpenses"
            :lastAmount="summaryHeader.totalIncome"
            :title="dashboardTexts[selectedLanguage].totalSpendingThisMonth"
            color="blue"
            type="spending"
            icon="fas fa-credit-card"
            icon-color="var(--primary-blue-color)"
            :showTrend="false"
          />
        </div>
        <div class="information-box-wrapper__item">
          <UIInformationBox
            :currentAmount="summaryHeader.totalIncome"
            :lastAmount="summaryHeader.totalIncome"
            :title="dashboardTexts[selectedLanguage].totalIncome"
            color="green"
            type="income"
            icon="fas fa-arrow-trend-up"
            icon-color="var(--primary-green-color)"
            :showTrend="false"
          />
        </div>
        <div class="information-box-wrapper__item">
          <UIInformationBox
            :currentAmount="budgetAlerts.length"
            :lastAmount="0"
            :title="dashboardTexts[selectedLanguage].budgetAlerts"
            color="red"
            type="spending"
            icon="fas fa-triangle-exclamation"
            icon-color="var(--primary-red-color)"
            :showTrend="false"
            valuePrefix=""
          />
        </div>
        <div class="information-box-wrapper__item">
          <UIInformationBox
            :currentAmount="summaryHeader.unreadNotificationsCount"
            :lastAmount="summaryHeader.unreadNotificationsCount"
            :title="dashboardTexts[selectedLanguage].unreadNotifications"
            color="pink"
            type="income"
            icon="fas fa-bell"
            icon-color="var(--primary-pink-color)"
            :showTrend="false"
            valuePrefix=""
          />
        </div>
      </div>

      <div class="data-wrapper">
        <!-- Row 1: Donut + Top Spendings + Budget Alerts -->
        <div class="row row--top">
          <div class="chart-box chart-box--pie">
            <div class="chart-box-inner">
              <UIDonutChart
                :categories="categorySpending"
                :title="dashboardTexts[selectedLanguage].spendingsBreakdown"
                :donutChartText="dashboardTexts[selectedLanguage].donutChartText"
                :selectedLanguage="selectedLanguage"
              />
            </div>
          </div>
          <div class="info-box info-box--top-spendings">
            <UITopSpendingsBox
              :spendings="topSpendings"
              :title="dashboardTexts[selectedLanguage].topSpendings"
              :selectedLanguage="selectedLanguage"
            />
          </div>
          <div class="info-box info-box--budget-alerts">
            <UIBudgetAlertsCard
              :alerts="budgetAlerts"
              :title="dashboardTexts[selectedLanguage].budgetAlerts"
              :emptyText="dashboardTexts[selectedLanguage].noBudgetAlerts"
              :statusExceededText="dashboardTexts[selectedLanguage].statusExceeded"
              :statusWarningText="dashboardTexts[selectedLanguage].statusWarning"
            />
          </div>
        </div>

        <!-- Row 2: Line chart full width -->
        <div class="row row--middle">
          <div class="chart-box chart-box--line">
            <div class="chart-box-inner">
              <UIIncomeExpenseLineChart
                :labels="lineChartLabels"
                :incomeValues="lineChartIncomeValues"
                :expenseValues="lineChartExpenseValues"
                :incomeLabel="dashboardTexts[selectedLanguage].incomes"
                :expenseLabel="dashboardTexts[selectedLanguage].spendings"
                :noDataText="dashboardTexts[selectedLanguage].noChartData"
              />
            </div>
          </div>
        </div>

        <!-- Row 3: Goals, Recommendations, Recent Transactions -->
        <div class="row row--bottom">
          <div class="info-box info-box--goals">
            <div class="goals-overview-card">
              <div class="goals-overview-card__title">
                {{ dashboardTexts[selectedLanguage].savingsGoal }}
              </div>
              <GoalsOverviewComponent
                v-if="goalsOverview"
                :selectedLanguage="selectedLanguage"
                :currentAmount="goalsOverview.currentAmount"
                :limitAmount="goalsOverview.limitAmount"
                :totalGoals="goalsOverview.totalGoals"
                :achievedGoals="goalsOverview.achievedGoals"
              />
              <div v-else class="dashboard-empty-state">
                <div class="dashboard-empty-state__icon-wrap">
                  <font-awesome-icon
                    :icon="emptySavingsIcon"
                    class="dashboard-empty-state__icon"
                    aria-hidden="true"
                  />
                </div>
                <h2 class="dashboard-empty-state__heading">
                  {{ dashboardTexts[selectedLanguage].savingsGoal }}
                </h2>
                <p class="dashboard-empty-state__text">
                  {{ dashboardTexts[selectedLanguage].noGoals }}
                </p>
              </div>
            </div>
          </div>

          <div class="info-box info-box--recommendations">
            <div class="recommendations-card">
              <div class="recommendations-card__title">
                {{ dashboardTexts[selectedLanguage].recommendations }}
              </div>
              <div
                v-if="!recommendations || recommendations.length === 0"
                class="dashboard-empty-state"
              >
                <div class="dashboard-empty-state__icon-wrap">
                  <font-awesome-icon
                    :icon="emptyRecommendationsIcon"
                    class="dashboard-empty-state__icon"
                    aria-hidden="true"
                  />
                </div>
                <h2 class="dashboard-empty-state__heading">
                  {{ dashboardTexts[selectedLanguage].recommendations }}
                </h2>
                <p class="dashboard-empty-state__text">
                  {{ dashboardTexts[selectedLanguage].noRecommendations }}
                </p>
              </div>
              <ul v-else class="recommendations-card__list">
                <li
                  v-for="rec in recommendations"
                  :key="rec.id"
                  class="recommendations-card__item"
                >
                  <div class="recommendations-card__item-header">
                    <span class="recommendations-card__item-title">{{ rec.title }}</span>
                    <span v-if="rec.severity" class="recommendations-card__item-severity">
                      {{ rec.severity }}
                    </span>
                  </div>
                  <div class="recommendations-card__item-body">
                    {{ rec.description }}
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div class="info-box info-box--recent-transactions">
            <UIRecentTransactionsCard
              :transactions="recentTransactions"
              :title="dashboardTexts[selectedLanguage].recentTransactions"
              :emptyText="dashboardTexts[selectedLanguage].noRecentTransactions"
              :selectedLanguage="selectedLanguage"
            />
          </div>
        </div>
      </div>
      </div>
    </template>
</template>

<script lang="ts">
import UILoading from '../../../components/UILoading.vue'

import UIInformationBox from '../components/UIInformationBox.vue'
import UIDonutChart from '../components/UIDonutChart.vue'
import UIIncomeExpenseLineChart from '../components/UIIncomeExpenseLineChart.vue'
import UITopSpendingsBox from '../components/UITopSpendingsBox.vue'
import UIRecentTransactionsCard from '../components/UIRecentTransactionsCard.vue'
import UIBudgetAlertsCard from '../components/UIBudgetAlertsCard.vue'
import GoalsOverviewComponent from '@/modules/goals/components/GoalsOverviewComponent.vue'
import { emptyStateIcons } from '@/icons/fontawesome-icons'

import type { Spendings } from '@/interfaces/Spendings'
import type {
  DashboardSummaryResponse,
  DashboardSummaryHeader,
  DashboardCharts,
  DashboardLists,
  DashboardGoalsOverview,
  DashboardRecommendation,
  IncomeExpenseTrendPoint,
} from '@/services/api/summary/summary.models'
import { summaryService } from '@/services/api/summary/summary.service'
import { dashboardTexts } from '@/data/dashboardTexts'
import { getCategoryColorByIndex } from '@/utils/chartCategoryPalette'

export default {
  name: 'DashboardView',
  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
  },
  components: {
    UIInformationBox,
    UIDonutChart,
    UIIncomeExpenseLineChart,
    UITopSpendingsBox,
    UIRecentTransactionsCard,
    UIBudgetAlertsCard,
    GoalsOverviewComponent,
    UILoading,
  },
  data() {
    return {
      isLoading: false,
      hasError: false,
      dashboardSummary: {} as DashboardSummaryResponse,
      summaryHeader: {
        totalBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        unreadNotificationsCount: 0,
      } as DashboardSummaryHeader,
      charts: {} as DashboardCharts,
      lists: {
        recentTransactions: [],
        topSpendingCategories: [],
        budgetAlerts: [],
      } as DashboardLists,
      goalsOverview: null as DashboardGoalsOverview | null,
      recommendations: [] as DashboardRecommendation[],
      categorySpending: {} as Record<string, number>,
      topSpendings: [] as Spendings[],
      dashboardTexts: dashboardTexts,
      emptySavingsIcon: emptyStateIcons.incomeSources,
      emptyRecommendationsIcon: emptyStateIcons.transactions,
    }
  },
  computed: {
    spendingsByMonth(): Record<string, number> {
      const list = this.recentTransactions || []
      const byMonth: Record<string, number> = {}
      list.forEach(tx => {
        if (tx.type !== 'Expense') return
        const date = new Date(tx.transactionDate)
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        byMonth[key] = (byMonth[key] ?? 0) + tx.amount
      })
      return this.sortMonthKeys(byMonth)
    },
    incomesByMonth(): Record<string, number> {
      const list = this.recentTransactions || []
      const byMonth: Record<string, number> = {}
      list.forEach(tx => {
        if (tx.type !== 'Income') return
        const date = new Date(tx.transactionDate)
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        byMonth[key] = (byMonth[key] ?? 0) + tx.amount
      })
      return this.sortMonthKeys(byMonth)
    },
    lineChartLabels(): string[] {
      const trend = this.charts.incomeExpenseTrend
      if (trend && Array.isArray(trend.points) && trend.points.length > 0) {
        return trend.points.map((p: IncomeExpenseTrendPoint) => p.label)
      }
      const spendings = this.spendingsByMonth
      const incomes = this.incomesByMonth
      const allKeys = new Set([...Object.keys(spendings), ...Object.keys(incomes)])
      const sorted = Array.from(allKeys).sort((a, b) => {
        const dA = new Date(a)
        const dB = new Date(b)
        return dA.getTime() - dB.getTime()
      })
      return sorted
    },
    lineChartIncomeValues(): number[] {
      const trend = this.charts.incomeExpenseTrend
      if (trend && Array.isArray(trend.points) && trend.points.length > 0) {
        return trend.points.map((p: IncomeExpenseTrendPoint) => p.income)
      }
      return this.lineChartLabels.map(label => this.incomesByMonth[label] ?? 0)
    },
    lineChartExpenseValues(): number[] {
      const trend = this.charts.incomeExpenseTrend
      if (trend && Array.isArray(trend.points) && trend.points.length > 0) {
        return trend.points.map((p: IncomeExpenseTrendPoint) => p.expense)
      }
      return this.lineChartLabels.map(label => this.spendingsByMonth[label] ?? 0)
    },
    recentTransactions() {
      return (this.lists && this.lists.recentTransactions) || this.dashboardSummary?.recentTransactions || []
    },
    budgetAlerts() {
      return (this.lists && this.lists.budgetAlerts) || this.dashboardSummary?.budgetAlerts || []
    },
  },
  methods: {
    sortMonthKeys(byMonth: Record<string, number>): Record<string, number> {
      const keys = Object.keys(byMonth)
      if (keys.length === 0) return {}
      const sorted = keys.sort((a, b) => {
        const dA = new Date(a)
        const dB = new Date(b)
        return dA.getTime() - dB.getTime()
      })
      const out: Record<string, number> = {}
      sorted.forEach(k => { out[k] = byMonth[k] })
      return out
    },
    async fetchFinancialData() {
      this.isLoading = true
      this.hasError = false

      try {
        const data = await summaryService.getDashboardSummary()

        this.dashboardSummary = data
        this.summaryHeader = data.summary ?? {
          totalBalance: data.totalBalance,
          totalIncome: data.totalIncome,
          totalExpenses: data.totalExpenses,
          unreadNotificationsCount: data.unreadNotificationsCount,
        }
        this.charts = data.charts ?? {}
        this.lists = data.lists ?? {
          recentTransactions: data.recentTransactions ?? [],
          topSpendingCategories: data.topSpendingCategories ?? [],
          budgetAlerts: data.budgetAlerts ?? [],
        }
        this.goalsOverview = data.goalsOverview ?? null
        this.recommendations = data.recommendations ?? []

        // Use top spending categories from either lists.topSpendingCategories or legacy array
        // IMPORTANT: keep each item as an individual entry (no aggregation by name)
        const sourceTopCategories = (this.lists.topSpendingCategories && this.lists.topSpendingCategories.length > 0
          ? this.lists.topSpendingCategories
          : data.topSpendingCategories) || []
        const categories: Record<string, number> = {}
        sourceTopCategories.forEach(item => {
          if (item.categoryName) {
            categories[item.categoryName] = item.totalAmount
          }
        })
        this.categorySpending = categories

        // Map individual top spending items into Spendings[] for the top spendings box
        this.topSpendings = sourceTopCategories.map((item, index) => ({
          categoryId: index,
          categoryName: item.categoryName,
          totalAmount: item.totalAmount,
          transactionCount: item.transactionCount,
          color: getCategoryColorByIndex(index),
        }))
      } catch {
        this.hasError = true
      } finally {
        this.isLoading = false
      }
    },
  },
  mounted() {
    this.fetchFinancialData()
    window.addEventListener('app:refetch', this.fetchFinancialData)
  },

  beforeUnmount() {
    window.removeEventListener('app:refetch', this.fetchFinancialData)
  },

  watch: {},
}
</script>

<style scoped lang="scss">
.dashboard-page {
  width: 100%;
  min-width: 0;
  min-height: min-content;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.information-box-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.7rem;
  width: 100%;

  .information-box-wrapper__item {
    flex: 1 1 0;
    min-width: 160px;
    min-height: 0;
  }
}

.data-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
  min-height: 0;

  .chart-box {
    min-width: 0;
    min-height: 240px;
    max-height: 500px;
    background: var(--background-color);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.chart-box--pie {
      flex: 0 0 auto;
    }

    &.chart-box--line {
      flex: 0 0 auto;
    }

    .chart-box-inner {
      width: 100%;
      height: 100%;
      min-height: 240px;
      max-height: 500px;
      min-width: 0;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      overflow: hidden;

      > * {
        flex: 1;
        min-height: 0;
      }
    }
  }

  .row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    width: 100%;
    min-height: 0;

    &.row--middle {
      grid-template-columns: minmax(0, 1fr);
    }

    .info-box,
    .chart-box {
      width: 100%;
      min-width: 0;
      min-height: 0;
    }

    .goals-overview-card,
    .recommendations-card {
      width: 100%;
      height: 100%;
      padding: 1.2rem;
      border-radius: var(--border-radius);
      background: var(--background-color);
      font-family: var(--main-font);
      box-sizing: border-box;
    }

    .goals-overview-card__title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--header-text-color);
      margin-bottom: 0.5rem;
    }

    .recommendations-card__title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--header-text-color);
      margin-bottom: 0.5rem;
    }

    .recommendations-card__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .recommendations-card__item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .recommendations-card__item-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--header-text-color);
    }

    .recommendations-card__item-severity {
      font-size: 0.75rem;
      text-transform: capitalize;
      color: var(--normal-text-color);
      opacity: 0.9;
    }

    .recommendations-card__item-body {
      font-size: 0.85rem;
      color: var(--normal-text-color);
    }

    .dashboard-empty-state {
      flex: 1;
      min-height: 10rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 1.5rem 1rem;
    }

    .dashboard-empty-state__icon-wrap {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: var(--border-radius);
      background-color: rgba(92, 184, 92, 0.12);
      color: var(--primary-green-color);
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dashboard-empty-state__icon {
      font-size: 1.6rem;
    }

    .dashboard-empty-state__heading {
      margin: 0 0 0.35rem;
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--header-text-color);
    }

    .dashboard-empty-state__text {
      margin: 0;
      font-size: 0.9rem;
      color: var(--normal-text-color);
      max-width: 22rem;
      line-height: 1.5;
    }
  }
}

@media (max-width: 768px) {
  .information-box-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    width: 100%;

    .information-box-wrapper__item {
      min-width: 0;
    }
  }

  .data-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    width: 100%;

    .charts-row {
      flex-direction: column;

      .chart-box--pie,
      .chart-box--line {
        flex: 0 0 auto;
        width: 100%;
      }
    }

    .row {
      grid-template-columns: 1fr;
    }
  }
}
</style>

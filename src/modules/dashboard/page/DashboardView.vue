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
            :currentAmount="dashboardSummary?.totalBalance || 0"
            :lastAmount="dashboardSummary?.totalBalance || 0"
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
            :currentAmount="dashboardSummary?.totalExpenses || 0"
            :lastAmount="dashboardSummary?.totalIncome || 0"
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
            :currentAmount="dashboardSummary?.totalIncome || 0"
            :lastAmount="dashboardSummary?.totalIncome || 0"
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
            :currentAmount="dashboardSummary?.totalExpenses || 0"
            :lastAmount="dashboardSummary?.totalExpenses || 0"
            :title="dashboardTexts[selectedLanguage].upcomingExpenses"
            color="red"
            type="spending"
            icon="fas fa-calendar"
            icon-color="var(--primary-red-color)"
            :showTrend="false"
          />
        </div>
        <div class="information-box-wrapper__item">
          <UIInformationBox
            :currentAmount="dashboardSummary?.unreadNotificationsCount ?? 0"
            :lastAmount="dashboardSummary?.unreadNotificationsCount ?? 0"
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
        <div class="charts-row">
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

        <div class="additional-info">
          <div class="spendings-container">
            <UITopSpendingsBox
              :spendings="topSpendings"
              :title="dashboardTexts[selectedLanguage].topSpendings"
              :selectedLanguage="selectedLanguage"
            />
          </div>
          <div class="recent-transactions-container">
            <UIRecentTransactionsCard
              :transactions="dashboardSummary?.recentTransactions ?? []"
              :title="dashboardTexts[selectedLanguage].recentTransactions"
              :emptyText="dashboardTexts[selectedLanguage].noRecentTransactions"
              :selectedLanguage="selectedLanguage"
            />
          </div>
          <div class="budget-alerts-container">
            <UIBudgetAlertsCard
              :alerts="dashboardSummary?.budgetAlerts ?? []"
              :title="dashboardTexts[selectedLanguage].budgetAlerts"
              :emptyText="dashboardTexts[selectedLanguage].noBudgetAlerts"
              :statusExceededText="dashboardTexts[selectedLanguage].statusExceeded"
              :statusWarningText="dashboardTexts[selectedLanguage].statusWarning"
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

import type { Spendings } from '@/interfaces/Spendings'
import type { DashboardSummaryResponse } from '@/services/api/summary/summary.models'
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
    UILoading,
  },
  data() {
    return {
      isLoading: false,
      hasError: false,
      dashboardSummary: {} as DashboardSummaryResponse,
      categorySpending: {} as Record<string, number>,
      topSpendings: [] as Spendings[],
      dashboardTexts: dashboardTexts,
    }
  },
  computed: {
    spendingsByMonth(): Record<string, number> {
      const list = this.dashboardSummary?.recentTransactions ?? []
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
      const list = this.dashboardSummary?.recentTransactions ?? []
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
      return this.lineChartLabels.map(
        label => this.incomesByMonth[label] ?? 0
      )
    },
    lineChartExpenseValues(): number[] {
      return this.lineChartLabels.map(
        label => this.spendingsByMonth[label] ?? 0
      )
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

        // Aggregate top spending categories by categoryName (sum amounts for duplicates)
        const categories: Record<string, number> = {}
        data.topSpendingCategories.forEach(item => {
          const name = item.categoryName
          categories[name] = (categories[name] ?? 0) + item.totalAmount
        })
        this.categorySpending = categories

        // Map aggregated categories into Spendings[] for the top spendings box (colors by index, no hardcoded keys)
        this.topSpendings = Object.entries(categories).map(([categoryName, totalAmount], index) => ({
          categoryId: index,
          categoryName,
          totalAmount,
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
  },

  beforeUnmount() {
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

  .charts-row {
    display: flex;
    gap: 1rem;
    width: 100%;
    min-width: 0;
  }

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
      flex: 0 0 25%;
    }

    &.chart-box--line {
      flex: 1;
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

  .additional-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    width: 100%;
    min-height: 0;

    .spendings-container,
    .recent-transactions-container,
    .budget-alerts-container {
      width: 100%;
      min-width: 0;
      min-height: 0;
    }

    .recent-transactions-container,
    .budget-alerts-container {
      max-height: 280px;
      overflow: auto;
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

    .additional-info {
      grid-template-columns: 1fr;
    }
  }
}
</style>

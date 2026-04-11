<template>
  <div class="dashboard-page">
    <div v-if="hasError" class="error-container">
      <div class="error-message">
        {{ dashboardTexts[selectedLanguage].dataError }}
        <button @click="fetchFinancialData" class="retry-btn">
          {{ dashboardTexts[selectedLanguage].retry }}
        </button>
      </div>
    </div>

    <!-- 1. LAYER: Z-Pattern — Quick Glance KPIs -->
    <div class="kpi-grid">
      <UIInformationBox
        :loading="isLoading"
        :currentAmount="summaryHeader.totalBalance"
        :lastAmount="summaryHeader.totalBalance"
        :title="dashboardTexts[selectedLanguage].totalNetWorth"
        color="yellow"
        type="income"
        icon="fas fa-wallet"
        icon-color="var(--primary-yellow-color)"
        :showTrend="false"
      />
      <div class="kpi-item">
        <UIInformationBox
          :loading="isLoading"
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
      <div class="kpi-item">
        <UIInformationBox
          :loading="isLoading"
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
      <div class="kpi-item">
        <UIInformationBox
          :loading="isLoading"
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
      <div class="kpi-item">
        <UIInformationBox
          :loading="isLoading"
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

    <!-- ANA 12-COLUMN DASHBOARD GRID -->
    <div class="dashboard-grid">
      <!-- 2. LAYER (BIG/PRIMARY): Ana Analiz (8 Kolon) + Asistan Modülleri (4 Kolon) -->
      <div class="grid-item col-span-8 main-chart-card">
        <div class="card-inner">
          <UIIncomeExpenseLineChart
            :loading="isLoading"
            :labels="lineChartLabels"
            :incomeValues="lineChartIncomeValues"
            :expenseValues="lineChartExpenseValues"
            :incomeLabel="dashboardTexts[selectedLanguage].incomes"
            :expenseLabel="dashboardTexts[selectedLanguage].spendings"
            :noDataText="dashboardTexts[selectedLanguage].noChartData"
          />
        </div>
      </div>

      <div class="grid-item col-span-4 assistant-sidebar">
        <div class="info-card">
          <UIBudgetAlertsCard
            :loading="isLoading"
            :alerts="budgetAlerts"
            :title="dashboardTexts[selectedLanguage].budgetAlerts"
            :emptyText="dashboardTexts[selectedLanguage].noBudgetAlerts"
            :statusExceededText="dashboardTexts[selectedLanguage].statusExceeded"
            :statusWarningText="dashboardTexts[selectedLanguage].statusWarning"
          />
        </div>
        <div class="info-card recommendations-card">
          <div v-if="isLoading" class="card-header">
            <div class="skeleton-box title-skeleton"></div>
          </div>
          <div v-else class="card-header">
            {{ dashboardTexts[selectedLanguage].recommendations }}
          </div>

          <div v-if="isLoading" class="rec-list">
            <div v-for="i in 3" :key="i" class="rec-item skeleton-item">
              <div class="skeleton-box rec-title-skeleton"></div>
              <div class="skeleton-box rec-desc-skeleton"></div>
            </div>
          </div>

          <div v-else-if="!recommendations || recommendations.length === 0" class="empty-state">
            <font-awesome-icon :icon="emptyRecommendationsIcon" class="empty-icon" />
            <p>{{ dashboardTexts[selectedLanguage].noRecommendations }}</p>
          </div>
          <ul v-else class="rec-list">
            <li
              v-for="rec in recommendations"
              :key="rec.id"
              :class="[
                'rec-item',
                'rec-item--' + (rec.severity ? rec.severity.toLowerCase() : 'low'),
              ]"
            >
              <div class="rec-title">
                <span>{{ rec.title }}</span>
                <span v-if="rec.severity" class="badge">{{ rec.severity }}</span>
              </div>
              <div class="rec-desc">{{ rec.description }}</div>
            </li>
          </ul>
        </div>
      </div>

      <!-- 3. LAYER (MEDIUM/FILTER): Dağılım, Harcamalar ve Tasarruf Hedefi -->
      <div class="grid-item col-span-4 info-card">
        <UIDonutChart
          :loading="isLoading"
          :categories="categorySpending"
          :title="dashboardTexts[selectedLanguage].spendingsBreakdown"
          :donutChartText="dashboardTexts[selectedLanguage].donutChartText"
          :selectedLanguage="selectedLanguage"
        />
      </div>

      <div class="grid-item col-span-4 info-card">
        <UITopSpendingsBox
          :loading="isLoading"
          :spendings="topSpendings"
          :title="dashboardTexts[selectedLanguage].topSpendings"
          :selectedLanguage="selectedLanguage"
        />
      </div>

      <div class="grid-item col-span-4 info-card goals-card">
        <div v-if="isLoading" class="card-header">
          <div class="skeleton-box title-skeleton"></div>
        </div>
        <div v-else class="card-header">{{ dashboardTexts[selectedLanguage].savingsGoal }}</div>
        <UIGoalsOverviewCard
          :loading="isLoading"
          :selectedLanguage="selectedLanguage"
          :currentAmount="goalsOverview?.currentAmount || 0"
          :limitAmount="goalsOverview?.limitAmount || 0"
          :totalGoals="goalsOverview?.totalGoals || 0"
          :achievedGoals="goalsOverview?.achievedGoals || 0"
        />
        <div v-if="!isLoading && !goalsOverview" class="empty-state">
          <font-awesome-icon :icon="emptySavingsIcon" class="empty-icon" />
          <p>{{ dashboardTexts[selectedLanguage].noGoals }}</p>
        </div>
      </div>

      <!-- 4. LAYER (DETAIL): Full Width İşlem Geçmişi -->
      <div class="grid-item col-span-12 info-card recent-tx-card">
        <UIRecentTransactionsCard
          :loading="isLoading"
          :transactions="recentTransactions"
          :title="dashboardTexts[selectedLanguage].recentTransactions"
          :emptyText="dashboardTexts[selectedLanguage].noRecentTransactions"
          :selectedLanguage="selectedLanguage"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import UIInformationBox from '../components/UIInformationBox.vue'
import UIDonutChart from '../components/UIDonutChart.vue'
import UIIncomeExpenseLineChart from '../components/UIIncomeExpenseLineChart.vue'
import UITopSpendingsBox from '../components/UITopSpendingsBox.vue'
import UIRecentTransactionsCard from '../components/UIRecentTransactionsCard.vue'
import UIBudgetAlertsCard from '../components/UIBudgetAlertsCard.vue'
import UIGoalsOverviewCard from '../components/UIGoalsOverviewCard.vue'
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
import { useCurrency } from '@/composables/useCurrency'

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
    UIGoalsOverviewCard,
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
      currencyHelper: useCurrency(),
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
      return (
        (this.lists && this.lists.recentTransactions) ||
        this.dashboardSummary?.recentTransactions ||
        []
      )
    },
    budgetAlerts() {
      return (this.lists && this.lists.budgetAlerts) || this.dashboardSummary?.budgetAlerts || []
    },
  },
  watch: {
    'currencyHelper.currency'() {
      this.fetchFinancialData()
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
      sorted.forEach(k => {
        out[k] = byMonth[k]
      })
      return out
    },
    async fetchFinancialData() {
      this.isLoading = true
      this.hasError = false

      try {
        const data = await summaryService.getDashboardSummary({ currency: this.currencyHelper.currency.value })

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

        const sourceTopCategories =
          (this.lists.topSpendingCategories && this.lists.topSpendingCategories.length > 0
            ? this.lists.topSpendingCategories
            : data.topSpendingCategories) || []
        const categories: Record<string, number> = {}
        sourceTopCategories.forEach(item => {
          if (item.categoryName) {
            categories[item.categoryName] = item.totalAmount
          }
        })
        this.categorySpending = categories

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
}
</script>

<style scoped lang="scss">
/* ANA KONTEYNER */
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  height: min-content;
  padding-bottom: 2rem;
}

/* 1. LAYER: KPI GRID */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  width: 100%;
}

/* ANA 12-COLUMN GRID SİSTEMİ */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  width: 100%;
  align-items: stretch;
}

/* GRID SPAN YARDIMCILARI */
.col-span-12 {
  grid-column: span 12;
}
.col-span-8 {
  grid-column: span 8;
}
.col-span-4 {
  grid-column: span 4;
}

/* KARTLARIN GENEL STİLİ */
.grid-item {
  background: var(--background-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  min-height: 380px;
}

/* MAIN CHART ÖZEL STİLİ */
.main-chart-card {
  min-height: 480px;
  .card-inner {
    padding: 1.25rem;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;

    > * {
      flex: 1;
      height: 100%;
    }
  }
}

/* SAĞ ASİSTAN SÜTUNU (Alerts & Recs) */
.assistant-sidebar {
  background: transparent;
  box-shadow: none;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  .info-card {
    flex: 1;
    min-height: 0;
  }
}

/* BİLGİ KARTLARI STANDART */
.info-card {
  background: var(--background-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* KART BAŞLIKLARI */
.card-header {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--header-text-color);
  padding: 1.25rem 1.25rem 0 1.25rem;
  margin-bottom: 0.5rem;

  .title-skeleton {
    width: 150px;
    height: 1.1rem;
    margin-bottom: 0;
  }
}

/* SKELETON ANIMATION */

.rec-title-skeleton {
  width: 60%;
  height: 1rem;
  margin-bottom: 0.5rem;
}

.rec-desc-skeleton {
  width: 100%;
  height: 2.5rem;
}

/* ERROR STATE */
.error-container {
  padding: 1rem;
  background: var(--notification-alert-color-soft);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;

  .error-message {
    color: var(--notification-alert-color-header);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .retry-btn {
    background: var(--notification-alert-color);
    color: white;
    border: none;
    padding: 0.4rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 700;
    &:hover {
      opacity: 0.9;
    }
  }
}

/* EMPTY STATE TASARIMI */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem;
  text-align: center;
  color: var(--normal-text-color);

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--border-color);
  }
  p {
    font-size: 0.9rem;
    font-weight: 500;
  }
}

/* TAVSİYELER LİSTESİ (Recommendations) */
.recommendations-card {
  .rec-list {
    list-style: none;
    padding: 0 1.25rem 1.25rem 1.25rem;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
  }

  .rec-item {
    padding: 0.85rem;
    border-radius: var(--border-radius);
    background: var(--background-color-soft);
    border-left: 4px solid var(--border-color);
    transition: transform 0.2s ease;

    &:hover {
      transform: translateX(4px);
    }

    &--high {
      border-left-color: var(--notification-alert-color);
      background: var(--notification-alert-color-soft);
      .badge {
        color: var(--notification-alert-color-header);
        background: rgba(220, 53, 69, 0.1);
      }
      .rec-title span {
        color: var(--notification-alert-color-header);
      }
      .rec-desc {
        color: var(--notification-alert-color-text);
      }
    }
    &--medium {
      border-left-color: var(--notification-warning-color);
      background: var(--notification-warning-color-soft);
      .badge {
        color: var(--notification-warning-color-header);
        background: rgba(243, 156, 18, 0.1);
      }
      .rec-title span {
        color: var(--notification-warning-color-header);
      }
      .rec-desc {
        color: var(--notification-warning-color-text);
      }
    }
    &--low {
      border-left-color: var(--notification-info-color);
      background: var(--notification-info-color-soft);
      .badge {
        color: var(--notification-info-color-header);
        background: rgba(13, 202, 240, 0.1);
      }
      .rec-title span {
        color: var(--notification-info-color-header);
      }
      .rec-desc {
        color: var(--notification-info-color-text);
      }
    }

    .rec-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      font-size: 0.9rem;
      margin-bottom: 0.4rem;

      .badge {
        font-size: 0.65rem;
        padding: 0.2rem 0.5rem;
        border-radius: 999px;
        text-transform: uppercase;
        font-weight: 800;
      }
    }
    .rec-desc {
      font-size: 0.8rem;
      line-height: 1.4;
    }
  }
}

.goals-card {
  padding-bottom: 1.25rem;
}

/* RESPONSIVE KIRILMALAR */
@media (max-width: 1200px) {
  .col-span-8 {
    grid-column: span 12;
  }
  .assistant-sidebar {
    grid-column: span 12;
    flex-direction: row;
    min-height: 300px;
  }
  .col-span-4 {
    grid-column: span 6;
  }
}

@media (max-width: 768px) {
  .col-span-4,
  .col-span-6,
  .col-span-8,
  .col-span-12 {
    grid-column: span 12;
  }
  .assistant-sidebar {
    flex-direction: column;
    min-height: auto;
  }
  .grid-item {
    min-height: 320px;
  }
  .main-chart-card {
    min-height: 350px;
  }
}
</style>

<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <div class="header-left">
        <!-- Optional extra info could go here -->
      </div>
      <div class="header-right">
        <!-- Export button moved to layout -->
      </div>
    </div>

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

    <!-- ANA 12-COLUMN DASHBOARD GRID -->
    <div class="dashboard-grid">
      <!-- ROW 1: FULL WIDTH CHART -->
      <div class="grid-item col-span-12 main-chart-card">
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

      <!-- ROW 2: 50/50 ALERTS AND RECS -->
      <div class="grid-item col-span-6 info-card">
        <UIBudgetAlertsCard
          :loading="isLoading"
          :alerts="budgetAlerts"
          :title="dashboardTexts[selectedLanguage].budgetAlerts"
          :emptyText="dashboardTexts[selectedLanguage].noBudgetAlerts"
          :statusExceededText="dashboardTexts[selectedLanguage].statusExceeded"
          :statusWarningText="dashboardTexts[selectedLanguage].statusWarning"
          :carousel="true"
        />
      </div>

      <div class="grid-item col-span-6 info-card recommendations-card">
        <div v-if="isLoading" class="card-header">
          <div class="skeleton-box title-skeleton"></div>
        </div>
        <div v-else class="card-header carousel-header">
          <div class="header-left">
            <span class="title-text">{{ dashboardTexts[selectedLanguage].recommendations }}</span>
            <span v-if="recommendations.length > 1" class="page-indicator">
              {{ currentRecIndex + 1 }} / {{ recommendations.length }}
            </span>
          </div>
          <div v-if="recommendations.length > 1" class="header-actions">
            <button
              class="nav-btn prev"
              @click="scrollRecs('prev')"
              :disabled="currentRecIndex === 0"
            >
              <font-awesome-icon icon="chevron-left" />
            </button>
            <button
              class="nav-btn next"
              @click="scrollRecs('next')"
              :disabled="currentRecIndex === recommendations.length - 1"
            >
              <font-awesome-icon icon="chevron-right" />
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="rec-list carousel-mode">
          <div v-for="i in 3" :key="i" class="rec-item skeleton-item">
            <div class="rec-top">
              <div class="skeleton-box rec-icon-skeleton"></div>
              <div class="skeleton-box rec-badge-skeleton"></div>
            </div>
            <div class="rec-content">
              <div class="skeleton-box rec-title-skeleton"></div>
              <div class="skeleton-box rec-desc-skeleton"></div>
              <div class="skeleton-box rec-desc-skeleton-short"></div>
            </div>
          </div>
        </div>

        <div v-else-if="!recommendations || recommendations.length === 0" class="empty-state">
          <font-awesome-icon :icon="emptyRecommendationsIcon" class="empty-icon" />
          <p>{{ dashboardTexts[selectedLanguage].noRecommendations }}</p>
        </div>
        <ul v-else class="rec-list carousel-mode" ref="recListRef" @scroll="handleRecScroll">
          <li
            v-for="rec in recommendations"
            :key="rec.id"
            :class="[
              'rec-item',
              'rec-item--' + (rec.severity ? rec.severity.toLowerCase() : 'low'),
            ]"
          >
            <div class="rec-card-glow"></div>
            <div class="rec-top">
              <div class="rec-icon-box">
                <font-awesome-icon :icon="getRecIcon(rec.severity)" />
              </div>
              <span v-if="rec.severity" class="severity-pill">{{ rec.severity }}</span>
            </div>
            <div class="rec-content">
              <div class="rec-title">{{ rec.title }}</div>
              <div class="rec-desc">{{ rec.description }}</div>
            </div>
          </li>
        </ul>
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
      currentRecIndex: 0,
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
        const data = await summaryService.getDashboardSummary({
          currency: this.currencyHelper.currency,
        })

        this.dashboardSummary = data
        this.summaryHeader = data.summary ?? {
          totalBalance: data.totalBalance,
          totalIncome: data.totalIncome,
          totalExpenses: data.totalExpenses,
          unreadNotificationsCount: data.unreadNotificationsCount,
        }
        window.dispatchEvent(
          new CustomEvent('unread-notifications-updated', {
            detail: this.summaryHeader.unreadNotificationsCount,
          })
        )
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
    getRecIcon(severity: string | undefined) {
      const s = severity?.toLowerCase()
      if (s === 'high') return 'circle-exclamation'
      if (s === 'medium') return 'triangle-exclamation'
      return 'lightbulb'
    },
    scrollRecs(direction: 'next' | 'prev') {
      const list = this.$refs.recListRef as HTMLElement
      if (!list) return
      const clientWidth = list.clientWidth
      const gap = 16
      const scrollAmount = direction === 'next' ? clientWidth + gap : -(clientWidth + gap)
      list.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    },
    handleRecScroll(e: Event) {
      const list = e.target as HTMLElement
      const clientWidth = list.clientWidth
      const gap = 16
      if (clientWidth > 0) {
        this.currentRecIndex = Math.round(list.scrollLeft / (clientWidth + gap))
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
  gap: 1rem;
  width: 100%;
  height: min-content;
  padding-bottom: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-right {
    display: flex;
    align-items: center;
  }
}

/* 1. LAYER: KPI GRID */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
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
.col-span-6 {
  grid-column: span 6;
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
  height: 550px;
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
  font-size: 1rem;
  font-weight: 700;
  color: var(--header-text-color);
  padding: 1.25rem 1.25rem 0 1.25rem;
  margin-bottom: 0.5rem;

  .title-skeleton {
    width: 150px;
    height: 1.1rem;
    margin-bottom: 0;
  }

  &.carousel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-indicator {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--normal-text-color);
      background: var(--background-color-soft);
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      opacity: 0.7;
    }

    .header-actions {
      display: flex;
      gap: 0.4rem;

      .nav-btn {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 1px solid var(--border-color);
        background: var(--background-color);
        color: var(--normal-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        font-size: 0.7rem;

        &:hover:not(:disabled) {
          background: var(--background-color-soft);
          border-color: var(--header-text-color);
          color: var(--header-text-color);
        }

        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }
    }
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
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
    height: 100%;
    padding-bottom: 1.25rem;

    &.carousel-mode {
      padding: 0 0 1.25rem 0;
      flex-direction: row;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      gap: 0;
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .rec-item {
      padding: 1.5rem;
      border-radius: 1.5rem;
      background: var(--background-color);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      flex: 0 0 100%;
      scroll-snap-align: start;
      height: 100%;
      position: relative;
      overflow: hidden;
      border-top: 1px solid var(--border-color);

      /* Edge-to-edge box but inset content/background */
      border-left: 1.25rem solid transparent;
      border-right: 1.25rem solid transparent;
      background-clip: padding-box;

      .rec-card-glow {
        position: absolute;
        top: -50px;
        right: -50px;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        filter: blur(40px);
        opacity: 0.1;
        z-index: 0;
        pointer-events: none;
      }

      .rec-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 1;

        .rec-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          background: var(--background-color-soft);
          color: var(--primary-blue-color);
        }

        .severity-pill {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.3rem 0.8rem;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      }

      .rec-content {
        flex: 1;
        z-index: 1;
        .rec-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--header-text-color);
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }
        .rec-desc {
          font-size: 0.95rem;
          color: var(--normal-text-color);
          opacity: 0.8;
          line-height: 1.5;
        }
      }

      .rec-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 1rem;
        margin-top: auto;
        z-index: 1;

        .action-text {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary-blue-color);
        }

        .action-icon {
          font-size: 0.8rem;
          color: var(--primary-blue-color);
          transition: transform 0.2s ease;
        }
      }

      /* Severity Variants */
      &--critical,
      &--high {
        .rec-card-glow {
          background: var(--notification-alert-color);
          opacity: 0.12;
        }
        .rec-icon-box {
          background: var(--notification-alert-color-soft);
          color: var(--notification-alert-color);
        }
        .severity-pill {
          background: var(--notification-alert-color-soft);
          color: var(--notification-alert-color);
        }
      }

      &--medium {
        .rec-card-glow {
          background: var(--notification-warning-color);
          opacity: 0.12;
        }
        .rec-icon-box {
          background: var(--notification-warning-color-soft);
          color: var(--notification-warning-color);
        }
        .severity-pill {
          background: var(--notification-warning-color-soft);
          color: var(--notification-warning-color);
        }
      }

      &--low {
        .rec-card-glow {
          background: var(--notification-info-color);
          opacity: 0.12;
        }
        .rec-icon-box {
          background: var(--notification-info-color-soft);
          color: var(--notification-info-color);
        }
        .severity-pill {
          background: var(--notification-info-color-soft);
          color: var(--notification-info-color);
        }
      }

      /* Skeleton Overrides */
      &.skeleton-item {
        pointer-events: none;
        background: var(--background-color);

        .rec-icon-skeleton {
          width: 48px;
          height: 48px;
          border-radius: 14px;
        }
        .rec-badge-skeleton {
          width: 60px;
          height: 1.25rem;
          border-radius: 999px;
        }
        .rec-title-skeleton {
          width: 70%;
          height: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .rec-desc-skeleton {
          width: 100%;
          height: 0.9rem;
          margin-bottom: 0.4rem;
        }
        .rec-desc-skeleton-short {
          width: 60%;
          height: 0.9rem;
        }
        .rec-action-skeleton {
          width: 100px;
          height: 1rem;
        }
      }
    }
  }
}

.goals-card {
  padding-bottom: 1.25rem;
}

/* RESPONSIVE KIRILMALAR */
@media (max-width: 1200px) {
  .col-span-12,
  .col-span-8,
  .col-span-6,
  .col-span-4 {
    grid-column: span 12;
  }
}

@media (max-width: 1000px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-item {
    min-height: 320px;
  }
  .main-chart-card {
    height: 450px;
  }
  .kpi-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>

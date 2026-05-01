<template>
  <!-- Layout mirrors DashboardView: soft page chrome + white KPI/cards (see dashboard-page / kpi-grid / grid-item) -->
  <div class="dashboard-page admin-analytics">
    <div v-if="isLoading" class="admin-analytics__skeleton">
      <UISkeletonLoader v-for="i in 6" :key="i" height="92px" border-radius="12px" />
    </div>

    <div v-else-if="loadError" class="analytics-dash-panel analytics-dash-panel--error">
      <div class="card-inner">
        <p>{{ t.loadError }}</p>
        <button type="button" class="admin-analytics__retry" @click="fetchAll">
          {{ t.retry }}
        </button>
      </div>
    </div>

    <template v-else-if="revenue && growth">
      <section class="analytics-section">
        <h2 class="analytics-section-title">{{ t.revenueSection }}</h2>
        <div class="kpi-grid">
          <div class="analytics-dash-card">
            <div class="stat-label">{{ t.mrr }}</div>
            <div class="stat-value">
              {{ formatMoney(revenue.monthlyRecurringRevenue, revenue.mrrCurrency) }}
            </div>
          </div>
          <div class="analytics-dash-card">
            <div class="stat-label">{{ t.payingSubscribers }}</div>
            <div class="stat-value">{{ formatInt(revenue.payingSubscribers) }}</div>
          </div>
          <div class="analytics-dash-card">
            <div class="stat-label">{{ t.arpu }}</div>
            <div class="stat-value">
              {{ formatMoney(revenue.averageRevenuePerUser, revenue.mrrCurrency) }}
            </div>
          </div>
        </div>
      </section>

      <section class="analytics-section analytics-section--gap">
        <h2 class="analytics-section-title">{{ t.growthSection }}</h2>
        <div class="kpi-grid">
          <div class="analytics-dash-card">
            <div class="stat-label">{{ t.dauYesterday }}</div>
            <div class="stat-value">{{ formatInt(growth.dauYesterday) }}</div>
          </div>
          <div class="analytics-dash-card">
            <div class="stat-label">{{ t.mau30 }}</div>
            <div class="stat-value">{{ formatInt(growth.mauLast30Days) }}</div>
          </div>
          <div class="analytics-dash-card">
            <div class="stat-label">{{ t.churn30 }}</div>
            <div class="stat-value">{{ formatChurn(growth.churnRatioLast30Days) }}</div>
          </div>
        </div>

        <div class="analytics-stack">
          <div class="analytics-dash-panel">
            <div class="card-inner">
              <h3 class="card-inner-title">{{ t.featureTotals }}</h3>
              <div class="feature-totals">
                <div class="feature-totals__item">
                  <span class="feature-totals__label">OCR</span>
                  <span class="feature-totals__val">{{
                    formatInt(growth.featureTotalsLast30Days.totalOcr)
                  }}</span>
                </div>
                <div class="feature-totals__item">
                  <span class="feature-totals__label">STT</span>
                  <span class="feature-totals__val">{{
                    formatInt(growth.featureTotalsLast30Days.totalStt)
                  }}</span>
                </div>
                <div class="feature-totals__item">
                  <span class="feature-totals__label">{{ t.copilot }}</span>
                  <span class="feature-totals__val">{{
                    formatInt(growth.featureTotalsLast30Days.totalCopilot)
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="analytics-dash-panel analytics-dash-panel--chart">
            <div class="card-inner card-inner--chart">
              <h3 class="card-inner-title">{{ t.dailyActive }}</h3>
              <div v-if="sortedDailySeries.length === 0" class="admin-analytics__chart-empty">
                {{ t.noDailyRows }}
              </div>
              <div v-else class="admin-analytics__chart-shell">
                <LineChart
                  :key="themeKey"
                  :data="dailyActiveChartData"
                  :options="dailyActiveChartOptions"
                  class="admin-analytics__chart"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, onBeforeUnmount, ref } from 'vue'
import type { PropType } from 'vue'
import { Line as LineChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js'
import { adminService } from '@/services/api/admin/admin.service'
import type { RevenueAnalytics, GrowthAnalytics } from '@/services/api/admin/admin.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

ChartJS.register(Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '').trim()
  if (h.length !== 6) return `rgba(34, 197, 94, ${alpha})`
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default defineComponent({
  name: 'AdminAnalyticsView',
  components: { UISkeletonLoader, LineChart },
  props: {
    selectedLanguage: {
      type: String as PropType<'English' | 'Turkish'>,
      default: 'English',
    },
  },
  setup(props) {
    const isLoading = ref(true)
    const loadError = ref(false)
    const revenue = ref<RevenueAnalytics | null>(null)
    const growth = ref<GrowthAnalytics | null>(null)
    const themeKey = ref(
      typeof document !== 'undefined'
        ? document.documentElement.getAttribute('data-theme') || 'light'
        : 'light'
    )
    let themeObserver: MutationObserver | null = null

    const locale = computed(() => (props.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US'))

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        revenueSection: isTr ? 'Gelir' : 'Revenue',
        growthSection: isTr ? 'Büyüme ve etkinlik' : 'Growth & activity',
        mrr: isTr ? 'Aylık tekrarlayan gelir (MRR)' : 'Monthly recurring revenue (MRR)',
        payingSubscribers: isTr ? 'Ödeme yapan aboneler' : 'Paying subscribers',
        arpu: isTr ? 'Kullanıcı başı ort. gelir (ARPU)' : 'Average revenue per user (ARPU)',
        dauYesterday: isTr ? 'DAU (dün)' : 'DAU (yesterday)',
        mau30: isTr ? 'MAU (son 30 gün)' : 'MAU (last 30 days)',
        churn30: isTr ? 'Kayıp oranı (son 30 gün)' : 'Churn (last 30 days)',
        featureTotals: isTr ? 'Özellik kullanımı (son 30 gün)' : 'Feature usage (last 30 days)',
        copilot: 'Copilot',
        dailyActive: isTr ? 'Günlük aktif kullanıcılar' : 'Daily active users',

        chartDatasetLabel: isTr ? 'Aktif kullanıcı' : 'Active users',
        noDailyRows: isTr ? 'Seri verisi yok.' : 'No series data.',
        loadError: isTr ? 'Analitik verisi yüklenemedi.' : 'Could not load analytics.',
        retry: isTr ? 'Yeniden dene' : 'Retry',
      }
    })

    const sortedDailySeries = computed(() => {
      const s = growth.value?.dailyActiveSeries
      if (!s?.length) return []
      return [...s].sort((a, b) => a.date.localeCompare(b.date))
    })

    const formatInt = (n: number) =>
      new Intl.NumberFormat(locale.value, { maximumFractionDigits: 0 }).format(n ?? 0)

    const formatMoney = (amount: number, currency: string) => {
      const cur = currency || 'USD'
      try {
        return new Intl.NumberFormat(locale.value, {
          style: 'currency',
          currency: cur,
          maximumFractionDigits: 2,
        }).format(amount ?? 0)
      } catch {
        return `${amount ?? 0} ${cur}`
      }
    }

    const formatChurn = (ratio: number) => {
      if (ratio == null || Number.isNaN(ratio)) return '—'
      const pct = ratio <= 1 ? ratio * 100 : ratio
      return `${new Intl.NumberFormat(locale.value, { maximumFractionDigits: 2 }).format(pct)}%`
    }

    const formatChartDay = (iso: string) => {
      try {
        return new Date(iso).toLocaleDateString(locale.value, {
          month: 'short',
          day: 'numeric',
        })
      } catch {
        return iso
      }
    }

    const dailyActiveChartData = computed(() => {
      void themeKey.value
      const series = sortedDailySeries.value
      const root = document.documentElement
      const styles = getComputedStyle(root)
      const green = styles.getPropertyValue('--primary-green-color').trim() || '#22c55e'
      const label = t.value.chartDatasetLabel
      return {
        labels: series.map(r => formatChartDay(r.date)),
        datasets: [
          {
            label,
            data: series.map(r => r.activeUsers),
            borderColor: green,
            backgroundColor: hexToRgba(green, 0.14),
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
          },
        ],
      }
    })

    const dailyActiveChartOptions = computed(() => {
      void themeKey.value
      const root = document.documentElement
      const styles = getComputedStyle(root)
      const border = styles.getPropertyValue('--border-color').trim()
      const muted = styles.getPropertyValue('--normal-text-color').trim()
      const header = styles.getPropertyValue('--header-text-color').trim()
      const soft = styles.getPropertyValue('--background-color-soft').trim()
      return {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio:
          typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1,
        interaction: { intersect: false, mode: 'index' as const },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: undefined,
            grace: '10%',
            grid: { color: border },
            ticks: {
              color: muted,
              precision: 0,
              callback: (v: string | number) => formatInt(Number(v)),
            },
          },
          x: {
            grid: { display: false },
            ticks: {
              color: muted,
              maxRotation: 45,
              minRotation: 0,
              autoSkip: true,
              maxTicksLimit: 14,
              font: { size: 12 },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: soft,
            titleColor: header,
            bodyColor: muted,
            borderColor: border,
            borderWidth: 1,
            callbacks: {
              label: (ctx: { parsed: { y: number }; dataset: { label?: string } }) => {
                const name = ctx.dataset.label || t.value.chartDatasetLabel
                return ` ${name}: ${formatInt(ctx.parsed.y)}`
              },
            },
          },
        },
      }
    })

    const fetchAll = async () => {
      isLoading.value = true
      loadError.value = false
      try {
        const [rev, gro] = await Promise.all([
          adminService.getRevenueAnalytics(),
          adminService.getGrowthAnalytics(),
        ])
        revenue.value = rev
        growth.value = gro
      } catch (e) {
        console.error(e)
        loadError.value = true
        revenue.value = null
        growth.value = null
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      fetchAll()
      themeObserver = new MutationObserver(() => {
        themeKey.value = document.documentElement.getAttribute('data-theme') || 'light'
      })
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      })
    })

    onBeforeUnmount(() => {
      themeObserver?.disconnect()
      themeObserver = null
    })

    return {
      isLoading,
      loadError,
      revenue,
      growth,
      themeKey,
      t,
      sortedDailySeries,
      dailyActiveChartData,
      dailyActiveChartOptions,
      formatInt,
      formatMoney,
      formatChurn,
      fetchAll,
    }
  },
})
</script>

<style scoped lang="scss">
/* —— Match DashboardView: `dashboard-page` + `kpi-grid` + white cards —— */
.dashboard-page.admin-analytics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: min-content;
  padding-bottom: 2rem;
  min-height: 0;
}

.analytics-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &--gap {
    margin-top: 0.5rem;
  }
}

.analytics-section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--header-text-color);
}

/* Dashboard KPI row */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.analytics-dash-card {
  background: var(--background-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-height: 0;

  .stat-label {
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.35;
    color: var(--header-text-color);
    opacity: 0.88;
  }

  .stat-value {
    font-size: clamp(1.25rem, 2.6vw, 1.55rem);
    font-weight: 800;
    color: var(--primary-green-color);
    word-break: break-word;
    letter-spacing: -0.02em;
  }
}

.analytics-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

/* Full-width panels (same spirit as DashboardView `.grid-item` / `.info-card`) */
.analytics-dash-panel {
  background: var(--background-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;

  &--error .card-inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;

    p {
      margin: 0;
      color: var(--header-text-color);
    }
  }

  &--chart {
    min-height: 400px;
  }
}

.card-inner {
  padding: 1.25rem;
  width: 100%;
  box-sizing: border-box;

  &--chart {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    height: 100%;
  }
}

.card-inner-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--header-text-color);
}

.analytics-card-lead {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.45;
  color: var(--normal-text-color);
  max-width: 52ch;
}

.admin-analytics__skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-analytics__retry {
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  background: var(--primary-green-color);
  color: #fff;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    filter: brightness(1.05);
  }
}

.feature-totals {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.feature-totals__item {
  padding: 1rem 1.1rem;
  border-radius: var(--border-radius);
  background: var(--background-color-soft);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.feature-totals__label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--header-text-color);
  opacity: 0.88;
}

.feature-totals__val {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--primary-green-color);
  letter-spacing: -0.02em;
}

.admin-analytics__chart-shell {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 280px;
  height: min(38vh, 400px);
}

.admin-analytics__chart {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.admin-analytics__chart-empty {
  flex: 1;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  color: var(--normal-text-color);
  border-radius: var(--border-radius);
  background: var(--background-color-soft);
  border: 1px dashed var(--border-color);
}
</style>

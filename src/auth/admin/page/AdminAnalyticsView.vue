<template>
  <div class="dashboard-page admin-analytics">
    <div v-if="isLoading" class="analytics-layout-stack admin-analytics__skeleton-wrap">
      <!-- ROW 1 SKELETON: Revenue Cards -->
      <section class="analytics-section">
        <div class="section-header">
          <h2 class="analytics-section-title">
            <font-awesome-icon icon="money-bill-wave" />
            {{ t.revenueSectionTitle }}
          </h2>
        </div>
        <div class="analytics-grid analytics-grid--4">
          <div v-for="i in 4" :key="'skel-r1-' + i" class="glass-card analytics-dash-card skeleton-card-detailed">
            <div class="skeleton-card-content">
              <UISkeletonLoader :width="'60%'" :height="'12px'" :borderRadius="'4px'" class="mb-2" />
              <UISkeletonLoader :width="'40%'" :height="'24px'" :borderRadius="'6px'" />
            </div>
          </div>
        </div>
      </section>

      <!-- ROW 2 SKELETON: Growth Cards -->
      <section class="analytics-section">
        <div class="section-header">
          <h2 class="analytics-section-title">
            <font-awesome-icon icon="chart-line" />
            {{ t.growthSectionTitle }}
          </h2>
        </div>
        <div class="analytics-grid analytics-grid--3">
          <div v-for="i in 3" :key="'skel-r2-' + i" class="glass-card analytics-dash-card skeleton-card-detailed">
            <div class="skeleton-card-content">
              <UISkeletonLoader :width="'55%'" :height="'12px'" :borderRadius="'4px'" class="mb-2" />
              <UISkeletonLoader :width="'35%'" :height="'24px'" :borderRadius="'6px'" />
            </div>
          </div>
        </div>
      </section>

      <!-- ROW 3 SKELETON: Feature Cards -->
      <section class="analytics-section">
        <div class="section-header">
          <h2 class="analytics-section-title">
            <font-awesome-icon icon="puzzle-piece" />
            {{ t.featureSectionTitle }}
          </h2>
        </div>
        <div class="analytics-grid analytics-grid--3">
          <div v-for="i in 3" :key="'skel-r3-' + i" class="glass-card analytics-dash-card skeleton-card-detailed">
            <div class="skeleton-card-content">
              <UISkeletonLoader :width="'50%'" :height="'12px'" :borderRadius="'4px'" class="mb-2" />
              <UISkeletonLoader :width="'30%'" :height="'24px'" :borderRadius="'6px'" />
            </div>
          </div>
        </div>
      </section>

      <!-- ROW 4 SKELETON: Main Chart -->
      <section class="analytics-section">
        <div class="glass-card analytics-dash-panel--chart p-6">
          <div class="chart-header mb-6">
            <h3 class="card-inner-title">{{ t.dailyActive }}</h3>
            <UISkeletonLoader :width="'100px'" :height="'24px'" :borderRadius="'20px'" />
          </div>
          <UISkeletonLoader :height="'500px'" :borderRadius="'12px'" />
        </div>
      </section>
    </div>

    <div v-else-if="loadError" class="analytics-dash-panel analytics-dash-panel--error">
      <div class="card-inner">
        <font-awesome-icon icon="circle-exclamation" class="error-icon" />
        <p>{{ t.loadError }}</p>
        <button type="button" class="admin-analytics__retry" @click="fetchAll">
          <font-awesome-icon icon="rotate-right" />
          {{ t.retry }}
        </button>
      </div>
    </div>

    <template v-else>
      <div class="analytics-layout-stack">
        <!-- ROW 1: REVENUE PERFORMANCE -->
        <section class="analytics-section">
          <div class="section-header">
            <h2 class="analytics-section-title">
              <font-awesome-icon icon="money-bill-wave" />
              {{ t.revenueSectionTitle }}
            </h2>
          </div>
          <div class="analytics-grid analytics-grid--4">
            <!-- MRR -->
            <div class="analytics-dash-card glass-card">
              <div class="stat-content">
                <div class="stat-label-row">
                  <span class="stat-label">{{ t.mrr }}</span>
                  <div class="stat-tooltip-wrap">
                    <font-awesome-icon
                      icon="circle-info"
                      class="stat-tooltip-icon"
                      @mouseenter="(e: MouseEvent) => showTooltip(e, t.mrrTooltip)"
                      @mouseleave="hideTooltip"
                    />
                  </div>
                </div>
                <div class="stat-value">{{ formatInt(revenue?.monthlyRecurringRevenue || 0) }}</div>
              </div>
            </div>
            <!-- CURRENCY -->
            <div class="analytics-dash-card glass-card">
              <div class="stat-content">
                <div class="stat-label-row">
                  <span class="stat-label">Currency</span>
                  <div class="stat-tooltip-wrap">
                    <font-awesome-icon
                      icon="circle-info"
                      class="stat-tooltip-icon"
                      @mouseenter="(e: MouseEvent) => showTooltip(e, t.currencyTooltip)"
                      @mouseleave="hideTooltip"
                    />
                  </div>
                </div>
                <div class="stat-value">{{ revenue?.mrrCurrency }}</div>
              </div>
            </div>
            <!-- SUBSCRIBERS -->
            <div class="analytics-dash-card glass-card">
              <div class="stat-content">
                <div class="stat-label-row">
                  <span class="stat-label">{{ t.payingSubscribers }}</span>
                  <div class="stat-tooltip-wrap">
                    <font-awesome-icon
                      icon="circle-info"
                      class="stat-tooltip-icon"
                      @mouseenter="(e: MouseEvent) => showTooltip(e, t.subscribersTooltip)"
                      @mouseleave="hideTooltip"
                    />
                  </div>
                </div>
                <div class="stat-value">{{ formatInt(revenue?.payingSubscribers || 0) }}</div>
              </div>
            </div>
            <!-- ARPU -->
            <div class="analytics-dash-card glass-card">
              <div class="stat-content">
                <div class="stat-label-row">
                  <span class="stat-label">{{ t.arpu }}</span>
                  <div class="stat-tooltip-wrap">
                    <font-awesome-icon
                      icon="circle-info"
                      class="stat-tooltip-icon"
                      @mouseenter="(e: MouseEvent) => showTooltip(e, t.arpuTooltip)"
                      @mouseleave="hideTooltip"
                    />
                  </div>
                </div>
                <div class="stat-value">{{ formatMoney(revenue?.averageRevenuePerUser || 0, revenue?.mrrCurrency || 'USD') }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ROW 2: GROWTH & RETENTION -->
        <section class="analytics-section">
          <div class="section-header">
            <h2 class="analytics-section-title">
              <font-awesome-icon icon="chart-line" />
              {{ t.growthSectionTitle }}
            </h2>
          </div>
          <div class="analytics-grid analytics-grid--3">
            <!-- DAU -->
            <div class="analytics-dash-card glass-card">
              <div class="stat-content">
                <div class="stat-label-row">
                  <span class="stat-label">DAU</span>
                  <div class="stat-tooltip-wrap">
                    <font-awesome-icon
                      icon="circle-info"
                      class="stat-tooltip-icon"
                      @mouseenter="(e: MouseEvent) => showTooltip(e, t.dauTooltip)"
                      @mouseleave="hideTooltip"
                    />
                  </div>
                </div>
                <div class="stat-value">{{ formatInt(growth?.dauYesterday || 0) }}</div>
              </div>
            </div>
            <!-- MAU -->
            <div class="analytics-dash-card glass-card">
              <div class="stat-content">
                <div class="stat-label-row">
                  <span class="stat-label">MAU</span>
                  <div class="stat-tooltip-wrap">
                    <font-awesome-icon
                      icon="circle-info"
                      class="stat-tooltip-icon"
                      @mouseenter="(e: MouseEvent) => showTooltip(e, t.mauTooltip)"
                      @mouseleave="hideTooltip"
                    />
                  </div>
                </div>
                <div class="stat-value">{{ formatInt(growth?.mauLast30Days || 0) }}</div>
              </div>
            </div>
            <!-- CHURN -->
            <div class="analytics-dash-card glass-card">
              <div class="stat-content">
                <div class="stat-label-row">
                  <span class="stat-label">{{ t.churn30 }}</span>
                  <div class="stat-tooltip-wrap">
                    <font-awesome-icon
                      icon="circle-info"
                      class="stat-tooltip-icon"
                      @mouseenter="(e: MouseEvent) => showTooltip(e, t.churnTooltip)"
                      @mouseleave="hideTooltip"
                    />
                  </div>
                </div>
                <div class="stat-value">{{ formatChurn(growth?.churnRatioLast30Days || 0) }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ROW 3: FEATURE UTILIZATION -->
        <section class="analytics-section">
          <div class="section-header">
            <h2 class="analytics-section-title">
              <font-awesome-icon icon="puzzle-piece" />
              {{ t.featureSectionTitle }}
            </h2>
          </div>
          <div class="analytics-grid analytics-grid--3">
            <!-- OCR -->
            <div class="analytics-dash-card glass-card">
              <div class="stat-content">
                <div class="stat-label-row">
                  <span class="stat-label">OCR</span>
                  <div class="stat-tooltip-wrap">
                    <font-awesome-icon
                      icon="circle-info"
                      class="stat-tooltip-icon"
                      @mouseenter="(e: MouseEvent) => showTooltip(e, t.ocrTooltip)"
                      @mouseleave="hideTooltip"
                    />
                  </div>
                </div>
                <div class="stat-value">{{ formatInt(growth?.featureTotalsLast30Days.totalOcr || 0) }}</div>
              </div>
            </div>
            <!-- STT -->
            <div class="analytics-dash-card glass-card">
              <div class="stat-content">
                <div class="stat-label-row">
                  <span class="stat-label">STT</span>
                  <div class="stat-tooltip-wrap">
                    <font-awesome-icon
                      icon="circle-info"
                      class="stat-tooltip-icon"
                      @mouseenter="(e: MouseEvent) => showTooltip(e, t.sttTooltip)"
                      @mouseleave="hideTooltip"
                    />
                  </div>
                </div>
                <div class="stat-value">{{ formatInt(growth?.featureTotalsLast30Days.totalStt || 0) }}</div>
              </div>
            </div>
            <!-- COPILOT -->
            <div class="analytics-dash-card glass-card">
              <div class="stat-content">
                <div class="stat-label-row">
                  <span class="stat-label">{{ t.copilot }}</span>
                  <div class="stat-tooltip-wrap">
                    <font-awesome-icon
                      icon="circle-info"
                      class="stat-tooltip-icon"
                      @mouseenter="(e: MouseEvent) => showTooltip(e, t.copilotTooltip)"
                      @mouseleave="hideTooltip"
                    />
                  </div>
                </div>
                <div class="stat-value">{{ formatInt(growth?.featureTotalsLast30Days.totalCopilot || 0) }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ROW 4: CHART -->
        <section class="analytics-section">
          <div class="analytics-dash-panel glass-card analytics-dash-panel--chart full-width-chart">
            <div class="card-inner card-inner--chart">
              <div class="chart-header">
                <h3 class="card-inner-title">{{ t.dailyActive }}</h3>
                <div class="chart-period">{{ t.last30Days }}</div>
              </div>
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
        </section>
      </div>
    </template>

    <!-- FIXED TOOLTIP -->
    <div
      v-if="tooltip.visible"
      class="stat-tooltip-fixed"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      {{ tooltip.text }}
    </div>
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
    const tooltip = ref({
      visible: false,
      text: '',
      x: 0,
      y: 0,
    })
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
        quickStats: isTr ? 'Hızlı Bakış' : 'Quick Stats',
        revenueSectionTitle: isTr ? 'Gelir Performansı' : 'Revenue Performance',
        growthSectionTitle: isTr ? 'Büyüme ve Elde Tutma' : 'Growth & Retention',
        featureSectionTitle: isTr ? 'Özellik Kullanımı' : 'Feature Utilization',
        engagementSectionTitle: isTr ? 'Etkinlik Analizi' : 'Engagement Activity',
        revenueSection: isTr ? 'Gelir Analizi' : 'Revenue Analysis',
        growthSection: isTr ? 'Büyüme ve Etkinlik' : 'Growth & Activity',
        mrr: 'MRR',
        payingSubscribers: isTr ? 'Aboneler' : 'Subscribers',
        arpu: 'ARPU',
        dauYesterday: isTr ? 'DAU' : 'DAU',
        mau30: isTr ? 'MAU' : 'MAU',
        churn30: isTr ? 'Kayıp Oranı' : 'Churn Rate',
        featureTotals: isTr ? 'Özellik Kullanımı' : 'Feature Usage',
        copilot: 'Copilot',
        dailyActive: isTr ? 'Günlük Aktif Kullanıcılar' : 'Daily Active Users',
        totalUsers: isTr ? 'Toplam Kullanıcı' : 'Total Users',
        plan: isTr ? 'Plan' : 'Plan',
        userCount: isTr ? 'Kullanıcı' : 'Users',
        ocrUsage: isTr ? 'OCR' : 'OCR',
        last30Days: isTr ? 'Son 30 Gün' : 'Last 30 Days',
        chartDatasetLabel: isTr ? 'Aktif Kullanıcı' : 'Active Users',
        noDailyRows: isTr ? 'Veri bulunamadı.' : 'No data found.',
        loadError: isTr ? 'Veriler yüklenirken hata oluştu.' : 'Failed to load analytics.',
        retry: isTr ? 'Tekrar Dene' : 'Retry',

        // Tooltips
        mrrTooltip: isTr ? 'Bir aydaki tüm aktif aboneliklerden elde edilen tahmin edilebilir toplam gelir.' : 'The predictable total revenue generated by all active subscriptions in a month.',
        currencyTooltip: isTr ? 'Abonelik faturalandırması ve raporlaması için kullanılan birincil para birimi.' : 'The primary currency used for subscription billing and reporting.',
        subscribersTooltip: isTr ? 'Şu anda aktif ücretli aboneliği olan toplam kullanıcı sayısı.' : 'The total number of users currently on an active paying subscription.',
        arpuTooltip: isTr ? 'Aktif abone başına elde edilen ortalama geliri ölçer.' : 'Measures the average revenue generated per active subscriber.',
        dauTooltip: isTr ? 'Dün platformla etkileşime giren benzersiz kullanıcı sayısı.' : 'Daily Active Users - the number of unique users who interacted with the platform yesterday.',
        mauTooltip: isTr ? 'Son 30 gün içinde platformla etkileşime giren benzersiz kullanıcı sayısı.' : 'Monthly Active Users - the number of unique users who interacted with the platform in the last 30 days.',
        churnTooltip: isTr ? 'Son 30 gün içinde aboneliğini iptal eden abonelerin yüzdesi.' : 'The percentage of subscribers who canceled their subscriptions in the last 30 days.',
        ocrTooltip: isTr ? 'Son 30 günde işlenen toplam belge sayısı.' : 'Optical Character Recognition - total documents processed in the last 30 days.',
        sttTooltip: isTr ? 'Son 30 günde yazıya dökülen toplam ses dosyası.' : 'Speech to Text - total audio files transcribed in the last 30 days.',
        copilotTooltip: isTr ? 'Son 30 günde kullanıcılar tarafından başlatılan toplam AI Copilot etkileşimi.' : 'Total AI Copilot interactions initiated by users in the last 30 days.',
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
          maximumFractionDigits: 0,
        }).format(amount ?? 0)
      } catch {
        return `${amount ?? 0} ${cur}`
      }
    }

    const formatChurn = (ratio: number) => {
      if (ratio == null || Number.isNaN(ratio)) return '0%'
      const pct = ratio <= 1 ? ratio * 100 : ratio
      return `${new Intl.NumberFormat(locale.value, { maximumFractionDigits: 1 }).format(pct)}%`
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

    const getPlanColor = (name: string) => {
      const colors: Record<string, string> = {
        'Free': '#94a3b8',
        'Pro': '#3b82f6',
        'Enterprise': '#8b5cf6',
        'Premium': '#22c55e'
      }
      return colors[name] || '#64748b'
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
            backgroundColor: hexToRgba(green, 0.15),
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            borderWidth: 3,
          },
        ],
      }
    })

    const dailyActiveChartOptions = computed(() => {
      void themeKey.value
      const root = document.documentElement
      const styles = getComputedStyle(root)
      const border = styles.getPropertyValue('--border-color').trim() || 'rgba(255,255,255,0.1)'
      const muted = styles.getPropertyValue('--normal-text-color').trim()
      const header = styles.getPropertyValue('--header-text-color').trim()
      const soft = styles.getPropertyValue('--background-color-soft').trim()
      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' as const },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: border, drawBorder: false },
            ticks: {
              color: muted,
              font: { size: 11 },
              callback: (v: any) => formatInt(v),
            },
          },
          x: {
            grid: { display: false },
            ticks: {
              color: muted,
              font: { size: 11 },
              maxTicksLimit: 8,
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
            padding: 12,
            cornerRadius: 12,
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
      } finally {
        // Add a small delay for a smoother, premium feel
        setTimeout(() => {
          isLoading.value = false
        }, 600)
      }
    }

    const showTooltip = (event: MouseEvent, text: string) => {
      const el = event.currentTarget as HTMLElement
      if (!el) return
      const rect = el.getBoundingClientRect()
      tooltip.value = {
        visible: true,
        text,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      }
    }

    const hideTooltip = () => {
      tooltip.value.visible = false
    }

    const handleGlobalRefetch = () => {
      fetchAll()
    }

    onMounted(() => {
      fetchAll()
      window.addEventListener('app:refetch', handleGlobalRefetch)
      themeObserver = new MutationObserver(() => {
        themeKey.value = document.documentElement.getAttribute('data-theme') || 'light'
      })
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      })
    })

    onBeforeUnmount(() => {
      if (themeObserver) themeObserver.disconnect()
      window.removeEventListener('app:refetch', handleGlobalRefetch)
      hideTooltip()
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
      getPlanColor,
      fetchAll,
      tooltip,
      showTooltip,
      hideTooltip,
    }
  },
})
</script>

<style scoped lang="scss">
.admin-analytics {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.analytics-section {
  margin-bottom: 1rem;
}

.section-header {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
}

.analytics-section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--header-text-color);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: var(--primary-green-color);
    font-size: 0.85rem;
  }
}

.glass-card {
  background: var(--background-color);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);

  &:hover {
    border-color: var(--primary-green-color);
  }
}

/* Layout Stack */
.analytics-layout-stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* KPI Cards & Grids */
.analytics-grid {
  display: grid;
  gap: 1rem;

  &--4 {
    grid-template-columns: repeat(4, 1fr);
    @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 600px) { grid-template-columns: 1fr; }
  }

  &--3 {
    grid-template-columns: repeat(3, 1fr);
    @media (max-width: 900px) { grid-template-columns: 1fr; }
  }
}

.analytics-dash-card {
  padding: 1.1rem 1.25rem;
  display: flex;
  align-items: center;

  .stat-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--normal-text-color);
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--header-text-color);
    letter-spacing: -0.01em;
  }
}

.stat-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.stat-tooltip-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.stat-tooltip-icon {
  font-size: 0.75rem;
  color: var(--normal-text-color);
  opacity: 0.5;
  cursor: help;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
    color: var(--primary-green-color);
  }
}

.stat-tooltip-fixed {
  position: fixed;
  transform: translateX(-50%) translateY(-100%);
  width: max-content;
  max-width: 240px;
  padding: 10px 14px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--header-text-color);
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  z-index: 9999;
  pointer-events: none;
  animation: tooltipFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: var(--border-color) transparent transparent transparent;
  }
}

@keyframes tooltipFadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-90%); }
  to { opacity: 1; transform: translateX(-50%) translateY(-100%); }
}

.full-width-chart {
  width: 100%;
}

/* Charts & Panels */
.analytics-dash-panel {
  overflow: hidden;
  height: 100%;

  &--chart {
    min-height: 400px;
  }
}

.card-inner {
  padding: 1.5rem;

  &--chart {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  .card-inner-title {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    color: var(--header-text-color);
  }

  .chart-period {
    font-size: 0.8rem;
    color: var(--normal-text-color);
    background: var(--background-color-soft);
    padding: 4px 10px;
    border-radius: 20px;
  }
}

.admin-analytics__chart-shell {
  height: 650px;
  position: relative;
}

/* Feature Grid */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.feature-card {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  .feature-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;

    &.ocr { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    &.stt { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
    &.copilot { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }
  }

  .feature-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--normal-text-color);
    margin-bottom: 2px;
  }

  .feature-val {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--header-text-color);
  }
}

.mb-6 { margin-bottom: 1.5rem; }
.mt-6 { margin-top: 1.5rem; }
.text-danger { color: #ef4444 !important; }

.admin-analytics__retry {
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  background: var(--primary-green-color);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 1rem;

  &:hover { filter: brightness(1.1); }
}

.analytics-dash-panel--error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;

  .error-icon {
    font-size: 3rem;
    color: #ef4444;
    margin-bottom: 1rem;
  }
}

.admin-analytics__skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  min-height: 80vh;
}

.skeleton-card-detailed {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  height: 100px;
}

.skeleton-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-card-icon {
  margin-left: 1.5rem;
}

.p-6 { padding: 1.5rem; }

</style>


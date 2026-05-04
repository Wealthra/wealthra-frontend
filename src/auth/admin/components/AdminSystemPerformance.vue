<template>
  <div class="admin-system-performance-c">
    <div class="admin-system-performance-chart">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <div class="admin-system-performance-data">
      <div class="admin-system-performance-grid">
        <div class="card-wrapper">
          <div class="card-wrapper-title">
            {{ selectedLanguage === 'English' ? 'Total Transactions' : 'Toplam İşlemler' }}
          </div>
          <div class="card-wrapper-context">
            {{ formatAmount(totalTransactionCountNow) }}
          </div>
        </div>
        <div class="card-wrapper">
          <div class="card-wrapper-title">
            {{ selectedLanguage === 'English' ? 'Total Users' : 'Toplam Kullanıcılar' }}
          </div>
          <div class="card-wrapper-context">
            {{ formatAmount(totalUserCountNow) }}
          </div>
        </div>
        <div class="card-wrapper">
          <div class="card-wrapper-title">
            {{ selectedLanguage === 'English' ? 'Average Response Time' : 'Ortalama Yanıt Süresi' }}
          </div>
          <div class="card-wrapper-context">{{ isPrivacyMode ? '••••' : averageResponseTimeMs?.toFixed(2) }} ms</div>
        </div>
        <div class="card-wrapper">
          <div class="card-wrapper-title">
            {{ selectedLanguage === 'English' ? 'Error Rate' : 'Hata Oranı' }}
          </div>
          <div class="card-wrapper-context">{{ isPrivacyMode ? '••••' : errorRate?.toFixed(2) }} %</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Bar } from 'vue-chartjs'
import { useCurrency } from '@/composables/useCurrency'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default defineComponent({
  name: 'AdminSystemPerformance',
  components: {
    Bar,
  },
  props: {
    totalTransactionCountLastMonth: { type: Number, required: true },
    totalTransactionCountNow: { type: Number, required: true },
    totalUserCountLastMonth: { type: Number, required: true },
    totalUserCountNow: { type: Number, required: true },
    averageResponseTimeMs: { type: Number, required: true },
    errorRate: { type: Number, required: true },
    serverUptime: { type: String, required: true },
    dailyActiveUserCount: { type: Number, required: true },
    selectedLanguage: { type: String, required: true },
  },
  setup(props) {
    const { formatAmount, isPrivacyMode } = useCurrency()
    return { formatAmount, isPrivacyMode }
  },
  computed: {
    chartData() {
      const transNow = this.isPrivacyMode ? 0 : this.totalTransactionCountNow
      const transLast = this.isPrivacyMode ? 0 : this.totalTransactionCountLastMonth
      const userNow = this.isPrivacyMode ? 0 : this.totalUserCountNow
      const userLast = this.isPrivacyMode ? 0 : this.totalUserCountLastMonth

      return {
        labels:
          this.selectedLanguage === 'English'
            ? ['Transactions', 'Users']
            : ['İşlemler', 'Kullanıcılar'],
        datasets: [
          {
            label: this.selectedLanguage === 'English' ? 'Last Month' : 'Geçen Ay',
            backgroundColor: '#42b983',
            data: [transLast, userLast],
          },
          {
            label: this.selectedLanguage === 'English' ? 'Now' : 'Şimdi',
            backgroundColor: '#ff6384',
            data: [transNow, userNow],
          },
        ],
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' as const },
          title: {
            display: true,
            text:
              this.selectedLanguage === 'English'
                ? 'Performance Comparison'
                : 'Performans Karşılaştırması',
          },
          tooltip: {
            enabled: !this.isPrivacyMode
          }
        },
      }
    },
  },
})
</script>

<style scoped lang="scss">
.admin-system-performance-c {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 1rem;

  .admin-system-performance-chart {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    min-height: 600px;

    margin-bottom: 2rem;
  }
  .admin-system-performance-data {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;

    .admin-system-performance-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 3rem;
      width: 100%;
      height: 100%;

      .card-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        width: 100%;
        height: 100%;
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
        padding: 1rem 1.5rem;

        &-title {
          font-size: 1.2rem;
          font-weight: bold;
          color: var(--normal-text-color);
          margin-bottom: 0.5rem;
        }
        &-context {
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--header-text-color);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .admin-system-performance-c {
    padding: 0.5rem;

    .admin-system-performance-chart {
      min-height: 350px;
      margin-bottom: 1rem;
    }

    .admin-system-performance-data {
      .admin-system-performance-grid {
        grid-template-columns: 1fr;
        gap: 1rem;

        .card-wrapper {
          padding: 0.75rem 1rem;

          &-title {
            font-size: 1rem;
            margin-bottom: 0.25rem;
          }

          &-context {
            font-size: 1.2rem;
          }
        }
      }
    }
  }
}
</style>

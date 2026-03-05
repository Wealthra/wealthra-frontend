<template>
  <div class="ui-graph">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script lang="ts">
import { Bar } from 'vue-chartjs'
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

export default {
  name: 'UIGraph',
  components: {
    Bar,
  },

  props: {
    incomeExpenseData: {
      type: Array as () => Array<{
        month: string
        income: number
        expenses: number
      }>,
      default: () => [],
    },
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },

  computed: {
    processedData() {
      return this.translateIfNeeded(this.incomeExpenseData, this.selectedLanguage)
    },

    chartData() {
      return {
        labels: this.processedData.map(item => item.month),
        datasets: [
          {
            label: this.selectedLanguage === 'English' ? 'Income' : 'Gelir',
            data: this.processedData.map(item => item.income),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: this.selectedLanguage === 'English' ? 'Expenses' : 'Giderler',
            data: this.processedData.map(item => item.expenses),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      }
    },

    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 300,
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top' as const,
          },
          title: {
            display: true,
            text: this.selectedLanguage === 'English' ? 'Income and Expenses' : 'Gelir ve Giderler',
          },
        },
      }
    },
  },

  methods: {
    translateIfNeeded(
      data: Array<{ month: string; income: number; expenses: number }>,
      language: string
    ) {
      if (language === 'English') {
        return data
      } else {
        return data.map(item => ({
          month: this.translateMonth(item.month, language),
          income: item.income,
          expenses: item.expenses,
        }))
      }
    },

    translateMonth(month: string, language: string) {
      const translations: Record<string, Record<string, string>> = {
        Turkish: {
          January: 'Ocak',
          February: 'Şubat',
          March: 'Mart',
          April: 'Nisan',
          May: 'Mayıs',
          June: 'Haziran',
          July: 'Temmuz',
          August: 'Ağustos',
          September: 'Eylül',
          October: 'Ekim',
          November: 'Kasım',
          December: 'Aralık',
        },
      }
      return translations[language]?.[month] || month
    },
  },
}
</script>

<style scoped lang="scss">
.ui-graph {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

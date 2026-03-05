<template>
  <div class="ui-expense-distribution">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script lang="ts">
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

export default {
  name: 'UIExpenseDistribution',
  components: {
    Pie,
  },
  props: {
    expenseDistribution: {
      type: Object,
      default: () => ({}),
    },
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },
  data() {
    return {
      processedExpenseDistribution: {} as Record<string, number>,
      chartData: {
        labels: [] as string[],
        datasets: [
          {
            label: 'Expense Distribution',
            data: [] as number[],
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
              '#C9CBCF',
            ],
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: 'Expense Distribution',
          },
        },
      },
    }
  },
  methods: {
    updateProcessedData() {
      if (this.selectedLanguage === 'Turkish') {
        this.processedExpenseDistribution = {}

        // Define the mapping
        const categoryMapping = {
          Food: 'Yiyecek',
          Transport: 'Ulaşım',
          Entertainment: 'Eğlence',
          Health: 'Sağlık',
          Shopping: 'Alışveriş',
          Housing: 'Konut',
          Education: 'Eğitim',
        }

        // Only add properties that exist in expenseDistribution
        for (const [englishKey, turkishKey] of Object.entries(categoryMapping)) {
          if (
            englishKey in this.expenseDistribution &&
            this.expenseDistribution[englishKey] !== undefined
          ) {
            this.processedExpenseDistribution[turkishKey] = this.expenseDistribution[englishKey]
          }
        }
      } else {
        this.processedExpenseDistribution = { ...this.expenseDistribution }
      }

      this.updateChartData()
    },

    updateChartData() {
      // Extract categories and amounts from the processed data
      const categories = Object.keys(this.processedExpenseDistribution)
      const amounts = Object.values(this.processedExpenseDistribution)

      this.chartData = {
        labels: categories,
        datasets: [
          {
            label: 'Expense Distribution',
            data: amounts,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
              '#C9CBCF',
            ],
          },
        ],
      }

      // Update title based on language
      this.chartOptions = {
        ...this.chartOptions,
        plugins: {
          ...this.chartOptions.plugins,
          title: {
            ...this.chartOptions.plugins.title,
            text: this.selectedLanguage === 'English' ? 'Expense Distribution' : 'Gider Dağılımı',
          },
        },
      }
    },
  },

  mounted() {
    this.updateProcessedData()
  },

  watch: {
    selectedLanguage: {
      handler() {
        this.updateProcessedData()
      },
    },
    expenseDistribution: {
      handler() {
        this.updateProcessedData()
      },
    },
  },
}
</script>

<style scoped lang="scss">
.ui-expense-distribution {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

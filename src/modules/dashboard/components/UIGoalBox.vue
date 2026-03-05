<template>
  <div class="ui-goalbox-c">
    <div class="goalbox-no-data" v-if="!financialGoal">
      <div class="goalbox-header">
        {{
          selectedLanguage == 'English' ? 'No Financial Goal Set' : 'Finansal Hedef Belirlenmedi'
        }}
      </div>
      <div class="goalbox-no-data-text">
        {{
          selectedLanguage == 'English'
            ? 'Please set a financial goal to track your progress.'
            : 'Lütfen ilerlemenizi takip etmek için bir finansal hedef belirleyin.'
        }}
      </div>
    </div>
    <div v-else>
      <div class="goalbox-header">
        {{ selectedLanguage == 'English' ? 'Latest Goal' : 'En Son Hedef' }}
      </div>
      <div class="goalbox-top-wrapper">
        <div class="goalbox-header-title">
          {{ financialGoal.name }}
        </div>
        <div class="goalbox-deadline">
          {{ selectedLanguage == 'English' ? 'Deadline' : 'Son Tarih' }}:
          {{ formatDate(financialGoal.deadline) }}
        </div>
      </div>
      <div class="goalbox-progress-bar">
        <div class="goalbox-bar-fill" :style="{ width: animatedWidth + '%' }"></div>
      </div>
      <div class="goalbox-amounts">
        <span>
          {{
            selectedLanguage == 'English'
              ? 'Initial Amount: $' + financialGoal.initialAmount
              : 'Başlangı Miktarı: $' + financialGoal.initialAmount
          }}</span
        >
        <span
          >{{
            selectedLanguage == 'English'
              ? 'Target Amount: $' + financialGoal.targetAmount
              : 'Hedef Miktarı: $' + financialGoal.targetAmount
          }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'UIGoalBox',
  data() {
    return {
      animatedWidth: 0,
    }
  },
  props: {
    financialGoal: {
      type: Object as () =>
        | null
        | {
            created: string
            createdBy: string
            deadline: string
            id: number
            initialAmount: number
            lastModified: string
            lastModifiedBy: string
            name: string
            targetAmount: number
          },
      required: false,
      default: null,
    },
    selectedLanguage: {
      type: String,
      required: true,
    },
  },

  computed: {
    progressBarWidth() {
      if (!this.financialGoal) {
        return 0
      }

      if (this.financialGoal.targetAmount === 0) {
        return 0
      }
      const percentage = (this.financialGoal.initialAmount / this.financialGoal.targetAmount) * 100
      if (percentage > 100) {
        return 100
      }
      return parseFloat(percentage.toFixed(2))
    },
  },
  methods: {
    formatDate(dateString: string) {
      const date = new Date(dateString)
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
      return date.toLocaleDateString(
        this.selectedLanguage === 'English' ? 'en-US' : 'tr-TR',
        options
      )
    },
  },
  mounted() {
    setTimeout(() => {
      this.animatedWidth = this.progressBarWidth
    }, 100)
  },

  watch: {
    progressBarWidth(newVal) {
      this.animatedWidth = newVal
    },
  },
}
</script>

<style scoped lang="scss">
.ui-goalbox-c {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 1rem;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  .goalbox-no-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    text-align: center;
    font-size: 1rem;
    color: var(--normal-text-color);
    margin-top: 1rem;

    .goalbox-header {
      font-size: 1.5rem;
      color: var(--header-text-color);
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
  }

  .goalbox-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.2rem;
    color: var(--header-text-color);
    font-weight: bold;
  }

  .goalbox-top-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;

    .goalbox-header-title {
      font-size: 1.5rem;
      color: var(--normal-text-color);
      word-break: break-word;
    }

    .goalbox-deadline {
      font-size: 1rem;
      color: var(--normal-text-color);
      white-space: nowrap;
    }
  }

  .goalbox-progress-bar {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 2rem;
    overflow: hidden;
    margin-top: 1rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);

    .goalbox-bar-fill {
      background-color: var(--primary-green-color);
      height: 100%;
      border-radius: var(--border-radius);
      transition: width 0.5s ease-out;
    }
  }

  .goalbox-amounts {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1rem;
    color: var(--normal-text-color);
    margin-top: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
    width: 100%;

    span {
      font-size: 1rem;
      color: var(--normal-text-color);
      word-break: break-word;
    }
  }
}

@media (max-width: 768px) {
  .ui-goalbox-c {
    padding: 0.8rem;

    .goalbox-no-data {
      font-size: 0.8rem;
      margin-top: 0.5rem;

      .goalbox-header {
        font-size: 1.2rem;
      }
    }
    .goalbox-header {
      font-size: 1.1rem;
    }

    .goalbox-top-wrapper {
      margin-top: 0.8rem;
      .goalbox-header-title {
        font-size: 1.3rem;
      }
      .goalbox-deadline {
        font-size: 0.9rem;
      }
    }

    .goalbox-progress-bar {
      height: 1.8rem;
      margin-top: 0.8rem;
    }

    .goalbox-amounts {
      font-size: 0.9rem;
      margin-top: 0.8rem;
      span {
        font-size: 0.9rem;
      }
    }
  }
}
</style>

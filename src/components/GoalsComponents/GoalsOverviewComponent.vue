<template>
  <div class="goals-overview-component-c">
    <div class="goals-overview-component">
      <div class="goals-overview-component-title">
        {{ goalsOverviewText }}
      </div>
      <div class="goals-overview-component-content">
        <div class="goals-overview-component-amount">
          {{ goalAmount }}
        </div>
        <div class="goals-overview-component-progress-bar">
          <div
            class="goals-overview-component-progress-bar-fill"
            :style="{ width: progressBarWidthPercentage + '%' }"
          ></div>
        </div>
        <div class="goals-overview-component-percentage">{{ displayPercentage }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'GoalsOverviewComponent',

  props: {
    selectedLanguage: {
      type: String,
      default: 'English',
    },
    totalInitialAmount: {
      type: Number,
      default: 0,
    },
    totalTargetAmount: {
      type: Number,
      default: 0,
    },
  },

  computed: {
    percentageValue(): number {
      if (this.totalTargetAmount === 0) {
        return 0
      }
      return (this.totalInitialAmount / this.totalTargetAmount) * 100
    },

    progressBarWidthPercentage(): number {
      return Math.min(this.percentageValue, 100)
    },

    displayPercentage(): string {
      return this.percentageValue.toFixed(1) + '%'
    },

    goalsOverviewText() {
      return this.selectedLanguage === 'English'
        ? 'Financial Goal Overview'
        : 'Finansal Hedef Özeti'
    },

    goalAmount() {
      const formatNumber = (num: number) => num.toLocaleString('en-US')
      return `$${formatNumber(this.totalInitialAmount)} / $${formatNumber(this.totalTargetAmount)}`
    },
  },
}
</script>

<style scoped lang="scss">
.goals-overview-component-c {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: var(--background-color-soft);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  padding: 1rem;

  .goals-overview-component {
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 0.75rem;

    .goals-overview-component-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--header-text-color);
    }

    .goals-overview-component-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 2rem;

      .goals-overview-component-amount {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: auto;
        font-weight: bold;
        font-size: 1.5rem;
        color: var(--normal-text-color);
        flex-shrink: 0;
      }
      .goals-overview-component-progress-bar {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-grow: 1;
        height: 24px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        overflow: hidden;

        .goals-overview-component-progress-bar-fill {
          height: 100%;
          background-color: var(--primary-green-color);
          border-radius: 6px;
          transition: width 0.3s ease-in-out;
        }
      }
      .goals-overview-component-percentage {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: auto;
        font-weight: bold;
        font-size: 1.5rem;
        color: var(--normal-text-color);
        flex-shrink: 0;
      }
    }
  }
}
@media (max-width: 768px) {
  .goals-overview-component-c {
    padding: 0.5rem;
    .goals-overview-component {
      .goals-overview-component-title {
        font-size: 1.25rem;
      }
      .goals-overview-component-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;

        .goals-overview-component-amount,
        .goals-overview-component-percentage {
          font-size: 1.25rem;
        }
        .goals-overview-component-progress-bar {
          width: 100%;
          .goals-overview-component-progress-bar-fill {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>

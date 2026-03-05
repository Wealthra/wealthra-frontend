<template>
  <div class="budget-overview-component-c">
    <div class="budget-overview-component">
      <div class="budget-overview-component-title">
        {{ budgetOverviewText }}
      </div>
      <div class="budget-overview-component-content">
        <div class="budget-overview-component-amount">
          {{ budgetAmount }}
        </div>
        <div class="budget-overview-component-progress-bar">
          <div
            class="budget-overview-component-progress-bar-fill"
            :style="{ width: progressBarWidthPercentage + '%' }"
          ></div>
        </div>
        <div class="budget-overview-component-percentage">{{ displayPercentage }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'BudgetOverviewComponent',

  props: {
    selectedLanguage: {
      type: String,
      default: 'English',
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    limitAmount: {
      type: Number,
      default: 0,
    },
  },

  computed: {
    percentageValue(): number {
      if (this.limitAmount === 0) {
        return 0
      }
      return (this.currentAmount / this.limitAmount) * 100
    },

    progressBarWidthPercentage(): number {
      return Math.min(this.percentageValue, 100)
    },

    displayPercentage(): string {
      return this.percentageValue.toFixed(1) + '%'
    },

    budgetOverviewText() {
      return this.selectedLanguage === 'English' ? 'Monthly Budget Overview' : 'Aylık Bütçe Özeti'
    },

    budgetAmount() {
      const formatNumber = (num: number) => num.toLocaleString('en-US')
      return `$${formatNumber(this.currentAmount)} / $${formatNumber(this.limitAmount)}`
    },
  },
}
</script>

<style scoped lang="scss">
.budget-overview-component-c {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: var(--background-color-soft);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  padding: 1rem;

  .budget-overview-component {
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 0.75rem;

    .budget-overview-component-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--header-text-color);
    }

    .budget-overview-component-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 2rem;

      .budget-overview-component-amount {
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
      .budget-overview-component-progress-bar {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-grow: 1;
        height: 24px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        overflow: hidden;

        .budget-overview-component-progress-bar-fill {
          height: 100%;
          background-color: var(--primary-yellow-color);
          border-radius: 6px;
          transition: width 0.3s ease-in-out;
        }
      }
      .budget-overview-component-percentage {
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
  .budget-overview-component-c {
    padding: 0.5rem;
    .budget-overview-component {
      .budget-overview-component-title {
        font-size: 1.25rem;
      }
      .budget-overview-component-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;

        .budget-overview-component-amount,
        .budget-overview-component-percentage {
          font-size: 1.25rem;
        }
        .budget-overview-component-progress-bar {
          width: 100%;
          .budget-overview-component-progress-bar-fill {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>

<template>
  <div class="information-box-c" :style="{ backgroundColor: backgroundColor }">
    <div class="title">{{ title }}</div>
    <div class="amount">${{ currentAmount.toLocaleString() }}</div>
    <div class="percentage-container">
      <img src="../../icons/arrow-green.svg" alt="arrow-green" v-if="!isNegative" />
      <img src="../../icons/arrow-red.svg" alt="arrow-red" v-else />
      <div class="percentage" :style="{ color: isNegative ? redColor : greenColor }">
        {{ animatedPercentage }}%
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'InformationBoxCard',
  data() {
    return {
      isNegative: false,
      redColor: '#e74c3c',
      greenColor: '#7dcea0',
      backgroundColor: `var(--primary-${this.color}-color)`,
    }
  },
  props: {
    currentAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    lastAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    title: {
      type: String,
      required: true,
      default: 'Total Net Worth',
    },
    color: {
      type: String,
      default: 'blue',
    },
    type: {
      type: String,
      default: 'spending',
    },
  },

  methods: {
    calculatePercentage() {
      if (this.lastAmount === 0 && this.currentAmount === 0) {
        return 0
      }
      if (this.lastAmount === 0) {
        return 100
      }

      return (this.currentAmount / this.lastAmount) * 100 - 100
    },
    adjustPercentage() {
      if (this.type == 'spending') {
        this.isNegative = this.currentAmount - this.lastAmount < 0 ? false : true
      } else {
        this.isNegative = this.currentAmount - this.lastAmount < 0 ? true : false
      }
    },
  },
  computed: {
    percentage() {
      const percentage: number = this.calculatePercentage()
      if (percentage < 0) {
        this.adjustPercentage()
        return percentage.toFixed(1).slice(1)
      }
      this.adjustPercentage()
      return percentage.toFixed(1)
    },
    animatedPercentage() {
      const percentage: number = this.calculatePercentage()
      if (percentage < 0) {
        this.adjustPercentage()
        return percentage.toFixed(1).slice(1)
      }
      this.adjustPercentage()
      return percentage.toFixed(1)
    },
  },
}
</script>

<style scoped lang="scss">
.information-box-c {
  display: flex;
  flex-direction: column;
  width: 25%;
  padding: 0.8rem;
  border-radius: var(--border-radius);
  text-align: left;
  font-family: var(--main-font);
  .title {
    font-size: 20px;
    font-weight: medium;
    color: #000000;
  }
  .amount {
    font-size: 24px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 0.2rem;
  }
  .percentage-container {
    display: flex;
    width: fit-content;
    justify-content: flex-start;
    align-items: center;
    padding: 0.3rem;
    gap: 0.1rem;
    background: #fff;
    border-radius: var(--border-radius);
    .percentage {
      font-size: 12px;
      font-weight: 500;
      line-height: 1.2;
    }
    img {
      width: 16px;
      height: 16px;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 0.6rem;

    .title {
      font-size: 12px;
    }

    .amount {
      font-size: 24px;
    }

    .percentage-container {
      gap: 0.1rem;

      .percentage {
        font-size: 11px;
      }
    }
  }
}
</style>

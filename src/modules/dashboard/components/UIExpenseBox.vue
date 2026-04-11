<template>
  <div class="expenses-c">
    <template v-if="loading">
      <div class="skeleton-box expense-title-skeleton"></div>
      <div class="skeleton-box expense-amount-skeleton"></div>
    </template>
    <template v-else>
      <div class="title">{{ title }}</div>
      <div class="amount">${{ amount.toLocaleString() }}</div>
    </template>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ExpenseBox',
  props: {
    title: {
      type: String,
      required: true,
      default: 'Total Expenses',
    },
    amount: {
      type: Number,
      required: true,
      default: 12385,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style scoped lang="scss">

.expenses-c {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25%;
  padding: 1.2rem;
  border-radius: var(--border-radius);
  text-align: left;
  font-family: var(--main-font);
  background: var(--primary-red-color);
  font-weight: 500;

  .expense-title-skeleton {
    width: 80%;
    height: 1.3rem;
    margin-bottom: 0.6rem;
  }

  .expense-amount-skeleton {
    width: 60%;
    height: 1.7rem;
  }

  .title {
    font-size: 1.3rem;
    font-weight: 500;
    color: #000000;
  }
  .amount {
    font-size: 1.7rem;
    font-weight: 700;
    color: #000000;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 0.8rem;

    .title {
      font-size: 1.1rem;
    }

    .amount {
      font-size: 1.3rem;
    }
  }
}
</style>


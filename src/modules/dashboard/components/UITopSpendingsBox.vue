<template>
  <div class="top-spendings-c">
    <div class="title">{{ title }}</div>
    <div class="spendings" v-for="spending in spendingsData" :key="spending.categoryName">
      <div class="name-and-price">
        <div class="name" :style="{ backgroundColor: spending.color }">
          {{ spending.categoryName }}
        </div>
        <div class="amount">{{ '-$' + spending.totalAmount }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { Spendings } from '@/interfaces/Spendings'
import { getCategoryColorByIndex } from '@/utils/chartCategoryPalette'

export default {
  name: 'TopSpendingsBox',
  data() {
    return {
      spendingsData: [] as Array<Spendings>,
    }
  },

  props: {
    spendings: {
      type: Array as () => Array<Spendings>,
      required: true,
    },
    title: {
      type: String,
      default: 'Top Spendings',
    },
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },

  methods: {
    processSpendingsData() {
      if (!this.spendings || !Array.isArray(this.spendings)) {
        this.spendingsData = []
        return
      }
      // Use category names from API as-is; colors from parent or by index (no hardcoded keys)
      this.spendingsData = this.spendings.map((s, index) => ({
        ...s,
        color: s.color || getCategoryColorByIndex(index),
      }))
    },
  },

  watch: {
    spendings: {
      handler: 'processSpendingsData',
      immediate: true,
    },
  },
}
</script>

<style scoped lang="scss">
.top-spendings-c {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 1.2rem;
  border-radius: var(--border-radius);
  font-family: var(--main-font);
  background: var(--background-color);

  .title {
    height: fit-content;
    width: fit-content;
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--header-text-color);
    line-height: 1.2;
    margin-bottom: 0.4rem;
  }

  .spendings {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-top: 0.6rem;

    .name-and-price {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;

      .name {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.8rem;
        color: white;
        padding: 0.6rem;
        border-radius: 15px;
        font-weight: 500;
        width: 140px;
      }

      .amount {
        font-size: 1rem;
        color: var(--reverse-primary-red-color);
        font-weight: 500;
      }
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 0.8rem;

    .title {
      font-size: 0.8rem;
    }

    .spendings {
      margin-top: 0.4rem;

      .name-and-price {
        .name {
          font-size: 11px;
        }

        .amount {
          font-size: 11px;
        }
      }
    }
  }
}
</style>

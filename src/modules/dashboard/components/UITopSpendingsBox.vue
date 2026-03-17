<template>
  <div class="top-spendings-c">
    <div class="title">{{ title }}</div>
    <div class="spendings" v-for="spending in spendingsData" :key="spending.categoryName">
      <div class="name-and-price">
        <div class="name">
          <span class="name__dot" :style="{ backgroundColor: spending.color }"></span>
          <span class="name__label">
            {{ spending.categoryName }}
          </span>
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
        display: inline-flex;
        justify-content: flex-start;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.8rem;
        color: var(--header-text-color);
        padding: 0.45rem 0.75rem;
        border-radius: 999px;
        font-weight: 500;
        min-width: 0;
        max-width: 160px;
        border: 1px solid var(--border-color);
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.02);
      }

      .name__dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        flex-shrink: 0;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4);
      }

      .name__label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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

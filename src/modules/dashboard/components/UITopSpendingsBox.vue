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
      if (!this.spendings) {
        this.spendingsData = []
        return
      }

      // Translate category names to Turkish if needed
      if (this.selectedLanguage === 'Turkish') {
        this.spendings.forEach(spending => {
          if (spending.categoryName === 'Food') {
            spending.categoryName = 'Yiyecek'
          } else if (spending.categoryName === 'Transport') {
            spending.categoryName = 'Ulaşım'
          } else if (spending.categoryName === 'Entertainment') {
            spending.categoryName = 'Eğlence'
          } else if (spending.categoryName === 'Health') {
            spending.categoryName = 'Sağlık'
          } else if (spending.categoryName === 'Shopping') {
            spending.categoryName = 'Alışveriş'
          } else if (spending.categoryName === 'Housing') {
            spending.categoryName = 'Konut'
          } else if (spending.categoryName === 'Healthcare') {
            spending.categoryName = 'Sağlık'
          } else if (spending.categoryName === 'Education') {
            spending.categoryName = 'Eğitim'
          }
        })
      } else {
        this.spendings.forEach(spending => {
          if (spending.categoryName === 'Yiyecek') {
            spending.categoryName = 'Food'
          } else if (spending.categoryName === 'Ulaşım') {
            spending.categoryName = 'Transport'
          } else if (spending.categoryName === 'Eğlence') {
            spending.categoryName = 'Entertainment'
          } else if (spending.categoryName === 'Sağlık') {
            spending.categoryName = 'Health'
          } else if (spending.categoryName === 'Alışveriş') {
            spending.categoryName = 'Shopping'
          } else if (spending.categoryName === 'Konut') {
            spending.categoryName = 'Housing'
          } else if (spending.categoryName === 'Eğitim') {
            spending.categoryName = 'Education'
          }
        })
      }

      // Create a deep copy of the spendings array
      this.spendingsData = JSON.parse(JSON.stringify(this.spendings))

      for (let i: number = 0; i < this.spendingsData.length; i++) {
        if (
          this.spendingsData[i].categoryName === 'Other' ||
          this.spendingsData[i].categoryName === 'Diğer'
        ) {
          this.spendingsData[i].color = 'var(--category-other-color)'
        }
        if (
          this.spendingsData[i].categoryName === 'Food' ||
          this.spendingsData[i].categoryName === 'Yiyecek'
        ) {
          this.spendingsData[i].color = 'var(--category-food-color)'
        }
        if (
          this.spendingsData[i].categoryName === 'Transport' ||
          this.spendingsData[i].categoryName === 'Ulaşım'
        ) {
          this.spendingsData[i].color = 'var(--category-transport-color)'
        }
        if (
          this.spendingsData[i].categoryName === 'Entertainment' ||
          this.spendingsData[i].categoryName === 'Eğlence'
        ) {
          this.spendingsData[i].color = 'var(--category-entertainment-color)'
        }
        if (
          this.spendingsData[i].categoryName === 'Health' ||
          this.spendingsData[i].categoryName === 'Sağlık'
        ) {
          this.spendingsData[i].color = 'var(--category-healthcare-color)'
        }
        if (
          this.spendingsData[i].categoryName === 'Shopping' ||
          this.spendingsData[i].categoryName === 'Alışveriş'
        ) {
          this.spendingsData[i].color = 'var(--category-shopping-color)'
        }
        if (
          this.spendingsData[i].categoryName === 'Housing' ||
          this.spendingsData[i].categoryName === 'Konut'
        ) {
          this.spendingsData[i].color = 'var(--category-housing-color)'
        }
        if (
          this.spendingsData[i].categoryName === 'Healthcare' ||
          this.spendingsData[i].categoryName === 'Sağlık'
        ) {
          this.spendingsData[i].color = 'var(--category-healthcare-color)'
        }
        if (
          this.spendingsData[i].categoryName === 'Education' ||
          this.spendingsData[i].categoryName === 'Eğitim'
        ) {
          this.spendingsData[i].color = 'var(--category-education-color)'
        }
      }
    },
  },

  watch: {
    spendings: {
      handler: 'processSpendingsData',
      immediate: true,
    },
    selectedLanguage: {
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
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-family: var(--main-font);

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

<template>
  <div class="budget-categories-component-c">
    <div class="budget-categories-header">
      <div class="budget-categories-title">
        {{ budgetCategoriesTitle }}
      </div>
      <div class="budget-categories-create-button">
        <button class="create-button" @click="isModalOpen = true">
          {{ selectedLanguage === 'English' ? 'Create New Category' : 'Yeni Kategori Oluştur' }}
        </button>
      </div>
    </div>
    <div class="budget-categories-content" v-if="isAvailableData">
      <div class="budget-categories-list">
        <div class="category-item" v-for="category in budgetCategoriesData" :key="category.id">
          <div class="category-item-top">
            <div class="category-name">{{ formatCategoryName(category.categoryName) }}</div>
            <div class="category-percentage">
              {{ categoryPercentage(category.currentAmount, category.limitAmount) }}
            </div>
          </div>
          <div class="category-item-middle">
            <div class="category-item-fraction">
              {{ categoryFraction(category.currentAmount, category.limitAmount) }}
            </div>
          </div>
          <div class="category-item-bottom">
            <div class="category-item-progress-bar">
              <div
                class="progress-bar"
                :style="{
                  width: categoryPercentage(category.currentAmount, category.limitAmount),
                  backgroundColor: categoryColor(
                    (category.currentAmount / category.limitAmount) * 100
                  ),
                }"
              ></div>
            </div>
            <div class="category-item-delete-icon" @click="deleteBudgetCategoryItem(category.id)">
              <font-awesome-icon :icon="actionIcons.delete" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="budget-categories-pagination" v-if="totalPagesBudget > 0">
      <button
        :disabled="pageNumberBudget === 1"
        @click="changePage(pageNumberBudget - 1)"
        class="pagination-btn"
      >
        <font-awesome-icon :icon="arrowIcons.left" class="arrow-left" />
      </button>

      <span
        v-for="page in displayedPages"
        :key="page"
        :class="['page-number', { active: page === pageNumberBudget }]"
        @click="changePage(page)"
      >
        {{ page }}
      </span>

      <span v-if="showEllipsis" class="ellipsis">...</span>

      <span
        v-if="showLastPage"
        :class="['page-number', { active: totalPagesBudget === pageNumberBudget }]"
        @click="changePage(totalPagesBudget)"
      >
        {{ totalPagesBudget }}
      </span>

      <button
        :disabled="pageNumberBudget === totalPagesBudget || totalPagesBudget === 0"
        @click="changePage(pageNumberBudget + 1)"
        class="pagination-btn"
      >
        <font-awesome-icon :icon="arrowIcons.right" class="arrow-right" />
      </button>
    </div>
    <div class="budget-categories-add-modal" v-if="isModalOpen">
      <div class="modal-content">
        <div class="modal-content-top">
          <h2>
            {{
              selectedLanguage === 'English' ? 'Add New Budget Limit' : 'Yeni Harcama Limiti Ekle'
            }}
          </h2>
          <span class="close-modal-button" @click="isModalOpen = false">&times;</span>
        </div>

        <select id="category" v-model="newBudgetCategory.categoryId" required class="budget-select">
          <option value="1">
            {{ (selectedLanguage || 'English') === 'English' ? 'Food' : 'Yiyecek' }}
          </option>
          <option value="2">
            {{ (selectedLanguage || 'English') === 'English' ? 'Entertainment' : 'Eğlence' }}
          </option>
          <option value="3">
            {{ (selectedLanguage || 'English') === 'English' ? 'Education' : 'Eğitim' }}
          </option>
          <option value="4">
            {{ (selectedLanguage || 'English') === 'English' ? 'Shopping' : 'Alışveriş' }}
          </option>
          <option value="5">
            {{ (selectedLanguage || 'English') === 'English' ? 'Housing' : 'Konut' }}
          </option>
          <option value="6">
            {{ (selectedLanguage || 'English') === 'English' ? 'Transport' : 'Ulaşım' }}
          </option>
          <option value="7">
            {{ (selectedLanguage || 'English') === 'English' ? 'Health' : 'Sağlık' }}
          </option>
          <option value="8">
            {{ (selectedLanguage || 'English') === 'English' ? 'Other' : 'Diğer' }}
          </option>
        </select>

        <input
          type="number"
          v-model="newBudgetCategory.currentAmount"
          :placeholder="selectedLanguage === 'English' ? 'Current Amount' : 'Mevcut Tutar'"
        />
        <input
          type="number"
          v-model="newBudgetCategory.limitAmount"
          :placeholder="selectedLanguage === 'English' ? 'Limit Amount' : 'Limit Tutarı'"
        />

        <div class="add-new-category-button-wrapper">
          <button @click="addNewBudgetCategory">
            {{ selectedLanguage === 'English' ? 'Add' : 'Ekle' }}
          </button>
        </div>
      </div>
    </div>
    <div class="budget-categories-no-data" v-if="!isAvailableData">
      <p>{{ selectedLanguage === 'English' ? 'No data available' : 'Veri yok' }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { arrowIcons, actionIcons } from '@/icons/fontawesome-icons'

const TRANSLATE_CATEGORY = {
  Food: 'Yiyecek',
  Entertainment: 'Eğlence',
  Education: 'Eğitim',
  Shopping: 'Alışveriş',
  Housing: 'Konut',
  Transport: 'Ulaşım',
  Health: 'Sağlık',
  Other: 'Diğer',
}

export default {
  name: 'BudgetCategoriesComponent',
  data() {
    return {
      newBudgetCategory: {
        categoryId: 0,
        limitAmount: null,
        currentAmount: null,
      },
      isModalOpen: false,
      isAvailableData: true,
      arrowIcons,
      actionIcons,
    }
  },
  props: {
    selectedLanguage: {
      type: String,
      required: true,
    },
    budgetCategoriesData: {
      type: Array as () => Array<{
        id: number
        limitAmount: number
        currentAmount: number
        created: string
        categoryId: number
        categoryName: string
      }>,
      default: () => [],
    },
    budgetHasMoreItems: {
      type: Boolean,
      required: true,
    },
    pageNumberBudget: {
      type: Number,
      required: true,
    },
    pageSizeBudget: {
      type: Number,
      required: true,
    },
    totalCountBudget: {
      type: Number,
      required: true,
    },
    totalPagesBudget: {
      type: Number,
      required: true,
    },
    page: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    budgetCategoriesTitle(): string {
      return this.selectedLanguage === 'English' ? 'Budget Categories' : 'Bütçe Kategorileri'
    },
    displayedPages() {
      // Display up to 5 page numbers around the current page
      const maxVisiblePages = 5
      const halfVisible = Math.floor(maxVisiblePages / 2)

      let startPage = Math.max(1, this.pageNumberBudget - halfVisible)
      const endPage = Math.min(startPage + maxVisiblePages - 1, this.totalPagesBudget)

      // Adjust start page if we're near the end
      if (this.totalPagesBudget - endPage < halfVisible) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      const pages = []
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      return pages
    },
    showEllipsis() {
      return (
        this.displayedPages.length > 0 &&
        this.displayedPages[this.displayedPages.length - 1] < this.totalPagesBudget - 1
      )
    },
    showLastPage() {
      return (
        this.displayedPages.length > 0 &&
        this.displayedPages[this.displayedPages.length - 1] < this.totalPagesBudget
      )
    },
  },
  methods: {
    categoryPercentage(currentAmount: number, limitAmount: number): string {
      if (limitAmount === 0) return '0%'
      const percentage = (currentAmount / limitAmount) * 100
      return `${percentage.toFixed(2)}%`
    },
    categoryFraction(currentAmount: number, limitAmount: number): string {
      return `$${currentAmount} / $${limitAmount}`
    },
    categoryColor(percentage: number): string {
      if (percentage < 50) return 'var(--primary-green-color)'
      else if (percentage < 80) return 'var(--primary-yellow-color)'
      else return 'var(--primary-red-color)'
    },
    formatCategoryName(categoryName: string): string {
      if (this.selectedLanguage === 'English') {
        return categoryName
      } else {
        return TRANSLATE_CATEGORY[categoryName as keyof typeof TRANSLATE_CATEGORY]
      }
    },
    changePage(page: number) {
      if (page < 1 || page > this.totalPagesBudget) return
      this.$emit('changePage', page)
    },
    addNewBudgetCategory() {
      if (
        this.newBudgetCategory.categoryId === 0 ||
        this.newBudgetCategory.limitAmount === null ||
        this.newBudgetCategory.currentAmount === null
      ) {
        alert('Please fill in all fields.')
        return
      }

      this.isModalOpen = false
      this.$emit('handleAddNewBudgetCategory', {
        categoryId: this.newBudgetCategory.categoryId,
        limitAmount: this.newBudgetCategory.limitAmount,
        currentAmount: this.newBudgetCategory.currentAmount,
      })
    },
    deleteBudgetCategoryItem(categoryId: number) {
      this.$emit('handleDeleteBudgetCategoryItem', categoryId)
    },
  },

  mounted() {
    if (this.budgetCategoriesData.length === 0) {
      this.isAvailableData = false
    }
  },
  watch: {
    budgetCategoriesData(newValue) {
      if (newValue.length === 0) {
        this.isAvailableData = false
      } else {
        this.isAvailableData = true
      }
    },
  },
}
</script>

<style scoped lang="scss">
.budget-categories-component-c {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  width: 100%;
  height: 85%;
  padding: 1.5rem;
  background-color: var(--background-color-soft);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);

  .budget-categories-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 0.75rem;
    color: var(--header-text-color);

    .budget-categories-title {
      font-size: 1.5rem;
      font-weight: bold;
    }
    .budget-categories-create-button {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      height: 100%;

      .create-button {
        background-color: var(--background-color);
        color: var(--header-text-color);
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;

        &:hover {
          background-color: var(--background-color-reverse);
          color: var(--reverse-header-text-color);
        }
      }
    }
  }

  .budget-categories-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    .budget-categories-list {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 0.5rem;
      height: fit-content;
      .category-item {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: var(--background-color);
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
        width: 100%;

        .category-item-top {
          display: flex;
          justify-content: space-between;
          width: 100%;
          align-items: center;

          .category-name {
            font-size: 1.2rem;
            font-weight: bold;
            color: var(--header-text-color);
          }
          .category-percentage {
            font-size: 1rem;
            color: var(--normal-text-color);
          }
        }

        .category-item-middle {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 100%;

          .category-item-fraction {
            font-size: 0.8rem;
            line-height: 1.5;
            color: var(--normal-text-color);
          }
        }

        .category-item-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          width: 100%;
          margin-top: 0.25rem;

          .category-item-progress-bar {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            flex-grow: 1;
            height: 16px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            overflow: hidden;

            .progress-bar {
              height: 100%;
              border-radius: 6px;
            }
          }

          .category-item-delete-icon {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 20px;
            cursor: pointer;
            img {
              width: 100%;
              height: 100%;

              &:hover {
                scale: 1.1;
                transition: scale 0.2s ease-in-out;
              }
            }
          }
        }
      }
    }
  }

  .budget-categories-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px 0;
    gap: 1rem;

    .pagination-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      background-color: var(--background-color-soft);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      cursor: pointer;

      &:disabled {
        opacity: 0.4;
        cursor: default;
      }

      .arrow-left {
        transform: rotate(180deg);
        width: 16px;
        height: 16px;
      }

      .arrow-right {
        width: 16px;
        height: 16px;
      }
    }

    .page-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid var(--border-color);

      &.active {
        background-color: var(--primary-green-color);
        border: transparent;
        color: white;
      }

      &:hover:not(.active) {
        background-color: var(--background-color-soft);
      }
    }

    .ellipsis {
      padding: 0 8px;
    }
  }

  .budget-categories-add-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;

    .modal-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      background-color: var(--background-color-soft);
      padding: 2rem;
      border-radius: var(--border-radius);
      width: 600px;

      .modal-content-top {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        margin-bottom: 1rem;

        h2 {
          color: var(--header-text-color);
          text-align: center;
          font-size: 1.5rem;
          font-weight: bold;
        }
        .close-modal-button {
          cursor: pointer;
          font-size: 1.5rem;
          text-align: center;

          color: var(--header-text-color);
          margin-left: auto;
        }
      }

      input {
        padding: 0.5rem;
        border-radius: 6px;
        border: 1px solid var(--border-color);
        background-color: var(--background-color);
        color: var(--normal-text-color);
        width: 100%;
        margin-bottom: 1rem;

        &:focus {
          outline: none;
          border-color: var(--border-color-reverse);
        }
      }

      .budget-select {
        padding: 0.5rem;
        border-radius: 6px;
        border: 1px solid var(--border-color);
        width: 100%;
        margin-bottom: 1rem;
        border: 1px solid var(--border-color);
        background-color: var(--background-color);
        color: var(--normal-text-color);
        &:focus {
          outline: none;
          border-color: var(--border-color-reverse);
        }
      }

      .add-new-category-button-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;

        button {
          background-color: var(--background-color);
          color: var(--header-text-color);
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
          width: 40%;
          cursor: pointer;

          &:hover {
            background-color: var(--background-color-reverse);
            color: var(--reverse-header-text-color);
          }
        }
      }
    }
  }
  .budget-categories-no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: var(--normal-text-color);
    font-size: 1.6rem;
    font-weight: bold;
  }
}
@media (max-width: 768px) {
  .budget-categories-component-c {
    padding: 1rem;
    .budget-categories-header {
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      .budget-categories-create-button {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    .budget-categories-content {
      .budget-categories-list {
        gap: 0.5rem;
        .category-item {
          width: 100%;
        }
      }
    }
  }
}
</style>

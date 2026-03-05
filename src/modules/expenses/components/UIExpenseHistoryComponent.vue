<template>
  <div class="expense-history-container">
    <div class="expense-header">
      <h2>{{ selectedLanguage === 'English' ? 'Expense History' : 'Harcama Geçmişi' }}</h2>
      <button class="add-expense-btn" @click="openAddExpenseModal">
        {{ selectedLanguage === 'English' ? 'Add Expense' : 'Harcama Ekle' }}
      </button>
    </div>

    <div class="expense-table-wrapper">
      <table class="expense-table" v-if="expenseHistory && expenseHistory.length > 0">
        <thead>
          <tr>
            <th>{{ selectedLanguage === 'English' ? 'Date' : 'Tarih' }}</th>
            <th>{{ selectedLanguage === 'English' ? 'Description' : 'Açıklama' }}</th>
            <th>{{ selectedLanguage === 'English' ? 'Amount' : 'Miktar' }}</th>
            <th>{{ selectedLanguage === 'English' ? 'Payment Method' : 'Ödeme Yöntemi' }}</th>
            <th>{{ selectedLanguage === 'English' ? 'Recurring' : 'Tekrarlayan' }}</th>
            <th>{{ selectedLanguage === 'English' ? 'Category' : 'Kategori' }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(expense, index) in expenseHistory" :key="index">
            <td>{{ formatDateYYYYMMDD(expense.created) }}</td>
            <td>{{ expense.description }}</td>
            <td class="amount-cell">-${{ expense.amount.toFixed(2) }}</td>
            <td>{{ expense.paymentMethod }}</td>
            <td>
              <span class="recurring-badge" :class="{ 'is-recurring': expense.isRecurring }">
                {{
                  expense.isRecurring
                    ? selectedLanguage === 'English'
                      ? 'Yes'
                      : 'Evet'
                    : selectedLanguage === 'English'
                      ? 'No'
                      : 'Hayır'
                }}
              </span>
            </td>
            <td>
              <span class="category-badge" :style="{ background: computeBackground(expense) }">{{
                translateCategoryName(expense.categoryName)
              }}</span>
            </td>
            <td>
              <div class="delete-icon" @click="handleDeleteExpense(expense.id)">
                <font-awesome-icon :icon="actionIcons.delete" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!expenseHistory || expenseHistory.length === 0" class="no-data">
        <div class="no-data-text">
          {{
            selectedLanguage === 'English'
              ? '🛒 No expense data available 🛒'
              : '🛒 Harcama verisi bulunmamaktadır 🛒'
          }}
        </div>
      </div>
    </div>

    <!-- Improved Pagination -->
    <div class="pagination" v-if="expenseHistory && expenseHistory.length > 0">
      <button :disabled="page === 1" @click="$emit('changePage', page - 1)" class="pagination-btn">
        <font-awesome-icon :icon="arrowIcons.left" class="arrow-left" />
      </button>

      <span
        v-for="pageNum in displayedPages"
        :key="pageNum"
        :class="['page-number', { active: pageNum === page }]"
        @click="$emit('changePage', pageNum)"
      >
        {{ pageNum }}
      </span>

      <span v-if="showEllipsis" class="ellipsis">...</span>

      <span
        v-if="showLastPage"
        :class="['page-number', { active: totalPages === page }]"
        @click="$emit('changePage', totalPages)"
      >
        {{ totalPages }}
      </span>

      <button
        :disabled="page === totalPages || totalPages === 0"
        @click="$emit('changePage', page + 1)"
        class="pagination-btn"
      >
        <font-awesome-icon :icon="arrowIcons.right" class="arrow-right" />
      </button>
    </div>

    <!-- Add Expense Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>{{ selectedLanguage === 'English' ? 'Add New Expense' : 'Yeni Harcama Ekle' }}</h3>
        <form @submit.prevent="addExpense">
          <div class="form-group">
            <label for="category">{{
              selectedLanguage === 'English' ? 'Category' : 'Kategori'
            }}</label>
            <select id="category" v-model="newExpense.categoryId" required class="category-select">
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
          </div>
          <div class="form-group">
            <label for="description">{{
              selectedLanguage === 'English' ? 'Description' : 'Açıklama'
            }}</label>
            <input type="text" id="description" v-model="newExpense.description" required />
          </div>
          <div class="form-group">
            <label for="amount">{{ selectedLanguage === 'English' ? 'Amount' : 'Miktar' }}</label>
            <input type="number" id="amount" v-model="newExpense.amount" required />
          </div>
          <div class="form-group">
            <label for="paymentMethod">{{
              selectedLanguage === 'English' ? 'Payment Method' : 'Ödeme Yöntemi'
            }}</label>
            <input
              type="text"
              id="paymentMethod"
              v-model="newExpense.paymentMethod"
              required
              placeholder="Add your payment method"
            />
          </div>
          <div class="form-group-checkbox">
            <label for="isRecurring" class="checkbox-label">
              <input
                type="checkbox"
                class="checkbox-is-recurring"
                v-model="newExpense.isRecurring"
              />
              <div class="checkbox-is-recurring-text">
                {{ selectedLanguage === 'English' ? 'Is Recurring' : 'Tekrarlayan mı?' }}
              </div>
            </label>
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeModal">
              {{ selectedLanguage === 'English' ? 'Cancel' : 'İptal' }}
            </button>
            <button type="submit" class="submit-btn">
              {{ selectedLanguage === 'English' ? 'Save' : 'Kaydet' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { RecentExpenseHistory } from '@/interfaces/RecentExpenseHistory'
import { arrowIcons, actionIcons } from '@/icons/fontawesome-icons'

const CATEGORY_TRANSLATIONS = {
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
  name: 'UIExpenseHistoryComponent',

  props: {
    expenseHistory: {
      type: Array as () => {
        id: number
        description: string
        amount: number
        paymentMethod: string
        isRecurring: boolean
        categoryId: number
        created: string
        categoryName: string
      }[],
      required: true,
    },
    selectedLanguage: {
      type: String,
      default: 'English',
    },
    page: {
      type: Number,
      default: 1,
    },
    totalItems: {
      type: Number,
      default: null,
    },

    totalPages: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      showModal: false,
      newExpense: {
        description: '',
        amount: 0,
        paymentMethod: '',
        isRecurring: false,
        categoryId: 0,
      },
      selectedExpense: null as RecentExpenseHistory | null,
      errorMessage: '',
      arrowIcons,
      actionIcons,
    }
  },
  computed: {
    displayedPages() {
      // Display up to 5 page numbers around the current page
      const maxVisiblePages = 5
      const halfVisible = Math.floor(maxVisiblePages / 2)

      let startPage = Math.max(1, this.page - halfVisible)
      const endPage = Math.min(startPage + maxVisiblePages - 1, this.totalPages)

      // Adjust start page if we're near the end
      if (this.totalPages - endPage < halfVisible) {
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
        this.displayedPages[this.displayedPages.length - 1] < this.totalPages - 1
      )
    },
    showLastPage() {
      return (
        this.displayedPages.length > 0 &&
        this.displayedPages[this.displayedPages.length - 1] < this.totalPages
      )
    },
  },
  methods: {
    formatDateYYYYMMDD(dateString: string): string {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}.${month}.${day}`
    },

    translateCategoryName(category: string): string {
      if (this.selectedLanguage === 'English') {
        for (const [englishName, turkishName] of Object.entries(CATEGORY_TRANSLATIONS)) {
          if (turkishName === category) {
            return englishName
          }
        }
        return category
      } else {
        return CATEGORY_TRANSLATIONS[category as keyof typeof CATEGORY_TRANSLATIONS] || category
      }
    },

    computeBackground(expense: RecentExpenseHistory): string {
      const category = expense.categoryId
      const categoryColors: Record<string, string> = {
        1: 'var(--category-food-color)',
        2: 'var(--category-entertainment-color)',
        3: 'var(--category-education-color)',
        4: 'var(--category-shopping-color)',
        5: 'var(--category-housing-color)',
        6: 'var(--category-transport-color)',
        7: 'var(--category-healthcare-color)',
        8: 'var(--category-other-color)',
      }
      return categoryColors[category] || '#CCCCCC'
    },

    addExpense() {
      this.errorMessage = ''

      if (!this.newExpense.categoryId) {
        this.errorMessage =
          this.selectedLanguage === 'English'
            ? 'Please enter a category'
            : 'Lütfen bir kategori girin'
        return
      }

      if (!this.newExpense.description) {
        this.errorMessage =
          this.selectedLanguage === 'English'
            ? 'Please enter a description'
            : 'Lütfen bir açıklama girin'
        return
      }

      if (!this.newExpense.amount) {
        this.errorMessage =
          this.selectedLanguage === 'English' ? 'Please enter an amount' : 'Lütfen bir miktar girin'
        return
      }

      if (!this.newExpense.paymentMethod) {
        this.errorMessage =
          this.selectedLanguage === 'English'
            ? 'Please select a payment method'
            : 'Lütfen bir ödeme yöntemi seçin'
        return
      }

      const amount = this.newExpense.amount
      if (isNaN(amount) || amount <= 0) {
        this.errorMessage =
          this.selectedLanguage === 'English'
            ? 'Please enter a valid positive amount'
            : 'Lütfen geçerli bir pozitif miktar girin'
        return
      }

      this.$emit('addExpense', this.newExpense)

      this.closeModal()
    },

    handleDeleteExpense(expenseId: number) {
      this.$emit('deleteExpense', expenseId)
    },

    closeModal() {
      this.showModal = false
      this.errorMessage = ''
    },

    openAddExpenseModal() {
      this.newExpense = {
        description: '',
        amount: 0,
        paymentMethod: '',
        isRecurring: false,
        categoryId: 0,
      }
      this.errorMessage = ''
      this.showModal = true
    },
  },
}
</script>

<style scoped lang="scss">
.expense-history-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 80%;
  background-color: var(--background-color-soft);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  padding: 1.5rem;

  .expense-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: var(--header-text-color);
    }

    .add-expense-btn {
      background-color: var(--background-color);
      border: none;
      border-radius: 5px;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      cursor: pointer;
      color: var(--header-text-color);

      &:hover {
        background-color: var(--background-color-reverse);
        color: var(--reverse-header-text-color);
        transition: background-color 0.2s;
      }
    }
  }

  .expense-table-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    overflow: auto;

    .expense-table {
      width: 100%;
      border-collapse: collapse;

      th {
        text-align: left;
        padding: 0.5rem;
        border-bottom: 1px solid var(--border-color);
        color: var(--normal-text-color);
        font-size: 0.9rem;
        font-weight: 500;
        position: sticky;
        top: 0;
        background-color: var(--background-color-soft);
        z-index: 10;
      }

      td {
        padding: 0.8rem;
        border-bottom: 1px solid var(--border-color-light);
        color: var(--normal-text-color);

        &:last-child {
          text-align: right;
        }
      }

      tr:last-child td {
        border-bottom: none;
      }

      .category-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.8rem;
        color: white;
      }

      .recurring-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        width: 100%;
        background-color: #e0e0e0;
        color: #666;

        &.is-recurring {
          background-color: #2ecc71;
          color: white;
        }
      }

      .amount-cell {
        color: #ff6b6b;
        font-weight: 600;
      }

      .delete-icon {
        cursor: pointer;
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: invert(0.5);
          transition: filter 0.2s;

          &:hover {
            scale: 1.1;
            transition: scale 0.2s;
          }
        }
      }
    }

    .no-data {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      width: 100%;
      color: var(--normal-text-color);
      border-radius: var(--border-radius);
      margin: 1rem 0;

      .no-data-text {
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--normal-text-color);
        font-size: 1.2rem;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px 0;
    gap: 1rem;
    margin-top: 1rem;

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
      color: var(--normal-text-color);

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

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: var(--background-color);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

    h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: var(--header-text-color);
    }

    .form-group-checkbox {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      width: 100%;

      .checkbox-label {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        color: var(--normal-text-color);
        font-size: 0.9rem;

        .checkbox-is-recurring {
          margin-right: 0.5rem;
          height: 30px;
          width: auto;
          cursor: pointer;
        }
      }

      .checkbox-is-recurring-text {
        color: var(--normal-text-color);
      }
    }

    .form-group {
      margin-bottom: 1rem;

      .category-select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        background-color: var(--background-color-soft);
        color: var(--normal-text-color);
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--header-text-color);
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        background-color: var(--background-color-soft);
        color: var(--normal-text-color);
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;

      button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-weight: 500;
      }

      .cancel-btn {
        background-color: var(--background-color-soft);
        color: var(--normal-text-color);

        &:hover {
          background-color: var(--background-color-reverse);
          color: var(--reverse-header-text-color);
          transition: background-color 0.2s;
        }
      }

      .submit-btn {
        background-color: var(--primary-green-color);
        color: white;

        &:hover {
          opacity: 0.9;
        }
      }
    }
    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      text-align: center;
      padding: 0.5rem;
      background-color: rgba(231, 76, 60, 0.1);
      border-radius: var(--border-radius);
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
  }
}

@media (max-width: 768px) {
  .expense-history-container {
    padding: 1rem;
    height: auto;

    .expense-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;

      h2 {
        font-size: 1.25rem;
      }

      .add-expense-btn {
        width: 100%;
        text-align: center;
      }
    }

    .expense-table-wrapper {
      overflow-x: auto;

      .expense-table {
        font-size: 0.85rem;

        th,
        td {
          padding: 0.75rem 0.5rem;
        }

        .category-badge,
        .recurring-badge {
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
        }

        .delete-icon {
          width: 16px;
          height: 16px;
        }
      }

      .no-data {
        height: 150px;

        .no-data-text {
          font-size: 1rem;
        }
      }
    }

    .pagination {
      padding: 10px 0;
      gap: 0.5rem;
      flex-wrap: wrap;

      .pagination-btn,
      .page-number {
        width: 35px;
        height: 35px;
      }

      .arrow-left,
      .arrow-right {
        width: 14px;
        height: 14px;
      }

      .ellipsis {
        padding: 0 4px;
      }
    }

    .modal-content {
      width: 90%;
      border-radius: 1rem;
      padding: 1rem;

      h3 {
        font-size: 1.25rem;
      }

      .form-group {
        .category-select,
        input {
          padding: 0.6rem;
        }

        label {
          font-size: 0.9rem;
        }
      }

      .form-actions {
        flex-direction: column;
        align-items: stretch;

        button {
          width: 100%;
        }
      }

      .error-message {
        font-size: 0.8rem;
      }
    }
  }
}
</style>

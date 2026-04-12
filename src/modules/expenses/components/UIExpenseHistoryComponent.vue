<template>
  <div class="expense-sources-container">
    <header class="header">
      <div v-if="loading" class="skeleton-box header__title-skeleton"></div>
      <h1 v-else class="header__title">
        {{ t('expenseHistory') }}
      </h1>
      <div class="header__toolbar">
        <div class="toolbar-actions">
          <div v-if="loading" class="skeleton-box btn-skeleton"></div>
          <button v-else type="button" class="btn btn--primary" @click="showAddModal">
            {{ t('addExpense') }}
          </button>
        </div>
        <div class="toolbar-filters">
          <template v-if="loading">
            <div class="skeleton-box filter-skeleton"></div>
            <div class="skeleton-box filter-skeleton date-skeleton"></div>
          </template>
          <template v-else>
            <div class="filter-group">
              <select
                :value="categoryId ?? ''"
                class="filter-select"
                :aria-label="t('category')"
                @change="onCategoryFilterChange"
              >
                <option value="">{{ t('allCategories') }}</option>
                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="filter-group date-range-wrap">
              <Datepicker
                :value="dateRangeModel"
                range
                :placeholder="t('dateRange')"
                :disabled-date="disableFutureDates"
                :shortcuts="dateRangeShortcuts"
                popup-class="expense-datepicker-popup"
                @update:value="onDateRangeChange"
              />
            </div>
          </template>
        </div>
      </div>
    </header>

    <div class="table-wrap" :class="{ 'table-wrap--empty': !loading && isTableEmpty }">
      <!-- Loading / Skeleton State -->
      <div v-if="loading" class="table" role="table">
        <div class="table-header" role="row">
          <div class="col col-name" role="columnheader"><div class="skeleton-box header-skeleton"></div></div>
          <div class="col col-type" role="columnheader"><div class="skeleton-box header-skeleton"></div></div>
          <div class="col col-amount" role="columnheader"><div class="skeleton-box header-skeleton"></div></div>
          <div class="col col-category" role="columnheader"><div class="skeleton-box header-skeleton"></div></div>
          <div class="col col-actions" role="columnheader"><div class="skeleton-box header-skeleton"></div></div>
        </div>
        <div v-for="i in 5" :key="i" class="table-row skeleton-row" role="row">
          <div class="col col-name"><div class="skeleton-box row-skeleton"></div></div>
          <div class="col col-type"><div class="skeleton-box row-skeleton"></div></div>
          <div class="col col-amount"><div class="skeleton-box row-skeleton"></div></div>
          <div class="col col-category"><div class="skeleton-box row-skeleton"></div></div>
          <div class="col col-actions"><div class="skeleton-box row-skeleton"></div></div>
        </div>
      </div>

      <!-- Content State -->
      <div v-else-if="expenseHistory && expenseHistory.length > 0" class="table" role="table">
        <div class="table-header" role="row">
          <div class="col col-name" role="columnheader">{{ t('name') }}</div>
          <div class="col col-type" role="columnheader">{{ t('type') }}</div>
          <div class="col col-amount" role="columnheader">{{ t('amount') }}</div>
          <div class="col col-category" role="columnheader">{{ t('category') }}</div>
          <div class="col col-actions" role="columnheader">{{ t('actions') }}</div>
        </div>
        <div v-for="(expense, index) in expenseHistory" :key="expense.id ?? index" class="table-row expense-card" role="row">
          <div class="col col-name">
            <span class="col-mobile-label">{{ t('name') }}</span>
            <div class="source-name">{{ expense.description }}</div>
          </div>
          <div class="col col-type">
            <span class="col-mobile-label">{{ t('type') }}</span>
            <span class="col-value">{{ typeLabel(expense) }} – {{ expense.paymentMethod }}</span>
          </div>
          <div class="col col-amount">
            <span class="col-mobile-label">{{ t('amount') }}</span>
            <span class="col-value">{{ formatCurrency(expense.amount) }}</span>
          </div>
          <div class="col col-category">
            <span class="col-mobile-label">{{ t('category') }}</span>
            <span class="category-badge">{{ expense.categoryName || resolveCategoryName(expense.categoryId) }}</span>
          </div>
          <div class="col col-actions">
            <button
              type="button"
              class="row-action-btn"
              @click="openEditModal(expense)"
              :aria-label="t('editExpense')"
            >
              <font-awesome-icon :icon="actionIcons.edit" class="action-icon" />
            </button>
            <button
              type="button"
              class="row-action-btn"
              @click="handleDeleteExpense(expense.id)"
              :aria-label="t('deleteExpense')"
            >
              <font-awesome-icon :icon="actionIcons.delete" class="delete-icon" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && isTableEmpty" class="empty-state">
        <div class="empty-state__icon-wrap">
          <font-awesome-icon
            :icon="emptyStateIcons.transactions"
            class="empty-state__icon"
            aria-hidden="true"
          />
        </div>
        <h2 class="empty-state__heading">{{ t('noExpensesYet') }}</h2>
        <p class="empty-state__text">{{ t('noExpensesYetText') }}</p>
      </div>
    </div>

    <!-- Pagination Bar -->
    <div v-if="loading" class="pagination-bar">
      <div class="pagination-results">
        <div class="skeleton-box results-skeleton"></div>
      </div>
      <div class="pagination-nav">
        <div class="skeleton-box nav-skeleton"></div>
      </div>
    </div>
    <div v-else-if="expenseHistory && expenseHistory.length > 0 && totalPages > 0" class="pagination-bar">
      <div class="pagination-results">
        <font-awesome-icon
          :icon="paginationIcons.results"
          class="pagination-results-icon"
          aria-hidden="true"
        />
        <select
          :value="pageSize"
          class="page-size-select"
          :aria-label="t('resultsPerPage')"
          @change="onPageSizeChange"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <span class="pagination-results-label">
          {{ selectedLanguage === 'English' ? 'of' : '/' }}
          <span class="pagination-total">{{ totalCount }}</span>
          {{ selectedLanguage === 'English' ? 'results' : 'sonuç' }}
        </span>
      </div>
      <div class="pagination-nav">
        <button
          type="button"
          :disabled="pageNumber === 1"
          class="pagination-btn"
          aria-label="Previous page"
          @click="changePage(pageNumber - 1)"
        >
          <font-awesome-icon :icon="arrowIcons.left" class="arrow-icon" />
        </button>
        <template v-for="page in displayedPages" :key="page">
          <button
            type="button"
            :class="['pagination-num', { active: page === pageNumber }]"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </template>
        <span v-if="showEllipsis" class="pagination-ellipsis">—</span>
        <button
          v-if="showLastPage"
          type="button"
          :class="['pagination-num', { active: totalPages === pageNumber }]"
          @click="changePage(totalPages)"
        >
          {{ totalPages }}
        </button>
        <button
          type="button"
          :disabled="pageNumber === totalPages || totalPages === 0"
          class="pagination-btn"
          aria-label="Next page"
          @click="changePage(pageNumber + 1)"
        >
          <font-awesome-icon :icon="arrowIcons.right" class="arrow-icon" />
        </button>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="isAddModalVisible" class="modal-overlay" @click.self="hideAddModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            {{ editingExpenseId != null ? t('editExpense') : t('addExpenseModule') }}
          </h3>
          <button type="button" class="close-btn" @click="hideAddModal" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="expense-description">{{ t('name') }}</label>
            <input
              id="expense-description"
              type="text"
              v-model="newExpense.description"
              :placeholder="t('enterDescription')"
              class="modal-input"
            />
          </div>
          <div class="form-group">
            <label for="expense-amount">{{ t('amount') }}</label>
            <div class="input-with-prefix">
              <span class="input-prefix">{{ currencySymbol }}</span>
              <input
                id="expense-amount"
                type="number"
                v-model="newExpense.amount"
                :placeholder="t('enterAmount')"
                class="modal-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="expense-method">{{ t('paymentMethod') }}</label>
            <input
              id="expense-method"
              type="text"
              v-model="newExpense.paymentMethod"
              :placeholder="t('paymentMethodPlaceholder')"
              class="modal-input"
            />
          </div>
          <div class="form-group">
            <label for="expense-date">{{ t('transactionDate') }}</label>
            <div class="datepicker-wrapper">
              <Datepicker
                v-model:value="newExpense.transactionDate"
                :placeholder="t('selectDate')"
              />
            </div>
          </div>
          <div class="form-group">
            <span class="form-group-label">{{ t('frequency') }}</span>
            <div class="frequency-segmented">
              <button
                type="button"
                :class="['frequency-option', { active: newExpense.isRecurring === true }]"
                @click="newExpense.isRecurring = true"
              >
                {{ t('periodic') }}
              </button>
              <button
                type="button"
                :class="['frequency-option', { active: newExpense.isRecurring === false }]"
                @click="newExpense.isRecurring = false"
              >
                {{ t('oneTime') }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label for="expense-category">{{ t('category') }}</label>
            <select
              id="expense-category"
              v-model="newExpense.categoryId"
              class="modal-input category-select"
            >
              <option :value="0">{{ t('noCategories') }}</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          <button type="button" class="add-btn" @click="submitExpense">
            {{ editingExpenseId != null ? t('save') : t('addExpense') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { expensesTexts } from '@/data/expensesTexts'
import {
  arrowIcons,
  actionIcons,
  emptyStateIcons,
  paginationIcons,
} from '@/icons/fontawesome-icons'
import type { Category } from '@/services/api/category/category.models'
import { useCurrency } from '@/composables/useCurrency'
import Datepicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'

type ExpenseItem = {
  id: number
  description: string
  amount: number
  paymentMethod: string
  isRecurring: boolean
  categoryId: number
  categoryName?: string
  transactionDate?: string
  created?: string
}

export default {
  name: 'UIExpenseHistoryComponent',
  components: { Datepicker },
  props: {
    loading: { type: Boolean, default: false },
    expenseHistory: { type: Array as () => ExpenseItem[], required: true },
    hasMoreItems: { type: Boolean, required: true },
    selectedLanguage: { type: String, default: 'English' },
    pageNumber: { type: Number, required: true },
    pageSize: { type: Number, required: true },
    totalCount: { type: Number, required: true },
    totalPages: { type: Number, required: true },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    categoryId: { type: Number, default: null },
    categories: { type: Array as () => Category[], default: () => [] },
    getExpenseById: { type: Function, required: true },
  },
  setup() {
    const { formatCurrency, currencySymbol } = useCurrency()
    return { formatCurrency, currencySymbol }
  },
  data() {
    return {
      isAddModalVisible: false,
      errorMessage: '',
      newExpense: {
        description: '',
        amount: null as number | null,
        paymentMethod: '',
        isRecurring: false,
        categoryId: 0,
        transactionDate: '' as string | Date,
      },
      arrowIcons,
      actionIcons,
      emptyStateIcons,
      paginationIcons,
      pageSizeOptions: [5, 10, 25, 50, 100],
      editingExpenseId: null as number | null,
    }
  },
  computed: {
    dateRangeShortcuts(): Array<{ text: string; onClick: () => [Date, Date] }> {
      const toDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const isEn = this.selectedLanguage === 'English'
      return [
        { text: isEn ? 'Today' : 'Bugün', onClick: () => { const d = toDate(new Date()); return [d, d] } },
        { text: isEn ? 'Yesterday' : 'Dün', onClick: () => { const d = toDate(new Date()); d.setDate(d.getDate() - 1); return [d, d] } },
        { text: isEn ? 'Last 7 days' : 'Son 7 gün', onClick: () => { const end = toDate(new Date()); const start = toDate(new Date()); start.setDate(start.getDate() - 7); return [start, end] } },
        { text: isEn ? 'Last 30 days' : 'Son 30 gün', onClick: () => { const end = toDate(new Date()); const start = toDate(new Date()); start.setDate(start.getDate() - 30); return [start, end] } },
        { text: isEn ? 'This month' : 'Bu ay', onClick: () => { const end = toDate(new Date()); const start = toDate(new Date()); start.setDate(1); return [start, end] } },
      ]
    },
    dateRangeModel(): [Date, Date] | null {
      if (!this.startDate || !this.endDate) return null
      const start = new Date(this.startDate)
      const end = new Date(this.endDate)
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return null
      return [start, end]
    },
    isTableEmpty(): boolean {
      return !this.expenseHistory || this.expenseHistory.length === 0
    },
    displayedPages(): number[] {
      const maxVisiblePages = 5
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let startPage = Math.max(1, this.pageNumber - halfVisible)
      const endPage = Math.min(startPage + maxVisiblePages - 1, this.totalPages)
      if (this.totalPages - endPage < halfVisible) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
      const pages = []
      for (let i = startPage; i <= endPage; i++) pages.push(i)
      return pages
    },
    showEllipsis(): boolean {
      return this.displayedPages.length > 0 && this.displayedPages[this.displayedPages.length - 1] < this.totalPages - 1
    },
    showLastPage(): boolean {
      return this.displayedPages.length > 0 && this.displayedPages[this.displayedPages.length - 1] < this.totalPages
    },
  },
  methods: {
    t(key: keyof typeof expensesTexts.English) {
      const texts = expensesTexts[this.selectedLanguage as 'English' | 'Turkish']
      return (texts as Record<string, string>)[key] ?? key
    },
    typeLabel(expense: ExpenseItem) {
      return expense.isRecurring ? this.t('periodic') : this.t('oneTime')
    },
    resolveCategoryName(categoryId: number): string {
      const cat = (this.categories as Category[]).find(c => c.id === categoryId)
      return cat?.name ?? ''
    },
    changePage(p: number) {
      if (p >= 1 && p <= this.totalPages) this.$emit('changePage', p)
    },
    onDateRangeChange(value: [Date, Date] | Date | null) {
      if (!value || !Array.isArray(value) || value.length < 2) {
        this.$emit('updateDateRange', null, null)
        return
      }
      const [start, end] = value
      const toYmd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      this.$emit('updateDateRange', toYmd(start), toYmd(end))
    },
    onCategoryFilterChange(event: Event) {
      const target = event.target as HTMLSelectElement
      const val = target.value
      this.$emit('updateCategory', val === '' ? null : Number(val))
    },
    onPageSizeChange(event: Event) {
      const target = event.target as HTMLSelectElement
      const size = parseInt(target.value, 10)
      if (!isNaN(size) && this.pageSizeOptions.includes(size)) this.$emit('updatePageSize', size)
    },
    disableFutureDates(date: Date): boolean {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return date.getTime() > today.getTime()
    },
    handleDeleteExpense(id: number) {
      this.$emit('deleteExpense', id)
    },
    showAddModal() {
      this.editingExpenseId = null
      this.resetNewExpense()
      this.isAddModalVisible = true
    },
    hideAddModal() {
      this.isAddModalVisible = false
      this.errorMessage = ''
      this.editingExpenseId = null
      this.resetNewExpense()
    },
    async openEditModal(expense: ExpenseItem) {
      try {
        const data = await this.getExpenseById(expense.id)
        this.editingExpenseId = data.id
        const txDate = data.transactionDate
        this.newExpense = {
          description: data.description,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          isRecurring: data.isRecurring,
          categoryId: data.categoryId,
          transactionDate: txDate ? new Date(txDate) : '',
        }
        this.isAddModalVisible = true
      } catch (e) {
        console.error('Failed to load expense for edit:', e)
      }
    },
    resetNewExpense() {
      this.newExpense = {
        description: '',
        amount: null,
        paymentMethod: '',
        isRecurring: false,
        categoryId: 0,
        transactionDate: '',
      }
    },
    submitExpense() {
      this.errorMessage = ''
      if (!this.newExpense.description?.trim()) {
        this.errorMessage = this.t('pleaseEnterDescription')
        return
      }
      const amount = this.newExpense.amount != null ? Number(this.newExpense.amount) : NaN
      if (isNaN(amount) || amount <= 0) {
        this.errorMessage = this.t('pleaseEnterValidAmount')
        return
      }
      if (!this.newExpense.paymentMethod?.trim()) {
        this.errorMessage = this.t('pleaseEnterPaymentMethod')
        return
      }
      const dateVal = this.newExpense.transactionDate
      if (!dateVal) {
        this.errorMessage = this.t('pleaseSelectDate')
        return
      }
      if (!this.newExpense.categoryId) {
        this.errorMessage = this.t('pleaseSelectCategory')
        return
      }
      const d = (dateVal as unknown) instanceof Date ? (dateVal as Date) : null
      const transactionDateStr = d ? d.toISOString() : (typeof dateVal === 'string' ? dateVal : '')
      const payload = {
        description: this.newExpense.description.trim(),
        amount,
        paymentMethod: this.newExpense.paymentMethod.trim(),
        isRecurring: this.newExpense.isRecurring,
        categoryId: this.newExpense.categoryId,
        transactionDate: transactionDateStr,
      }
      if (this.editingExpenseId != null) {
        this.$emit('updateExpense', this.editingExpenseId, payload)
      } else {
        this.$emit('addExpense', payload)
      }
      this.hideAddModal()
    },
  },
}
</script>

<style scoped lang="scss">
.expense-sources-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: 1.5rem 1.25rem;

  .header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    gap: 1rem;
  }

  .header__title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--header-text-color);
    flex-shrink: 0;
  }

  .header__title-skeleton {
    width: 15rem;
    height: 1.5rem;
    border-radius: 4px;
  }

  .header__toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: nowrap;
    flex-shrink: 0;
  }

  .toolbar-actions { display: flex; align-items: center; }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: opacity 0.15s ease;
    &:hover:not(:disabled) { opacity: var(--hover-opacity); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  .btn--primary { background-color: var(--primary-green-color); color: white; border-color: var(--primary-green-color); }

  .toolbar-filters {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-select {
    padding: 0.5rem 0.75rem;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    color: var(--header-text-color);
    font-size: 0.8125rem;
    min-height: auto;
    cursor: pointer;
    min-width: 10rem;
    appearance: auto;
  }

  .btn-skeleton {
    width: 100px;
    height: 2.25rem;
    border-radius: var(--border-radius);
  }

  .row-skeleton {
    width: 80%;
    height: 1rem;
    border-radius: 4px;
  }

  .filter-skeleton {
    width: 10rem;
    height: 2.25rem;
    border-radius: var(--border-radius);
    &.date-skeleton { width: 12rem; }
  }

  .results-skeleton {
    width: 120px;
    height: 1.25rem;
    border-radius: 4px;
  }

  .nav-skeleton {
    width: 180px;
    height: 1.75rem;
    border-radius: var(--border-radius);
  }

  .date-range-wrap {
    min-width: 12rem;
    :deep(.mx-datepicker) { width: 100%; cursor: pointer; }
    :deep(.mx-input) {
      padding: 0.5rem 0.75rem;
      border-radius: var(--border-radius);
      border: 1px solid var(--border-color);
      background-color: var(--background-color);
      color: var(--header-text-color);
      font-size: 0.8125rem;
      cursor: pointer;
      width: 100%;
      height: auto;
    }
  }

  .table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
    background-color: var(--background-color);
    padding-right: 0.75rem;
    &.table-wrap--empty { display: flex; align-items: center; justify-content: center; }
  }

  .table { width: 100%; display: flex; flex-direction: column; }

  .table-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 6rem minmax(7rem, 1fr) 5.5rem;
    gap: 1rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--border-color);
    font-weight: 700;
    font-size: 0.75rem;
    color: var(--normal-text-color);
    text-transform: uppercase;
    letter-spacing: 0.05em;

    .header-skeleton {
      width: 80%;
      height: 0.75rem;
      border-radius: 4px;
    }
  }

  .table-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 6rem minmax(7rem, 1fr) 5.5rem;
    gap: 1rem;
    padding: 1rem;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    &:last-child { border-bottom: none; }
  }

  .col { min-width: 0; }
  .col-mobile-label { display: none; }

  .source-name { font-weight: 600; color: var(--header-text-color); font-size: 0.9375rem; }
  .col-type { font-size: 0.875rem; color: var(--normal-text-color); }
  .col-amount { font-weight: 700; color: var(--primary-red-color); font-size: 0.9375rem; }
  .category-badge {
    display: inline-block;
    padding: 0.25rem 0.625rem;
    background: var(--background-color-soft);
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--normal-text-color);
  }

  .row-action-btn {
    width: 2rem; height: 2rem; border: none; background: transparent; cursor: pointer;
    color: var(--normal-text-color); border-radius: 6px; display: inline-flex; align-items: center; justify-content: center;
    &:hover { background-color: var(--background-color-soft); color: var(--primary-red-color); }
    .delete-icon, .action-icon { font-size: 0.75rem; }
  }

  .pagination-bar {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    padding: 1rem 0 0;
    margin-top: 0.5rem;
    border-top: 1px solid var(--border-color);

    .pagination-results { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--normal-text-color); }
    .pagination-results-icon { color: var(--header-text-color); font-size: 0.875rem; }
    .page-size-select { padding: 0.35rem 0.5rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--background-color); color: var(--header-text-color); font-size: 0.75rem; cursor: pointer; }
    .pagination-nav { display: flex; align-items: center; gap: 0.25rem; }
    .pagination-btn {
      display: inline-flex; align-items: center; justify-content: center; width: 1.75rem; height: 1.75rem;
      border: 1px solid var(--primary-green-color); border-radius: var(--border-radius);
      background-color: var(--primary-green-color); color: white; cursor: pointer;
      &:disabled { opacity: 0.4; cursor: not-allowed; }
      .arrow-icon { font-size: 0.65rem; }
    }
    .pagination-num {
      display: inline-flex; align-items: center; justify-content: center; min-width: 1.75rem; height: 1.75rem;
      padding: 0 0.4rem; border: 1px solid var(--border-color); border-radius: var(--border-radius);
      background-color: var(--background-color); color: var(--header-text-color); font-size: 0.75rem; font-weight: 500; cursor: pointer;
      &.active { background-color: var(--primary-green-color); border-color: var(--primary-green-color); color: white; }
    }
  }

  .empty-state {
    flex: 1; min-height: 16rem; display: flex; flex-direction: column;
    justify-content: center; align-items: center; width: 100%; text-align: center; padding: 3rem 2rem;
    .empty-state__icon-wrap { width: 5.5rem; height: 5.5rem; border-radius: var(--border-radius); background-color: rgba(192, 57, 43, 0.12); color: var(--primary-red-color); margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; }
    .empty-state__icon { font-size: 2.5rem; }
    .empty-state__heading { margin-bottom: 0.75rem; font-size: 1.375rem; font-weight: 700; color: var(--header-text-color); }
    .empty-state__text { font-size: 1rem; color: var(--normal-text-color); line-height: 1.5; max-width: 24rem; }
  }

  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
  .modal-content {
    background: var(--background-color); border-radius: var(--border-radius); width: 90%; max-width: 28rem; max-height: 90vh; display: flex; flex-direction: column;
    .modal-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; h3 { margin: 0; font-size: 1.25rem; color: var(--header-text-color); } .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--normal-text-color); line-height: 1; } }
    .modal-body { display: flex; flex-direction: column; padding: 1.25rem; gap: 1.25rem; overflow-y: auto; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; label, .form-group-label { font-size: 0.75rem; font-weight: 600; color: var(--normal-text-color); } }
    .modal-input { width: 100%; height: 2.75rem; padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); background: var(--background-color); color: var(--header-text-color); font-size: 0.9375rem; &:focus { outline: none; border-color: var(--primary-green-color); box-shadow: 0 0 0 2px rgba(92, 184, 92, 0.2); } }
    .input-with-prefix { display: flex; border: 1px solid var(--border-color); border-radius: var(--border-radius); overflow: hidden; .input-prefix { display: flex; align-items: center; padding: 0 1rem; color: var(--normal-text-color); border-right: 1px solid var(--border-color); } .modal-input { border: none; flex: 1; } }
    .datepicker-wrapper { width: 100%; :deep(.mx-input) { width: 100%; height: 2.75rem; border-radius: var(--border-radius); border: 1px solid var(--border-color); background: var(--background-color); color: var(--header-text-color); padding: 0.75rem 1rem; } }
    .frequency-segmented { display: flex; padding: 3px; border-radius: var(--border-radius); background: var(--background-color-soft); .frequency-option { flex: 1; padding: 0.5rem 1rem; border: none; border-radius: 6px; background: transparent; color: var(--normal-text-color); font-size: 0.875rem; font-weight: 500; cursor: pointer; &.active { background: var(--primary-green-color); color: white; } } }
    .add-btn { width: 100%; padding: 0.75rem 1rem; border: none; border-radius: var(--border-radius); background: var(--primary-green-color); color: white; font-weight: 600; font-size: 0.9375rem; cursor: pointer; }
    .error-message { color: #dc3545; font-size: 0.85rem; text-align: center; background: rgba(220,53,69,0.1); padding: 0.5rem; border-radius: var(--border-radius); }
  }
}

@media (max-width: 1024px) {
  .expense-sources-container { flex: 1 1 auto; }
  .table-wrap { min-height: 12rem; }
}

@media (max-width: 768px) {
  .expense-sources-container {
    padding: 1rem;
    .header { flex-direction: column; align-items: stretch; gap: 0.75rem; }
    .header__title { display: none; }
    .header__toolbar { flex-direction: column; align-items: stretch; gap: 0.75rem; }
    .toolbar-actions { display: grid; grid-template-columns: 1fr; }
    .btn { min-height: 2.75rem; font-size: 0.875rem; }
    .toolbar-filters { flex-direction: column; align-items: stretch; gap: 0.75rem; }
    .filter-select, .date-range-wrap { width: 100%; min-width: 0; }
    .date-range-wrap :deep(.mx-input) { min-height: 2.75rem; font-size: 1rem; }
    .table-header { display: none; }
    .table-row.expense-card {
      display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem; padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); margin-bottom: 0.75rem;
      .col { display: flex; align-items: flex-start; gap: 0.5rem; width: 100%; }
      .col-mobile-label { display: inline; min-width: 5rem; font-size: 0.75rem; font-weight: 600; color: var(--normal-text-color); }
      .col-actions { margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); }
    }
  }
}
</style>

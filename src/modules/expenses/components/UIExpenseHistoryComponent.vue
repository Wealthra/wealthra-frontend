<template>
  <div class="expense-sources-container">
    <header class="header">
      <h1 class="header__title">
        {{ t('expenseHistory') }}
      </h1>
      <div class="header__toolbar">
        <div class="toolbar-actions">
          <button type="button" class="btn btn--primary" @click="showAddModal">
            {{ t('addExpense') }}
          </button>
          <button
            type="button"
            class="btn btn--secondary"
            :aria-label="t('manageCategories')"
            @click="openManageCategoriesModal"
          >
            {{ t('manageCategories') }}
          </button>
        </div>
        <div class="toolbar-filters">
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
        </div>
      </div>
    </header>

    <div class="table-wrap" :class="{ 'table-wrap--empty': isTableEmpty }">
      <div v-if="expenseHistory && expenseHistory.length > 0" class="table" role="table">
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
            <span class="col-value">${{ expense.amount.toFixed(2) }}</span>
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

      <div v-if="isTableEmpty" class="empty-state">
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

    <div v-if="expenseHistory && expenseHistory.length > 0 && totalPages > 0" class="pagination-bar">
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
          {{ t('ofResults') }}
          <span class="pagination-total">{{ totalCount }}</span>
          {{ t('results') }}
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
              :aria-invalid="!!(errorMessage && errorMessage.toLowerCase().includes('açıklama')) || !!(errorMessage && errorMessage.toLowerCase().includes('description'))"
            />
          </div>
          <div class="form-group">
            <label for="expense-amount">{{ t('amount') }}</label>
            <div class="input-with-prefix">
              <span class="input-prefix">$</span>
              <input
                id="expense-amount"
                type="number"
                v-model="newExpense.amount"
                :placeholder="t('enterAmount')"
                class="modal-input"
                min="0"
                step="0.01"
                :aria-invalid="!!(errorMessage && (errorMessage.toLowerCase().includes('amount') || errorMessage.toLowerCase().includes('miktar')))"
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
              :aria-invalid="!!(errorMessage && (errorMessage.toLowerCase().includes('payment') || errorMessage.toLowerCase().includes('ödeme')))"
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
              :aria-invalid="!!(errorMessage && (errorMessage.toLowerCase().includes('category') || errorMessage.toLowerCase().includes('kategori')))"
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

    <div v-if="showManageCategoriesModal" class="modal-overlay" @click.self="closeManageCategoriesModal">
      <div class="modal-content manage-categories-modal">
        <div class="modal-header">
          <h3>{{ t('manageCategories') }}</h3>
          <button type="button" class="close-btn" @click="closeManageCategoriesModal" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="manage-categories-actions">
            <button
              v-if="!isAddingCategory"
              type="button"
              class="add-category-trigger-btn"
              @click="startAddCategory"
            >
              {{ t('addCategory') }}
            </button>
            <div v-else class="manage-category-form">
              <input
                v-model="newCategoryName"
                type="text"
                class="modal-input"
                :placeholder="t('categoryName')"
                @keydown.enter="saveNewCategory"
              />
              <div class="manage-form-buttons">
                <button type="button" class="manage-save-btn" @click="saveNewCategory">{{ t('saveCategory') }}</button>
                <button type="button" class="manage-cancel-btn" @click="cancelAddCategory">{{ t('cancel') }}</button>
              </div>
            </div>
          </div>
          <ul class="manage-categories-list">
            <li
              v-for="cat in categories"
              :key="cat.id"
              class="manage-category-row"
            >
              <template v-if="editingCategoryId === cat.id">
                <input
                  v-model="editingCategoryName"
                  type="text"
                  class="modal-input manage-edit-input"
                  :placeholder="t('categoryName')"
                  @keydown.enter="saveEditCategory"
                />
                <div class="manage-row-actions">
                  <button type="button" class="manage-save-btn" @click="saveEditCategory">{{ t('save') }}</button>
                  <button type="button" class="manage-cancel-btn" @click="cancelEditCategory">{{ t('cancel') }}</button>
                </div>
              </template>
              <template v-else>
                <span class="manage-category-name">{{ cat.name }}</span>
                <div class="manage-row-actions">
                  <button
                    type="button"
                    class="row-action-btn"
                    :aria-label="t('editCategory')"
                    @click="startEditCategory(cat)"
                  >
                    <font-awesome-icon :icon="actionIcons.edit" class="action-icon" />
                  </button>
                  <button
                    type="button"
                    class="row-action-btn"
                    :aria-label="t('deleteCategory')"
                    @click="confirmDeleteCategory(cat)"
                  >
                    <font-awesome-icon :icon="actionIcons.delete" class="delete-icon" />
                  </button>
                </div>
              </template>
            </li>
          </ul>
          <p v-if="(categories && categories.length === 0) && !isAddingCategory" class="manage-empty">{{ t('noCategories') }}</p>
          <div v-if="manageError" class="error-message">{{ manageError }}</div>
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
import { categoryService } from '@/services/api/category/category.service'
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
    expenseHistory: {
      type: Array as () => ExpenseItem[],
      required: true,
    },
    hasMoreItems: { type: Boolean, required: true },
    selectedLanguage: { type: String, default: 'English' },
    pageNumber: { type: Number, required: true },
    pageSize: { type: Number, required: true },
    totalCount: { type: Number, required: true },
    totalPages: { type: Number, required: true },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    categoryId: { type: Number, default: null },
    categories: {
      type: Array as () => Category[],
      default: () => [],
    },
    getExpenseById: { type: Function, required: true },
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
      showManageCategoriesModal: false,
      editingCategoryId: null as number | null,
      editingCategoryName: '',
      newCategoryName: '',
      manageError: '',
      isAddingCategory: false,
    }
  },
  computed: {
    dateRangeShortcuts(): Array<{ text: string; onClick: () => [Date, Date] }> {
      const toDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const isEn = this.selectedLanguage === 'English'
      return [
        { text: isEn ? 'Today' : 'Bugün', onClick: () => { const d = toDate(new Date()); return [d, d] } },
        { text: isEn ? 'Yesterday' : 'Dün', onClick: () => { const d = toDate(new Date()); d.setDate(d.getDate() - 1); return [d, d] } },
        { text: isEn ? 'This week' : 'Bu hafta', onClick: () => { const end = toDate(new Date()); const start = toDate(new Date()); const day = start.getDay(); const diff = start.getDate() - day + (day === 0 ? -6 : 1); start.setDate(diff); return [start, end] } },
        { text: isEn ? 'Last week' : 'Geçen hafta', onClick: () => { const end = toDate(new Date()); const day = end.getDay(); const diff = end.getDate() - day + (day === 0 ? -6 : 1); end.setDate(diff - 1); const start = toDate(new Date(end)); start.setDate(start.getDate() - 6); return [start, end] } },
        { text: isEn ? 'Last 7 days' : 'Son 7 gün', onClick: () => { const end = toDate(new Date()); const start = toDate(new Date()); start.setDate(start.getDate() - 7); return [start, end] } },
        { text: isEn ? 'Last 30 days' : 'Son 30 gün', onClick: () => { const end = toDate(new Date()); const start = toDate(new Date()); start.setDate(start.getDate() - 30); return [start, end] } },
        { text: isEn ? 'This month' : 'Bu ay', onClick: () => { const end = toDate(new Date()); const start = toDate(new Date()); start.setDate(1); return [start, end] } },
        { text: isEn ? 'Last month' : 'Geçen ay', onClick: () => { const end = toDate(new Date()); end.setMonth(end.getMonth() - 1); end.setDate(0); const start = toDate(new Date(end)); start.setDate(1); return [start, end] } },
        { text: isEn ? 'This year' : 'Bu yıl', onClick: () => { const end = toDate(new Date()); const start = toDate(new Date()); start.setMonth(0); start.setDate(1); return [start, end] } },
        { text: isEn ? 'Last year' : 'Geçen yıl', onClick: () => { const end = toDate(new Date()); end.setFullYear(end.getFullYear() - 1); end.setMonth(11); end.setDate(31); const start = toDate(new Date(end)); start.setMonth(0); start.setDate(1); return [start, end] } },
        { text: isEn ? 'Last 90 days' : 'Son 90 gün', onClick: () => { const end = toDate(new Date()); const start = toDate(new Date()); start.setDate(start.getDate() - 90); return [start, end] } },
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
      const list = this.expenseHistory
      return !list || !Array.isArray(list) || list.length === 0
    },
    displayedPages(): number[] {
      const maxVisiblePages = 5
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let startPage = Math.max(1, this.pageNumber - halfVisible)
      const endPage = Math.min(startPage + maxVisiblePages - 1, this.totalPages)
      if (this.totalPages - endPage < halfVisible) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
      const pages: number[] = []
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
        const data = await (this.getExpenseById as (id: number) => Promise<{ id: number; description: string; amount: number; paymentMethod: string; isRecurring: boolean; categoryId: number; transactionDate: string }>)(expense.id)
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
      const transactionDateStr = d
        ? d.toISOString()
        : (typeof dateVal === 'string' ? dateVal : '')

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
    openManageCategoriesModal() {
      this.showManageCategoriesModal = true
      this.manageError = ''
      this.isAddingCategory = false
      this.editingCategoryId = null
      this.newCategoryName = ''
      this.editingCategoryName = ''
    },
    closeManageCategoriesModal() {
      this.showManageCategoriesModal = false
      this.manageError = ''
      this.isAddingCategory = false
      this.editingCategoryId = null
      this.newCategoryName = ''
      this.editingCategoryName = ''
    },
    startAddCategory() {
      this.isAddingCategory = true
      this.newCategoryName = ''
      this.manageError = ''
      this.editingCategoryId = null
    },
    cancelAddCategory() {
      this.isAddingCategory = false
      this.newCategoryName = ''
      this.manageError = ''
    },
    async saveNewCategory() {
      const name = this.newCategoryName?.trim()
      if (!name) {
        this.manageError = this.t('pleaseEnterCategoryName')
        return
      }
      this.manageError = ''
      try {
        await categoryService.apiCreateCategory(name)
        this.$emit('categoriesUpdated')
        this.isAddingCategory = false
        this.newCategoryName = ''
      } catch (err: unknown) {
        const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : ''
        this.manageError = message || this.t('dataError')
      }
    },
    startEditCategory(cat: Category) {
      this.editingCategoryId = cat.id
      this.editingCategoryName = cat.name
      this.manageError = ''
      this.isAddingCategory = false
    },
    cancelEditCategory() {
      this.editingCategoryId = null
      this.editingCategoryName = ''
      this.manageError = ''
    },
    async saveEditCategory() {
      const name = this.editingCategoryName?.trim()
      if (!name || this.editingCategoryId == null) {
        this.manageError = this.t('pleaseEnterCategoryName')
        return
      }
      this.manageError = ''
      try {
        await categoryService.apiUpdateCategory(this.editingCategoryId, name)
        this.$emit('categoriesUpdated')
        this.editingCategoryId = null
        this.editingCategoryName = ''
      } catch (err: unknown) {
        const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : ''
        this.manageError = message || this.t('dataError')
      }
    },
    async confirmDeleteCategory(cat: Category) {
      if (!window.confirm(this.t('confirmDeleteCategory'))) return
      this.manageError = ''
      try {
        await categoryService.apiDeleteCategory(cat.id)
        this.$emit('categoriesUpdated')
      } catch (err: unknown) {
        const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : ''
        this.manageError = message || this.t('categoryInUseCannotDelete')
      }
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
    margin-bottom: 1.25rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: nowrap;
  }

  .header__title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--header-text-color);
    line-height: 1.3;
    flex-shrink: 0;
  }

  .header__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    min-width: 0;
  }

  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .toolbar-filters {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .btn {
    padding: 0.4rem 0.75rem;
    border-radius: var(--border-radius);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    border: 1px solid transparent;
    transition: opacity 0.15s ease, background-color 0.15s ease;
    &:hover {
      opacity: var(--hover-opacity, 0.9);
    }
  }

  .btn--primary {
    background-color: var(--primary-green-color);
    color: white;
    border-color: var(--primary-green-color);
  }

  .btn--secondary {
    background-color: var(--background-color);
    color: var(--header-text-color);
    border-color: var(--border-color);
  }

  .filter-group {
    min-width: 0;
  }

  .filter-select {
    padding: 0.4rem 2rem 0.4rem 0.75rem;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    color: var(--header-text-color);
    font-size: 0.8125rem;
    cursor: pointer;
    min-width: 10rem;
    appearance: auto;
  }

  .date-range-wrap {
    :deep(.mx-datepicker) {
      width: auto;
      min-width: 14rem;
      cursor: pointer;
    }
    :deep(.mx-input) {
      padding: 0.4rem 0.5rem;
      border-radius: var(--border-radius);
      border: 1px solid var(--border-color);
      background-color: var(--background-color);
      color: var(--header-text-color);
      font-size: 0.8125rem;
      cursor: pointer;
      width: 100%;
    }
  }

  .table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    background-color: var(--background-color);
    padding-right: 0.75rem; /* space so vertical scrollbar doesn't cover Actions column */
    &.table-wrap--empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .table {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  /* Balanced columns: Description & Type share space, Amount/Category/Actions fixed width */
  .table-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 6rem minmax(7rem, 1fr) 5.5rem;
    gap: 1rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--border-color);
    font-weight: 600;
    font-size: 0.75rem;
    color: var(--normal-text-color);

    .col {
      text-align: left;
    }
  }

  .table-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 6rem minmax(7rem, 1fr) 5.5rem;
    gap: 1rem;
    padding: 0.7rem 1rem;
    align-items: center;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }
  }

  .col {
    min-width: 0;
  }

  .col-mobile-label {
    display: none;
  }

  .col-name .source-name {
    font-weight: 600;
    color: var(--header-text-color);
    font-size: 0.8125rem;
  }

  .col-type {
    font-size: 0.75rem;
    color: var(--normal-text-color);
  }

  .col-amount {
    font-weight: 600;
    color: var(--primary-red-color, #c0392b);
    font-size: 0.8125rem;
    text-align: left;
  }

  .col-category {
    text-align: left;
    .category-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: var(--border-radius);
      font-size: 0.75rem;
      background-color: var(--background-color-soft);
      color: var(--normal-text-color);
    }
  }

  .table-header .col-category {
    text-align: left;
  }

  .table-header .col-actions {
    justify-content: flex-start;
  }

  .col-actions {
    display: flex;
    justify-content: flex-start;
  }

  .row-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--normal-text-color);
    cursor: pointer;
    &:hover {
      background-color: var(--background-color-soft);
      color: var(--primary-red-color);
    }
    .delete-icon,
    .action-icon {
      font-size: 0.75rem;
    }
  }

  .empty-state {
    flex: 1;
    min-height: 16rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    text-align: center;
    padding: 3rem 2rem;
  }

  .empty-state__icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 5.5rem;
    height: 5.5rem;
    border-radius: var(--border-radius);
    background-color: rgba(192, 57, 43, 0.12);
    color: var(--primary-red-color, #c0392b);
    margin-bottom: 1.5rem;
  }

  .empty-state__icon {
    font-size: 2.5rem;
  }

  .empty-state__heading {
    margin: 0 0 0.75rem;
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--header-text-color);
  }

  .empty-state__text {
    margin: 0;
    font-size: 1rem;
    font-weight: 400;
    color: var(--normal-text-color);
    max-width: 24rem;
    line-height: 1.5;
  }

  .pagination-bar {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem 0 0;
    margin-top: 0.5rem;
    border-top: 1px solid var(--border-color);
  }

  .pagination-results {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--normal-text-color);
    .pagination-results-icon {
      color: var(--header-text-color);
      font-size: 0.875rem;
      flex-shrink: 0;
    }
    .page-size-select {
      padding: 0.35rem 0.5rem;
      border-radius: var(--border-radius);
      border: 1px solid var(--border-color);
      background-color: var(--background-color);
      color: var(--header-text-color);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
    }
    .pagination-results-label {
      display: inline;
    }
    .pagination-total {
      font-weight: 600;
      color: var(--header-text-color);
    }
  }

  .pagination-nav {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .pagination-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border: 1px solid var(--primary-green-color);
    border-radius: var(--border-radius);
    background-color: var(--primary-green-color);
    color: white;
    cursor: pointer;
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    &:hover:not(:disabled) {
      opacity: var(--hover-opacity);
    }
    .arrow-icon {
      font-size: 0.65rem;
    }
  }

  .pagination-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.75rem;
    height: 1.75rem;
    padding: 0 0.4rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--background-color);
    color: var(--header-text-color);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    &.active {
      background-color: var(--primary-green-color);
      border-color: var(--primary-green-color);
      color: white;
    }
    &:hover:not(.active) {
      background-color: var(--background-color-soft);
    }
  }

  .pagination-ellipsis {
    padding: 0 0.25rem;
    font-size: 0.75rem;
    color: var(--normal-text-color);
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
    width: 90%;
    max-width: 28rem;
    max-height: 90vh;
    display: flex;
    flex-direction: column;

    .modal-header {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
      h3 {
        margin: 0;
        font-size: 1.25rem;
        color: var(--header-text-color);
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--normal-text-color);
        padding: 0.25rem;
        line-height: 1;
        &:hover {
          opacity: 0.8;
        }
      }
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      padding: 1.25rem;
      gap: 1.25rem;
      overflow-y: auto;
      max-height: 85vh;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      label,
      .form-group-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--normal-text-color);
      }
    }

    .modal-input {
      width: 100%;
      height: 2.75rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      background-color: var(--background-color);
      color: var(--header-text-color);
      font-size: 0.9375rem;
      &:focus {
        outline: none;
        border-color: var(--primary-green-color);
        box-shadow: 0 0 0 2px rgba(92, 184, 92, 0.2);
      }
      &[aria-invalid='true'] {
        border-color: var(--notification-alert-color, #dc3545);
      }
    }

    .category-select {
      cursor: pointer;
      appearance: auto;
    }

    .input-with-prefix {
      display: flex;
      align-items: stretch;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      background-color: var(--background-color);
      overflow: hidden;
      .input-prefix {
        display: flex;
        align-items: center;
        padding: 0 1rem;
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--normal-text-color);
        border-right: 1px solid var(--border-color);
        flex-shrink: 0;
      }
      .modal-input {
        flex: 1;
        min-width: 0;
        border: none;
        border-radius: 0;
        &:focus {
          box-shadow: none;
        }
        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        &[type='number'] {
          -moz-appearance: textfield;
          appearance: textfield;
        }
      }
      &:focus-within {
        border-color: var(--primary-green-color);
        box-shadow: 0 0 0 2px rgba(92, 184, 92, 0.2);
        .input-prefix {
          border-right-color: var(--primary-green-color);
        }
      }
    }

    .datepicker-wrapper {
      width: 100%;
      :deep(.mx-input) {
        width: 100%;
        height: 2.75rem;
        padding: 0.75rem 1rem;
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
        font-size: 0.9375rem;
        background-color: var(--background-color);
        color: var(--header-text-color);
        cursor: pointer;
      }
      :deep(.mx-datepicker) {
        width: 100%;
      }
    }

    .frequency-segmented {
      display: flex;
      padding: 3px;
      border-radius: var(--border-radius);
      background-color: var(--background-color-soft);
      .frequency-option {
        flex: 1;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--normal-text-color);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        &.active {
          background-color: var(--primary-green-color);
          color: white;
        }
        &:hover:not(.active) {
          background-color: var(--hover-color);
        }
      }
    }

    .error-message {
      color: var(--notification-alert-color, #dc3545);
      font-size: 0.85rem;
      text-align: center;
      padding: 0.5rem 0.75rem;
      background-color: rgba(220, 53, 69, 0.1);
      border-radius: var(--border-radius);
    }

    .add-btn {
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: var(--border-radius);
      background-color: var(--primary-green-color);
      color: white;
      font-weight: 600;
      font-size: 0.9375rem;
      cursor: pointer;
      &:hover {
        opacity: var(--hover-opacity);
      }
    }
  }

  .manage-categories-modal {
    max-width: 26rem;
    .manage-categories-actions {
      margin-bottom: 0.5rem;
    }
    .add-category-trigger-btn {
      padding: 0.5rem 0.75rem;
      border-radius: var(--border-radius);
      border: 1px solid var(--border-color);
      background-color: var(--background-color);
      color: var(--header-text-color);
      font-size: 0.875rem;
      cursor: pointer;
      &:hover {
        opacity: var(--hover-opacity, 0.9);
      }
    }
    .manage-category-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      .manage-form-buttons {
        display: flex;
        gap: 0.5rem;
      }
    }
    .manage-save-btn {
      padding: 0.4rem 0.75rem;
      border: none;
      border-radius: var(--border-radius);
      background-color: var(--primary-green-color);
      color: white;
      font-size: 0.8125rem;
      cursor: pointer;
      &:hover {
        opacity: var(--hover-opacity);
      }
    }
    .manage-cancel-btn {
      padding: 0.4rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      background-color: var(--background-color);
      color: var(--header-text-color);
      font-size: 0.8125rem;
      cursor: pointer;
      &:hover {
        opacity: var(--hover-opacity);
      }
    }
    .manage-categories-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .manage-category-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-color);
      &:last-child {
        border-bottom: none;
      }
    }
    .manage-category-name {
      flex: 1;
      min-width: 0;
      font-size: 0.9375rem;
      color: var(--header-text-color);
    }
    .manage-edit-input {
      flex: 1;
      min-width: 0;
    }
    .manage-row-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-shrink: 0;
    }
    .manage-empty {
      margin: 0;
      font-size: 0.875rem;
      color: var(--normal-text-color);
    }
  }
}

@media (max-width: 1024px) {
  .expense-sources-container {
    flex: 1 1 auto;
    min-height: 0;
    height: auto;
  }
  .header__toolbar {
    gap: 0.75rem;
  }
  .toolbar-filters {
    flex-wrap: wrap;
  }
  .date-range-wrap :deep(.mx-datepicker) {
    min-width: 12rem;
  }
  .table-wrap {
    min-height: 12rem;
  }
}

@media (max-width: 768px) {
  .expense-sources-container {
    width: 100%;
    min-height: 0;
    height: auto;
    padding: 1rem;
    .header {
      flex-direction: column;
      align-items: stretch;
      margin-bottom: 1rem;
    }
    .header__title {
      display: none; /* Remove "Expense History" header on mobile */
    }
    .header__toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }
    .toolbar-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .toolbar-actions .btn {
      min-height: 2.75rem; /* ~44px touch target */
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
    }
    .toolbar-filters {
      flex-direction: column;
      gap: 0.5rem;
    }
    .filter-group {
      width: 100%;
    }
    .filter-select {
      width: 100%;
      min-height: 2.75rem;
      font-size: 1rem; /* 16px avoids iOS zoom on focus */
      max-width: none;
    }
    .date-range-wrap {
      width: 100%;
      :deep(.mx-datepicker) {
        width: 100%;
        min-width: 0;
      }
      :deep(.mx-input) {
        width: 100%;
        min-height: 2.75rem;
        font-size: 1rem;
        padding: 0.625rem 0.75rem;
      }
    }
    .table-wrap {
      overflow: visible;
    }
    .table-header {
      display: none;
    }
    .table-row.expense-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      grid-template-columns: unset;
      padding: 1rem;
      margin-bottom: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      background-color: var(--background-color);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      &:last-child {
        margin-bottom: 0;
      }
    }
    .table-row .col {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0;
      border: none;
    }
    .table-row .col-mobile-label {
      display: inline;
      flex-shrink: 0;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--normal-text-color);
      min-width: 5rem;
    }
    .table-row .col-name .source-name,
    .table-row .col-value {
      font-size: 0.875rem;
      color: var(--header-text-color);
    }
    .table-row .col-actions {
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
    }
    .empty-state {
      min-height: 14rem;
      padding: 2rem 1.5rem;
    }
    .modal-content {
      width: 90%;
      max-width: none;
    }
  }
}
</style>

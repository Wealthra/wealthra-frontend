<template>
  <div class="budget-table-container">
    <header class="header">
      <h1 class="header__title">{{ t('budgetHistory') }}</h1>
      <div class="header__toolbar">
        <div class="toolbar-actions">
          <button type="button" class="btn btn--primary" @click="showCreateModalOpen">
            {{ t('createBudget') }}
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
            <input
              v-model="searchQuery"
              type="text"
              class="filter-input"
              :placeholder="t('searchCategory')"
              :aria-label="t('searchCategory')"
            />
          </div>
          <div class="filter-group">
            <select
              v-model="categoryFilter"
              class="filter-select"
              :aria-label="t('categoryName')"
            >
              <option :value="null">{{ t('allCategories') }}</option>
              <option
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <select
              v-model="statusFilter"
              class="filter-select"
              :aria-label="t('status')"
            >
              <option value="">{{ t('allStatuses') }}</option>
              <option
                v-for="s in statusOptions"
                :key="s"
                :value="s"
              >
                {{ s }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>

    <div class="table-wrap" :class="{ 'table-wrap--empty': isTableEmpty }">
      <div v-if="filteredBudgets.length > 0" class="table" role="table">
        <div class="table-header" role="row">
          <div class="col col-category" role="columnheader">{{ t('categoryName') }}</div>
          <div class="col col-limit" role="columnheader">{{ t('limitAmount') }}</div>
          <div class="col col-current" role="columnheader">{{ t('currentAmount') }}</div>
          <div class="col col-percent" role="columnheader">{{ t('percentageUsed') }}</div>
          <div class="col col-status" role="columnheader">{{ t('status') }}</div>
          <div class="col col-actions" role="columnheader">{{ t('actions') }}</div>
        </div>
        <div
          v-for="(budget, index) in filteredBudgets"
          :key="budget.id ?? index"
          class="table-row budget-card"
          role="row"
        >
          <div class="col col-category">
            <span class="col-mobile-label">{{ t('categoryName') }}</span>
            <span class="category-name">{{ budget.categoryName }}</span>
          </div>
          <div class="col col-limit">
            <span class="col-mobile-label">{{ t('limitAmount') }}</span>
            <span class="col-value">${{ formatAmount(budget.limitAmount) }}</span>
          </div>
          <div class="col col-current">
            <span class="col-mobile-label">{{ t('currentAmount') }}</span>
            <span class="col-value">${{ formatAmount(budget.currentAmount) }}</span>
          </div>
          <div class="col col-percent">
            <span class="col-mobile-label">{{ t('percentageUsed') }}</span>
            <span class="col-value">{{ formatPercent(budget.percentageUsed) }}</span>
          </div>
          <div class="col col-status">
            <span class="col-mobile-label">{{ t('status') }}</span>
            <span class="status-badge" :class="statusClass(budget.status)">{{ budget.status }}</span>
          </div>
          <div class="col col-actions">
            <button
              type="button"
              class="row-action-btn"
              :aria-label="t('editBudget')"
              @click="openEditModal(budget)"
            >
              <font-awesome-icon :icon="actionIcons.edit" class="action-icon" />
            </button>
            <button
              type="button"
              class="row-action-btn"
              :aria-label="t('deleteBudget')"
              @click="confirmDelete(budget)"
            >
              <font-awesome-icon :icon="actionIcons.delete" class="delete-icon" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="isTableEmpty" class="empty-state">
        <div class="empty-state__icon-wrap">
          <font-awesome-icon
            :icon="emptyStateIcon"
            class="empty-state__icon"
            aria-hidden="true"
          />
        </div>
        <h2 class="empty-state__heading">{{ t('noBudgetsYet') }}</h2>
        <p class="empty-state__text">{{ t('noBudgetsYetText') }}</p>
      </div>
    </div>

    <!-- Create budget modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="hideCreateModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ t('addBudgetLimit') }}</h3>
          <button type="button" class="close-btn" @click="hideCreateModal" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="create-budget-category">{{ t('selectCategory') }}</label>
            <select
              id="create-budget-category"
              v-model="newBudget.categoryId"
              class="modal-input"
              required
            >
              <option :value="0">{{ t('selectCategory') }}</option>
              <option
                v-for="cat in categoriesNotUsed"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="create-budget-limit">{{ t('enterLimitAmount') }}</label>
            <div class="input-with-prefix">
              <span class="input-prefix">$</span>
              <input
                id="create-budget-limit"
                v-model.number="newBudget.limitAmount"
                type="number"
                class="modal-input"
                min="0"
                step="0.01"
                :placeholder="t('enterLimitAmount')"
              />
            </div>
          </div>
          <div v-if="createError" class="error-message">{{ createError }}</div>
          <button type="button" class="add-btn" @click="submitCreate">
            {{ t('save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit budget modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="hideEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ t('editBudgetLimit') }}</h3>
          <button type="button" class="close-btn" @click="hideEditModal" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>{{ t('categoryName') }}</label>
            <p class="modal-readonly">{{ editingBudget?.categoryName }}</p>
          </div>
          <div class="form-group">
            <label for="edit-budget-limit">{{ t('enterLimitAmount') }}</label>
            <div class="input-with-prefix">
              <span class="input-prefix">$</span>
              <input
                id="edit-budget-limit"
                v-model.number="editLimitAmount"
                type="number"
                class="modal-input"
                min="0"
                step="0.01"
                :placeholder="t('enterLimitAmount')"
              />
            </div>
          </div>
          <div v-if="editError" class="error-message">{{ editError }}</div>
          <button type="button" class="add-btn" @click="submitEdit">
            {{ t('save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Manage categories modal (same as expenses) -->
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
import { budgetTexts } from '@/data/budgetTexts'
import { actionIcons } from '@/icons/fontawesome-icons'
import { faChartLine } from '@fortawesome/free-solid-svg-icons'
import type { BudgetApiModel } from '@/services/api/budget/budget.models'
import type { Category } from '@/services/api/category/category.models'
import { categoryService } from '@/services/api/category/category.service'

export default {
  name: 'UIBudgetTableComponent',
  props: {
    budgets: {
      type: Array as () => BudgetApiModel[],
      default: () => [],
    },
    categories: {
      type: Array as () => Category[],
      default: () => [],
    },
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },
  data() {
    return {
      actionIcons,
      emptyStateIcon: faChartLine,
      categoryFilter: null as number | null,
      statusFilter: '' as string,
      searchQuery: '' as string,
      newBudget: {
        categoryId: 0 as number,
        limitAmount: 0 as number,
      },
      editingBudget: null as BudgetApiModel | null,
      editLimitAmount: 0 as number,
      createError: '' as string,
      editError: '' as string,
      showCreateModal: false,
      showEditModal: false,
      showManageCategoriesModal: false,
      isAddingCategory: false,
      newCategoryName: '' as string,
      editingCategoryId: null as number | null,
      editingCategoryName: '' as string,
      manageError: '' as string,
    }
  },
  computed: {
    statusOptions(): string[] {
      const set = new Set<string>()
     ;(this.budgets as BudgetApiModel[]).forEach((b) => {
        if (b.status != null && String(b.status).trim() !== '') set.add(String(b.status))
      })
      return Array.from(set).sort()
    },
    filteredBudgets(): BudgetApiModel[] {
      const list = (this.budgets as BudgetApiModel[]) ?? []
      let out = list

      if (this.categoryFilter != null) {
        out = out.filter((b) => b.categoryId === this.categoryFilter)
      }
      if (this.statusFilter !== '') {
        out = out.filter((b) => String(b.status) === this.statusFilter)
      }
      if (this.searchQuery.trim() !== '') {
        const q = this.searchQuery.trim().toLowerCase()
        out = out.filter(
          (b) =>
            (b.categoryName && b.categoryName.toLowerCase().includes(q))
        )
      }
      return out
    },
    isTableEmpty(): boolean {
      return this.filteredBudgets.length === 0
    },
    categoriesNotUsed(): Category[] {
      const usedIds = new Set((this.budgets as BudgetApiModel[]).map((b) => b.categoryId))
      return (this.categories as Category[]).filter((c) => !usedIds.has(c.id))
    },
  },
  methods: {
    t(key: keyof typeof budgetTexts.English) {
      const texts = budgetTexts[this.selectedLanguage as 'English' | 'Turkish']
      return (texts as Record<string, string>)[key] ?? key
    },
    formatAmount(val: number): string {
      if (val == null || Number.isNaN(val)) return '0.00'
      return Number(val).toFixed(2)
    },
    formatPercent(val: number): string {
      if (val == null || Number.isNaN(val)) return '0%'
      return Number(val).toFixed(1) + '%'
    },
    statusClass(status: string): string {
      if (!status) return ''
      const s = String(status).toLowerCase()
      if (s.includes('exceed') || s.includes('aşım')) return 'status-exceeded'
      if (s.includes('warn')) return 'status-warning'
      return 'status-ok'
    },
    showCreateModalOpen() {
      this.newBudget = { categoryId: 0, limitAmount: 0 }
      this.createError = ''
      this.showCreateModal = true
    },
    hideCreateModal() {
      this.showCreateModal = false
      this.createError = ''
    },
    submitCreate() {
      this.createError = ''
      const categoryId = this.newBudget.categoryId
      const limitAmount = Number(this.newBudget.limitAmount)
      if (!categoryId || categoryId === 0) {
        this.createError = this.t('selectCategory')
        return
      }
      if (limitAmount <= 0 || !Number.isFinite(limitAmount)) {
        this.createError = this.t('enterLimitAmount')
        return
      }
      this.$emit('createBudget', { categoryId, limitAmount })
      this.hideCreateModal()
    },
    openEditModal(budget: BudgetApiModel) {
      this.editingBudget = budget
      this.editLimitAmount = budget.limitAmount ?? 0
      this.editError = ''
      this.showEditModal = true
    },
    hideEditModal() {
      this.showEditModal = false
      this.editingBudget = null
      this.editError = ''
    },
    submitEdit() {
      this.editError = ''
      if (!this.editingBudget) return
      const limitAmount = Number(this.editLimitAmount)
      if (limitAmount <= 0 || !Number.isFinite(limitAmount)) {
        this.editError = this.t('enterLimitAmount')
        return
      }
      this.$emit('updateBudget', this.editingBudget.id, limitAmount)
      this.hideEditModal()
    },
    confirmDelete(budget: BudgetApiModel) {
      if (!window.confirm(this.t('confirmDeleteBudget'))) return
      this.$emit('deleteBudget', budget.id)
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
.budget-table-container {
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
    flex-wrap: wrap;
  }

  .header__title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--header-text-color);
  }

  .header__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
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
  }

  .btn {
    padding: 0.4rem 0.75rem;
    border-radius: var(--border-radius);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
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

  .filter-input,
  .filter-select {
    padding: 0.4rem 0.75rem;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    color: var(--header-text-color);
    font-size: 0.8125rem;
    min-width: 10rem;
  }

  .filter-input {
    min-width: 12rem;
  }

  .filter-group {
    min-width: 0;
  }

  .filter-select {
    appearance: auto;
    cursor: pointer;
  }

  .table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
    &.table-wrap--empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .table {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .table-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 6rem 6rem 5rem minmax(5rem, 1fr) 5.5rem;
    gap: 1rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--border-color);
    font-weight: 600;
    font-size: 0.75rem;
    color: var(--normal-text-color);
  }

  .table-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 6rem 6rem 5rem minmax(5rem, 1fr) 5.5rem;
    gap: 1rem;
    padding: 0.7rem 1rem;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
  }

  .col {
    min-width: 0;
  }

  .col-mobile-label {
    display: none;
  }

  .category-name {
    font-weight: 600;
    color: var(--header-text-color);
    font-size: 0.8125rem;
  }

  .col-value {
    font-size: 0.8125rem;
    color: var(--normal-text-color);
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: var(--border-radius);
    font-size: 0.75rem;
    &.status-ok {
      background-color: rgba(92, 184, 92, 0.15);
      color: var(--primary-green-color);
    }
    &.status-warning {
      background-color: rgba(196, 160, 80, 0.18);
      color: #b8860b;
    }
    &.status-exceeded {
      background-color: rgba(217, 83, 79, 0.15);
      color: var(--primary-red-color, #c0392b);
    }
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
    .action-icon,
    .delete-icon {
      font-size: 0.75rem;
    }
    &:hover {
      background-color: var(--background-color-soft);
    }
  }

  .empty-state {
    flex: 1;
    min-height: 16rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 3rem 2rem;
  }

  .empty-state__icon-wrap {
    width: 5.5rem;
    height: 5.5rem;
    border-radius: var(--border-radius);
    background-color: rgba(92, 184, 92, 0.12);
    color: var(--primary-green-color);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
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
    color: var(--normal-text-color);
    max-width: 24rem;
    line-height: 1.5;
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
      }
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      padding: 1.25rem;
      gap: 1.25rem;
      overflow-y: auto;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--normal-text-color);
      }
    }

    .modal-readonly {
      margin: 0;
      padding: 0.5rem 0;
      font-size: 0.9375rem;
      color: var(--header-text-color);
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
      }
      .modal-input {
        flex: 1;
        min-width: 0;
        border: none;
        border-radius: 0;
      }
    }

    .error-message {
      color: var(--notification-alert-color, #dc3545);
      font-size: 0.85rem;
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
  .budget-table-container {
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

  .filter-input,
  .filter-select {
    min-width: 8rem;
  }

  .table-wrap {
    min-height: 12rem;
  }
}

@media (max-width: 768px) {
  .budget-table-container {
    width: 100%;
    min-height: 0;
    height: auto;
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1rem;
    width: 100%;
    min-width: 0;
  }

  .header__title {
    display: none; /* Remove "Budget History" header on mobile */
  }

  .header__toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    width: 100%;
    min-width: 0;
  }

  .toolbar-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    min-width: 0;
  }

  .toolbar-actions .btn {
    width: 100%;
    min-width: 0;
    min-height: 2.75rem;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    box-sizing: border-box;
  }

  .toolbar-filters {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    min-width: 0;
  }

  .filter-group {
    width: 100%;
    min-width: 0;
  }

  .filter-input,
  .filter-select {
    width: 100%;
    min-width: 0;
    max-width: none;
    min-height: 2.75rem;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .table-wrap {
    overflow: visible;
  }

  .budget-table-container .table-header,
  .table .table-header {
    display: none !important;
  }

  .table-row.budget-card {
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
  }

  .table-row.budget-card:last-child {
    margin-bottom: 0;
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

  .table-row .col-category .category-name,
  .table-row .col-value {
    font-size: 0.875rem;
    color: var(--header-text-color);
  }

  .table-row .col-actions {
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-color);
    width: 100%;
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
</style>

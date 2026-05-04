<template>
  <div class="budget-table-container">
    <header class="header">
      <div v-if="loading" class="skeleton-box header__title-skeleton"></div>
      <h1 v-else class="header__title">{{ t('budgetHistory') }}</h1>

      <div class="header__toolbar">
        <div class="toolbar-actions">
          <div v-if="loading" class="skeleton-box btn-skeleton"></div>
          <button v-else type="button" class="btn btn--primary" @click="showCreateModalOpen">
            {{ t('createBudget') }}
          </button>
        </div>
        <div class="toolbar-filters">
          <template v-if="loading">
            <div class="skeleton-box filter-skeleton search-skeleton"></div>
            <div class="skeleton-box filter-skeleton"></div>
            <div class="skeleton-box filter-skeleton"></div>
          </template>
          <template v-else>
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
              <UISelect
                :model-value="categoryFilter ?? 'all'"
                @update:model-value="val => (categoryFilter = val === 'all' ? null : Number(val))"
                class="filter-select"
                searchable
                compact
                :options="[
                  { label: t('allCategories'), value: 'all' },
                  ...categories.map(cat => ({ label: cat.name, value: cat.id })),
                ]"
              />
            </div>
            <div class="filter-group">
              <UISelect
                :model-value="statusFilter || 'all-status'"
                @update:model-value="
                  val => (statusFilter = val === 'all-status' ? '' : String(val))
                "
                class="filter-select"
                compact
                :options="[
                  { label: t('allStatuses'), value: 'all-status' },
                  ...statusOptions.map(s => ({ label: s, value: s })),
                ]"
              />
            </div>
          </template>
        </div>
      </div>
    </header>

    <div class="table-wrap" :class="{ 'table-wrap--empty': !loading && isTableEmpty }">
      <!-- Skeleton State -->
      <div v-if="loading" class="table" role="table">
        <div class="table-header" role="row">
          <div class="col col-category" role="columnheader">
            <div class="skeleton-box header-skeleton"></div>
          </div>
          <div class="col col-limit" role="columnheader">
            <div class="skeleton-box header-skeleton"></div>
          </div>
          <div class="col col-current" role="columnheader">
            <div class="skeleton-box header-skeleton"></div>
          </div>
          <div class="col col-percent" role="columnheader">
            <div class="skeleton-box header-skeleton"></div>
          </div>
          <div class="col col-status" role="columnheader">
            <div class="skeleton-box header-skeleton"></div>
          </div>
          <div class="col col-actions" role="columnheader">
            <div class="skeleton-box header-skeleton"></div>
          </div>
        </div>
        <div v-for="i in 5" :key="i" class="table-row budget-card skeleton-row" role="row">
          <div class="col col-category">
            <div class="skeleton-box col-mobile-label-skeleton"></div>
            <div class="skeleton-box row-skeleton"></div>
          </div>
          <div class="col col-limit">
            <div class="skeleton-box col-mobile-label-skeleton"></div>
            <div class="skeleton-box row-skeleton"></div>
          </div>
          <div class="col col-current">
            <div class="skeleton-box col-mobile-label-skeleton"></div>
            <div class="skeleton-box row-skeleton"></div>
          </div>
          <div class="col col-percent">
            <div class="skeleton-box col-mobile-label-skeleton"></div>
            <div class="skeleton-box row-skeleton"></div>
          </div>
          <div class="col col-status">
            <div class="skeleton-box col-mobile-label-skeleton"></div>
            <div class="skeleton-box row-skeleton"></div>
          </div>
          <div class="col col-actions">
            <div class="skeleton-box col-mobile-label-skeleton"></div>
            <div class="col-actions-buttons">
              <div class="skeleton-box action-icon-skeleton"></div>
              <div class="skeleton-box action-icon-skeleton"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loaded Content -->
      <div v-else-if="filteredBudgets.length > 0" class="table" role="table">
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
            <span class="col-value">{{ formatCurrency(budget.limitAmount) }}</span>
          </div>
          <div class="col col-current">
            <span class="col-mobile-label">{{ t('currentAmount') }}</span>
            <span class="col-value">{{ formatCurrency(budget.currentAmount) }}</span>
          </div>
          <div class="col col-percent">
            <span class="col-mobile-label">{{ t('percentageUsed') }}</span>
            <span class="col-value">{{ formatPercent(budget.percentageUsed) }}</span>
          </div>
          <div class="col col-status">
            <span class="col-mobile-label">{{ t('status') }}</span>
            <span class="status-badge" :class="statusClass(budget.status)">{{
              statusText(budget.status)
            }}</span>
          </div>
          <div class="col col-actions">
            <button
              type="button"
              class="row-action-btn"
              :aria-label="t('viewBudgetDetails')"
              @click="$emit('viewBudget', budget.id)"
            >
              <font-awesome-icon :icon="actionIcons.view" class="action-icon" />
            </button>
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

      <!-- Empty State -->
      <div v-if="!loading && isTableEmpty" class="empty-state">
        <div class="empty-state__icon-wrap">
          <font-awesome-icon :icon="emptyStateIcon" class="empty-state__icon" aria-hidden="true" />
        </div>
        <h2 class="empty-state__heading">{{ t('noBudgetsYet') }}</h2>
        <p class="empty-state__text">{{ t('noBudgetsYetText') }}</p>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="hideCreateModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ t('addBudgetLimit') }}</h3>
          <button type="button" class="close-btn" @click="hideCreateModal" aria-label="Close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="create-budget-category">{{ t('selectCategory') }}</label>
            <UISelect
              id="create-budget-category"
              :model-value="newBudget.categoryId || '0'"
              @update:model-value="val => (newBudget.categoryId = Number(val))"
              class="category-select"
              searchable
              :options="[
                { label: t('selectCategory'), value: '0' },
                ...categoriesNotUsed.map(cat => ({ label: cat.name, value: cat.id })),
              ]"
            />
          </div>
          <div class="form-group">
            <label for="create-budget-limit">{{ t('enterLimitAmount') }}</label>
            <div class="input-with-prefix">
              <span class="input-prefix">{{ SYMBOLS[newBudget.currency as any] || currencySymbol }}</span>
              <input
                id="create-budget-limit"
                v-model.number="newBudget.limitAmount"
                type="number"
                class="modal-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="create-budget-currency">{{ selectedLanguage == 'English' ? 'Currency' : 'Para Birimi' }}</label>
            <UISelect
              id="create-budget-currency"
              v-model="newBudget.currency"
              :options="[
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
                { label: 'TRY (₺)', value: 'TRY' },
              ]"
            />
          </div>
          <div v-if="createError" class="error-message">{{ createError }}</div>
          <button type="button" class="add-btn" @click="submitCreate">{{ t('save') }}</button>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click.self="hideEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ t('editBudgetLimit') }}</h3>
          <button type="button" class="close-btn" @click="hideEditModal" aria-label="Close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>{{ t('categoryName') }}</label>
            <p class="modal-readonly">{{ editingBudget?.categoryName }}</p>
          </div>
          <div class="form-group">
            <label for="edit-budget-limit">{{ t('enterLimitAmount') }}</label>
            <div class="input-with-prefix">
              <span class="input-prefix">{{ SYMBOLS[editingBudget?.currency as any] || currencySymbol }}</span>
              <input
                id="edit-budget-limit"
                v-model.number="editLimitAmount"
                type="number"
                class="modal-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div v-if="editError" class="error-message">{{ editError }}</div>
          <button type="button" class="add-btn" @click="submitEdit">{{ t('save') }}</button>
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
import { useCurrency } from '@/composables/useCurrency'
import UISelect from '@/components/UISelect.vue'
import { useConfirm } from '@/stores/useConfirm'

export default {
  name: 'UIBudgetTableComponent',
  components: { UISelect },
  props: {
    loading: { type: Boolean, default: false },
    budgets: { type: Array as () => BudgetApiModel[], default: () => [] },
    categories: { type: Array as () => Category[], default: () => [] },
    selectedLanguage: { type: String, default: 'English' },
  },
  setup() {
    const { formatCurrency, currencySymbol, currency, setCurrency, isPrivacyMode } = useCurrency()
    const confirm = useConfirm()
    const SYMBOLS: Record<string, string> = {
      USD: '$',
      EUR: '€',
      TRY: '₺',
    }
    return { formatCurrency, currencySymbol, currency, setCurrency, confirm, SYMBOLS, isPrivacyMode }
  },
  data() {
    return {
      actionIcons,
      emptyStateIcon: faChartLine,
      categoryFilter: null as number | null,
      statusFilter: '' as string,
      searchQuery: '' as string,
      newBudget: { categoryId: 0, limitAmount: 0, currency: '' },
      editingBudget: null as BudgetApiModel | null,
      editLimitAmount: 0,
      createError: '',
      editError: '',
      showCreateModal: false,
      showEditModal: false,
    }
  },
  computed: {
    statusOptions(): string[] {
      const set = new Set<string>()
      ;(this.budgets as BudgetApiModel[]).forEach(b => {
        if (b.status != null && String(b.status).trim() !== '') set.add(String(b.status))
      })
      return Array.from(set).sort()
    },
    filteredBudgets(): BudgetApiModel[] {
      let out = (this.budgets as BudgetApiModel[]) ?? []
      if (this.categoryFilter != null) out = out.filter(b => b.categoryId === this.categoryFilter)
      if (this.statusFilter !== '') out = out.filter(b => String(b.status) === this.statusFilter)
      const q = this.searchQuery.trim().toLowerCase()
      if (q !== '') out = out.filter(b => b.categoryName?.toLowerCase().includes(q))
      return out
    },
    isTableEmpty(): boolean {
      return this.filteredBudgets.length === 0
    },
    categoriesNotUsed(): Category[] {
      const usedIds = new Set((this.budgets as BudgetApiModel[]).map(b => b.categoryId))
      return (this.categories as Category[]).filter(c => !usedIds.has(c.id))
    },
  },
  methods: {
    t(key: keyof typeof budgetTexts.English) {
      const texts = budgetTexts[this.selectedLanguage as 'English' | 'Turkish']
      return (texts as Record<string, string>)[key] ?? key
    },
    formatAmount(val: number): string {
      return (val ?? 0).toFixed(2)
    },
    formatPercent(val: number): string {
      if (this.isPrivacyMode) return '••%'
      return (val ?? 0).toFixed(1) + '%'
    },
    statusClass(status: string): string {
      if (!status) return ''
      const s = String(status).toLowerCase()
      if (s.includes('exceed') || s.includes('aşım')) return 'status-exceeded'
      if (s.includes('warn') || s.includes('uyarı')) return 'status-warning'
      return 'status-ok'
    },
    statusText(status: string): string {
      if (!status) return ''
      const s = String(status).toLowerCase()
      if (s.includes('exceed') || s.includes('aşım')) return this.t('statusExceeded')
      if (s.includes('warn') || s.includes('uyarı')) return this.t('statusWarning')
      if (s.includes('safe') || s.includes('güvenli')) return this.t('statusSafe')
      if (s.includes('healthy') || s.includes('sağlıklı')) return this.t('statusHealthy')
      if (s.includes('ok') || s.includes('tamam')) return this.t('statusOk')
      return status
    },
    showCreateModalOpen() {
      this.newBudget = { categoryId: 0, limitAmount: 0, currency: this.currency }
      this.createError = ''
      this.showCreateModal = true
    },
    hideCreateModal() {
      this.showCreateModal = false
    },
    submitCreate() {
      const { categoryId, limitAmount } = this.newBudget
      if (!categoryId) {
        this.createError = this.t('selectCategory')
        return
      }
      if (limitAmount <= 0) {
        this.createError = this.t('enterLimitAmount')
        return
      }
      this.$emit('createBudget', { categoryId, limitAmount, currency: this.currency })
      this.hideCreateModal()
    },
    openEditModal(budget: BudgetApiModel) {
      this.editingBudget = budget
      this.editLimitAmount = budget.limitAmount
      this.editError = ''
      this.showEditModal = true
    },
    hideEditModal() {
      this.showEditModal = false
    },
    submitEdit() {
      if (!this.editingBudget || this.editLimitAmount <= 0) {
        this.editError = this.t('enterLimitAmount')
        return
      }
      this.$emit('updateBudget', this.editingBudget.id, this.editLimitAmount)
      this.hideEditModal()
    },
    async confirmDelete(budget: BudgetApiModel) {
      const confirmed = await this.confirm.ask({
        title: this.t('deleteBudget'),
        message: this.t('confirmDeleteBudget'),
        confirmText: this.t('deleteBudget'),
        type: 'danger'
      })
      if (confirmed) this.$emit('deleteBudget', budget.id)
    },
  },
  watch: {
    currency(newVal) {
      if (newVal && !this.showEditModal) {
        this.newBudget.currency = newVal
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
  padding: 1.25rem 1rem;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    gap: 1rem;
  }
  .header__title {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
    color: var(--header-text-color);
  }

  .header__title-skeleton {
    width: 180px;
    height: 1.5rem;

    @media (max-width: 1024px) {
      display: none;
    }
  }

  .header__toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: nowrap;
  }
  .toolbar-actions {
    display: flex;
    align-items: center;
  }

  .btn {
    padding: 0 1.25rem;
    height: 2.25rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: opacity 0.15s ease;
    box-sizing: border-box;
    &:hover:not(:disabled) {
      opacity: var(--hover-opacity);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  .btn--primary {
    background-color: var(--primary-green-color);
    color: white;
    border-color: var(--primary-green-color);
  }

  .btn-skeleton {
    width: 100px;
    height: 2.25rem;
    border-radius: 10px;
  }

  .row-skeleton {
    width: 80%;
    height: 1rem;
    border-radius: 4px;
    flex: 1;
    max-width: 80%;
  }

  .action-icon-skeleton {
    width: 2rem;
    height: 2rem;
    border-radius: 6px;
  }

  .toolbar-filters {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-skeleton {
    width: 10rem;
    height: 2.25rem;
    border-radius: 10px;
    &.search-skeleton {
      width: 12rem;
    }
  }

  .filter-input {
    height: 2.25rem;
    padding: 0 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background-color: var(--background-color);
    color: var(--header-text-color);
    font-size: 0.75rem;
    width: 12rem;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: var(--primary-green-color);
    }
  }

  .filter-select {
    min-width: 10rem;
    :deep(.select-trigger) {
      padding: 0 0.75rem;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background-color: var(--background-color);
      color: var(--header-text-color);
      font-size: 0.75rem;
      height: 2.25rem;
      cursor: pointer;
      box-sizing: border-box;
    }
  }

  .table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
    background-color: var(--background-color);
    padding-right: 0.75rem;
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
    grid-template-columns: minmax(0, 1fr) 6rem 6rem 5rem minmax(5rem, 1fr) minmax(7.75rem, auto);
    gap: 1rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--border-color);
    font-weight: 700;
    font-size: 0.7rem;
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
    grid-template-columns: minmax(0, 1fr) 6rem 6rem 5rem minmax(5rem, 1fr) minmax(7.75rem, auto);
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

  .col-actions {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.35rem;
    min-width: 7.25rem;

    .row-action-btn {
      flex-shrink: 0;
    }
  }
  .col-mobile-label,
  .col-mobile-label-skeleton {
    display: none;
  }
  .category-name {
    font-weight: 600;
    color: var(--header-text-color);
    font-size: 0.8rem;
  }
  .col-value {
    font-size: 0.75rem;
    color: var(--normal-text-color);
  }
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.625rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
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
      color: var(--primary-red-color);
    }
  }
  .row-action-btn {
    width: 2rem;
    height: 2rem;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--normal-text-color);
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    &:hover {
      background-color: var(--background-color-soft);
      color: var(--primary-red-color);
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
      margin-bottom: 0.75rem;
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--header-text-color);
    }
    .empty-state__text {
      font-size: 1rem;
      color: var(--normal-text-color);
      line-height: 1.5;
      max-width: 24rem;
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    background: var(--background-color);
    border-radius: var(--border-radius);
    width: 90%;
    max-width: 28rem;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    .modal-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
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
    .category-select {
      width: 100%;
      :deep(.select-trigger) {
        width: 100%;
        height: 2.75rem;
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        background: var(--background-color);
        color: var(--header-text-color);
        font-size: 0.9375rem;
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
      background: var(--background-color);
      color: var(--header-text-color);
      font-size: 0.9375rem;
      &:focus {
        outline: none;
        border-color: var(--primary-green-color);
        box-shadow: 0 0 0 2px rgba(92, 184, 92, 0.2);
      }
    }
    .input-with-prefix {
      display: flex;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      overflow: hidden;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
      .input-prefix {
        display: flex;
        align-items: center;
        padding: 0 1rem;
        color: var(--normal-text-color);
        border-right: 1px solid var(--border-color);
      }
      .modal-input {
        border: none;
        flex: 1;
        &:focus {
          outline: none;
          box-shadow: none;
        }
      }
      &:focus-within {
        border-color: var(--primary-green-color);
        box-shadow: 0 0 0 2px rgba(92, 184, 92, 0.2);
      }
    }
    .add-btn {
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: var(--border-radius);
      background: var(--primary-green-color);
      color: white;
      font-weight: 600;
      font-size: 0.9375rem;
      cursor: pointer;
    }
    .error-message {
      color: #dc3545;
      font-size: 0.85rem;
      text-align: center;
      background: rgba(220, 53, 69, 0.1);
      padding: 0.5rem;
      border-radius: var(--border-radius);
    }
  }
}

@media (max-width: 1200px) {
  .budget-table-container {
    padding: 1rem;
    width: 100%;

    .header {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 0.75rem !important;
      margin-bottom: 1.25rem !important;
    }

    .header__title,
    .header__title-skeleton {
      display: none !important;
    }

    .header__toolbar {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 0.75rem !important;
      width: 100% !important;
    }

    .toolbar-actions,
    .toolbar-filters {
      display: contents !important;
    }

    .btn,
    .btn-skeleton,
    .filter-input,
    .filter-select,
    .filter-skeleton {
      width: 100% !important;
      height: 2.75rem !important;
      min-height: 2.75rem !important;
      font-size: 0.875rem !important;
      margin: 0 !important;
      display: flex !important;
      align-items: center;
      justify-content: center;
    }

    .filter-group {
      width: 100% !important;
      min-width: 0 !important;
    }

    .filter-select :deep(.select-trigger) {
      height: 2.75rem !important;
      min-height: 2.75rem !important;
      font-size: 0.875rem !important;
    }

    .filter-skeleton {
      height: 2.75rem !important;
      background-color: var(--background-color-soft) !important;
    }

    .table-header {
      display: none !important;
    }

    .table-row.budget-card,
    .table-row.skeleton-row {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      margin-bottom: 0.75rem;
      gap: 0.5rem;

      .col {
        width: 100%;
        display: flex;
        gap: 0.5rem;
      }

      .col-mobile-label {
        display: inline;
        min-width: 6rem;
        font-weight: 600;
        font-size: 0.75rem;
      }

      .col-actions {
        margin-top: 0.5rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-color);
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>

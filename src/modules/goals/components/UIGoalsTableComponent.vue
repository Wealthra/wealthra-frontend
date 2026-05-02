<template>
  <div class="goals-table-container">
    <header class="header">
      <div v-if="loading" class="skeleton-box header__title-skeleton"></div>
      <h1 v-else class="header__title">{{ t('goalsHistory') }}</h1>
      <div class="header__toolbar">
        <div class="toolbar-actions">
          <div v-if="loading" class="skeleton-box btn-skeleton"></div>
          <button v-else type="button" class="btn btn--primary" @click="showCreateModalOpen">
            {{ t('createGoal') }}
          </button>
        </div>
        <div class="toolbar-filters">
          <template v-if="loading">
            <div class="skeleton-box filter-skeleton search-skeleton"></div>
            <div class="skeleton-box filter-skeleton"></div>
          </template>
          <template v-else>
            <div class="filter-group">
              <input
                v-model="searchQuery"
                type="text"
                class="filter-input"
                :placeholder="t('searchByName')"
                :aria-label="t('searchByName')"
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
                  { label: t('completed'), value: 'completed' },
                  { label: t('inProgress'), value: 'inProgress' },
                ]"
              />
            </div>
          </template>
        </div>
      </div>
    </header>

    <div class="table-wrap" :class="{ 'table-wrap--empty': !loading && isTableEmpty }">
      <div v-if="loading || filteredGoals.length > 0" class="table" role="table">
        <div v-if="loading" class="table-header" role="row">
          <div class="col col-name" role="columnheader">
            <div class="skeleton-box header-skeleton"></div>
          </div>
          <div class="col col-target" role="columnheader">
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
        <div v-else class="table-header" role="row">
          <div class="col col-name" role="columnheader">{{ t('name') }}</div>
          <div class="col col-target" role="columnheader">{{ t('targetAmount') }}</div>
          <div class="col col-current" role="columnheader">{{ t('currentAmount') }}</div>
          <div class="col col-percent" role="columnheader">{{ t('progress') }}</div>
          <div class="col col-status" role="columnheader">{{ t('status') }}</div>
          <div class="col col-actions" role="columnheader">{{ t('actions') }}</div>
        </div>
        <template v-if="loading">
          <div v-for="i in 5" :key="i" class="table-row goal-card skeleton-row" role="row">
            <div class="col col-name">
              <div class="skeleton-box col-mobile-label-skeleton"></div>
              <div class="skeleton-box row-skeleton"></div>
            </div>
            <div class="col col-target">
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
              <div class="skeleton-box row-skeleton"></div>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="(goal, index) in filteredGoals"
            :key="goal.id ?? index"
            class="table-row goal-card"
            role="row"
          >
            <div class="col col-name">
              <span class="col-mobile-label">{{ t('name') }}</span>
              <span class="goal-name">{{ goal.name }}</span>
            </div>
            <div class="col col-target">
              <span class="col-mobile-label">{{ t('targetAmount') }}</span>
              <span class="col-value">{{ formatCurrency(goal.targetAmount) }}</span>
            </div>
            <div class="col col-current">
              <span class="col-mobile-label">{{ t('currentAmount') }}</span>
              <span class="col-value">{{ formatCurrency(displayCurrentAmount(goal)) }}</span>
            </div>
            <div class="col col-percent">
              <span class="col-mobile-label">{{ t('progress') }}</span>
              <span class="col-value">{{ formatPercent(displayProgress(goal)) }}</span>
            </div>
            <div class="col col-status">
              <span class="col-mobile-label">{{ t('status') }}</span>
              <span class="status-badge" :class="statusClass(goal)">{{ statusLabel(goal) }}</span>
            </div>
            <div class="col col-actions">
              <button
                type="button"
                class="row-action-btn"
                :aria-label="t('viewGoalDetails')"
                @click="$emit('viewGoal', goal.id)"
              >
                <font-awesome-icon :icon="actionIcons.view" class="action-icon" />
              </button>
              <button
                type="button"
                class="row-action-btn"
                :aria-label="t('editGoal')"
                @click="openEditModal(goal)"
              >
                <font-awesome-icon :icon="actionIcons.edit" class="action-icon" />
              </button>
              <button
                type="button"
                class="row-action-btn"
                :aria-label="t('deleteGoal')"
                @click="confirmDelete(goal)"
              >
                <font-awesome-icon :icon="actionIcons.delete" class="delete-icon" />
              </button>
            </div>
          </div>
        </template>
      </div>

      <div v-if="!loading && isTableEmpty" class="empty-state">
        <div class="empty-state__icon-wrap">
          <font-awesome-icon :icon="emptyStateIcon" class="empty-state__icon" aria-hidden="true" />
        </div>
        <h2 class="empty-state__heading">{{ t('noGoalsYet') }}</h2>
        <p class="empty-state__text">{{ t('noGoalsYetText') }}</p>
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
    <div
      v-else-if="goals && goals.length > 0 && totalPages > 0"
      class="pagination-bar"
    >
      <div class="pagination-results">
        <font-awesome-icon
          :icon="paginationIcons.results"
          class="pagination-results-icon"
          aria-hidden="true"
        />
        <UISelect
          :model-value="pageSize"
          class="page-size-select-premium"
          :label="t('resultsPerPage')"
          :options="pageSizeOptions"
          @update:model-value="val => $emit('updatePageSize', Number(val))"
          compact
        />
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

    <!-- Create goal modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="hideCreateModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ t('addGoal') }}</h3>
          <button type="button" class="close-btn" @click="hideCreateModal" aria-label="Close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="create-goal-name">{{ t('name') }}</label>
            <input
              id="create-goal-name"
              v-model="newGoal.name"
              type="text"
              class="modal-input"
              :placeholder="t('enterName')"
            />
          </div>
          <div class="form-group">
            <label for="create-goal-target">{{ t('targetAmount') }}</label>
            <div class="input-with-prefix">
              <span class="input-prefix">{{ currencySymbol }}</span>
              <input
                id="create-goal-target"
                v-model.number="newGoal.targetAmount"
                type="number"
                class="modal-input"
                min="0"
                step="0.01"
                :placeholder="t('enterTargetAmount')"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="create-goal-current">{{ t('currentAmount') }}</label>
            <div class="input-with-prefix">
              <span class="input-prefix">{{ currencySymbol }}</span>
              <input
                id="create-goal-current"
                v-model.number="newGoal.currentAmount"
                type="number"
                class="modal-input"
                min="0"
                step="0.01"
                :placeholder="t('enterCurrentAmount')"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="create-goal-deadline">{{ t('selectDeadline') }}</label>
            <div class="datepicker-wrapper">
              <Datepicker
                id="create-goal-deadline"
                v-model:value="newGoal.deadline"
                :placeholder="t('selectDeadline')"
                :disabled-date="disablePastDates"
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

    <!-- Edit goal modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="hideEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ t('editGoalLimit') }}</h3>
          <button type="button" class="close-btn" @click="hideEditModal" aria-label="Close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="edit-goal-name">{{ t('name') }}</label>
            <input
              id="edit-goal-name"
              v-model="editForm.name"
              type="text"
              class="modal-input"
              :placeholder="t('enterName')"
            />
          </div>
          <div class="form-group">
            <label for="edit-goal-target">{{ t('targetAmount') }}</label>
            <div class="input-with-prefix">
              <span class="input-prefix">{{ currencySymbol }}</span>
              <input
                id="edit-goal-target"
                v-model.number="editForm.targetAmount"
                type="number"
                class="modal-input"
                min="0"
                step="0.01"
                :placeholder="t('enterTargetAmount')"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="edit-goal-current">{{ t('currentAmount') }}</label>
            <div class="input-with-prefix">
              <span class="input-prefix">{{ currencySymbol }}</span>
              <input
                id="edit-goal-current"
                v-model.number="editForm.currentAmount"
                type="number"
                class="modal-input"
                min="0"
                step="0.01"
                :placeholder="t('enterCurrentAmount')"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="edit-goal-deadline">{{ t('selectDeadline') }}</label>
            <div class="datepicker-wrapper">
              <Datepicker
                id="edit-goal-deadline"
                v-model:value="editForm.deadline"
                :placeholder="t('selectDeadline')"
                :disabled-date="disablePastDates"
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
  </div>
</template>

<script lang="ts">
import { goalsTexts } from '@/data/goalsTexts'
import { actionIcons, arrowIcons, paginationIcons } from '@/icons/fontawesome-icons'
import { faBullseye } from '@fortawesome/free-solid-svg-icons'
import type { Goal } from '@/services/api/goal/goal.models'
import { useCurrency } from '@/composables/useCurrency'
import Datepicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import UISelect from '@/components/UISelect.vue'
import { useConfirm } from '@/stores/useConfirm'

export default {
  name: 'UIGoalsTableComponent',

  components: {
    Datepicker,
    FontAwesomeIcon,
    UISelect,
  },

  props: {
    goals: {
      type: Array as () => Goal[],
      default: () => [],
    },
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    pageNumber: { type: Number, default: 1 },
    pageSize: { type: Number, default: 10 },
    totalCount: { type: Number, default: 0 },
    totalPages: { type: Number, default: 0 },
  },

  setup() {
    const { formatCurrency, currencySymbol } = useCurrency()
    const confirm = useConfirm()
    return { formatCurrency, currencySymbol, confirm }
  },
  data() {
    return {
      actionIcons,
      arrowIcons,
      paginationIcons,
      emptyStateIcon: faBullseye,
      searchQuery: '' as string,
      statusFilter: '' as string,
      pageSizeOptions: [5, 10, 25, 50, 100],
      newGoal: {
        name: '' as string,
        targetAmount: 0 as number,
        currentAmount: 0 as number,
        deadline: '' as string | Date,
      },
      editingGoal: null as Goal | null,
      editForm: {
        name: '' as string,
        targetAmount: 0 as number,
        currentAmount: 0 as number,
        deadline: '' as string | Date,
      },
      createError: '' as string,
      editError: '' as string,
      showCreateModal: false,
      showEditModal: false,
    }
  },

  computed: {
    filteredGoals(): Goal[] {
      const list = (this.goals as Goal[]) ?? []
      let out = list
      if (this.searchQuery.trim() !== '') {
        const q = this.searchQuery.trim().toLowerCase()
        out = out.filter(g => g.name?.toLowerCase().includes(q))
      }
      if (this.statusFilter === 'completed') {
        out = out.filter(g => g.isCompleted === true)
      }
      if (this.statusFilter === 'inProgress') {
        out = out.filter(g => !g.isCompleted)
      }
      return out
    },
    isTableEmpty(): boolean {
      return this.filteredGoals.length === 0
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
      return (
        this.displayedPages.length > 0 &&
        this.displayedPages[this.displayedPages.length - 1] < this.totalPages - 1
      )
    },
    showLastPage(): boolean {
      return (
        this.displayedPages.length > 0 &&
        this.displayedPages[this.displayedPages.length - 1] < this.totalPages
      )
    },
  },

  methods: {
    t(key: keyof typeof goalsTexts.English) {
      const texts = goalsTexts[this.selectedLanguage as 'English' | 'Turkish']
      return (texts as Record<string, string>)[key] ?? key
    },
    changePage(p: number) {
      if (p >= 1 && p <= this.totalPages) this.$emit('changePage', p)
    },
    formatAmount(val: number): string {
      if (val == null || Number.isNaN(val)) return '0.00'
      return Number(val).toFixed(2)
    },
    formatPercent(val: number): string {
      if (val == null || Number.isNaN(val)) return '0%'
      return Number(val).toFixed(1) + '%'
    },
    displayCurrentAmount(goal: Goal): number {
      return goal.currentAmount ?? goal.initialAmount ?? 0
    },
    displayProgress(goal: Goal): number {
      if (goal.progressPercentage != null && !Number.isNaN(goal.progressPercentage)) {
        return goal.progressPercentage
      }
      const target = goal.targetAmount ?? 0
      if (target === 0) return 0
      const current = this.displayCurrentAmount(goal)
      return (current / target) * 100
    },
    statusClass(goal: Goal): string {
      if (goal.isCompleted) return 'status-ok'
      return 'status-warning'
    },
    statusLabel(goal: Goal): string {
      return goal.isCompleted ? this.t('completed') : this.t('inProgress')
    },
    disablePastDates(date: Date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date < today
    },
    showCreateModalOpen() {
      this.newGoal = { name: '', targetAmount: 0, currentAmount: 0, deadline: '' }
      this.createError = ''
      this.showCreateModal = true
    },
    hideCreateModal() {
      this.showCreateModal = false
      this.createError = ''
    },
    submitCreate() {
      this.createError = ''
      const name = (this.newGoal.name || '').trim()
      const targetAmount = Number(this.newGoal.targetAmount)
      const currentAmount = Number(this.newGoal.currentAmount)
      const deadline = this.newGoal.deadline
      if (!name) {
        this.createError = this.t('enterName')
        return
      }
      if (targetAmount <= 0 || !Number.isFinite(targetAmount)) {
        this.createError = this.t('enterTargetAmount')
        return
      }
      if (!deadline) {
        this.createError = this.t('selectDeadline')
        return
      }
      const rawDeadline = this.newGoal.deadline as any
      const isoDeadline =
        rawDeadline instanceof Date
          ? rawDeadline.toISOString()
          : new Date(String(rawDeadline) + 'T12:00:00').toISOString()
      this.$emit('createGoal', {
        name,
        targetAmount,
        initialAmount: currentAmount,
        currentAmount,
        deadline: isoDeadline,
      })
      this.hideCreateModal()
    },
    openEditModal(goal: Goal) {
      this.editingGoal = goal
      const cur = goal.currentAmount ?? goal.initialAmount ?? 0
      const deadlineVal = goal.deadline
        ? goal.deadline.includes('T')
          ? new Date(goal.deadline)
          : goal.deadline.slice(0, 10)
        : ''
      this.editForm = {
        name: goal.name ?? '',
        targetAmount: goal.targetAmount ?? 0,
        currentAmount: cur,
        deadline: deadlineVal,
      }
      this.editError = ''
      this.showEditModal = true
    },
    hideEditModal() {
      this.showEditModal = false
      this.editingGoal = null
      this.editError = ''
    },
    submitEdit() {
      this.editError = ''
      if (!this.editingGoal) return
      const name = (this.editForm.name || '').trim()
      const targetAmount = Number(this.editForm.targetAmount)
      const currentAmount = Number(this.editForm.currentAmount)
      const deadline = this.editForm.deadline
      if (!name) {
        this.editError = this.t('enterName')
        return
      }
      if (targetAmount <= 0 || !Number.isFinite(targetAmount)) {
        this.editError = this.t('enterTargetAmount')
        return
      }
      if (!deadline) {
        this.editError = this.t('selectDeadline')
        return
      }
      const rawDeadline = this.editForm.deadline as any
      const isoDeadline =
        rawDeadline instanceof Date
          ? rawDeadline.toISOString()
          : new Date(String(rawDeadline) + 'T12:00:00').toISOString()
      this.$emit('updateGoal', {
        id: this.editingGoal.id,
        name,
        targetAmount,
        initialAmount: currentAmount,
        currentAmount,
        deadline: isoDeadline,
      })
      this.hideEditModal()
    },
    async confirmDelete(goal: Goal) {
      const confirmed = await this.confirm.ask({
        title: this.t('deleteGoal'),
        message: this.t('confirmDeleteGoal'),
        confirmText: this.t('deleteGoal'),
        type: 'danger'
      })
      if (confirmed) this.$emit('deleteGoal', goal.id)
    },
  },
}
</script>

<style scoped lang="scss">
.goals-table-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: 1.25rem 1rem;

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
    font-size: 1.125rem;
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

  .header__title-skeleton {
    width: 200px;
    height: 1.5rem;
    border-radius: 4px;

    @media (max-width: 1024px) {
      display: none;
    }
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
    font-size: 0.75rem;
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

  .filter-input {
    min-width: 12rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    color: var(--header-text-color);
    font-size: 0.75rem;
    &:focus {
      outline: none;
      border-color: var(--primary-green-color);
      box-shadow: 0 0 0 2px rgba(92, 184, 92, 0.2);
    }
  }

  .filter-select {
    min-width: 10rem;
    :deep(.select-trigger) {
      padding: 0.35rem 0.75rem;
      border-radius: var(--border-radius);
      border: 1px solid var(--border-color);
      background-color: var(--background-color);
      color: var(--header-text-color);
      font-size: 0.75rem;
      height: auto;
      min-height: auto;
      cursor: pointer;
    }
  }

  .filter-group {
    min-width: 0;
  }

  .filter-select {
    appearance: auto;
    cursor: pointer;
  }

  .btn-skeleton {
    width: 100px;
    height: 2.25rem;
    border-radius: var(--border-radius);
  }

  .filter-skeleton {
    width: 10rem;
    height: 2.25rem;
    border-radius: var(--border-radius);
    &.search-skeleton {
      width: 12rem;

      @media (max-width: 1024px) {
        width: 100%;
      }
    }
  }

  .row-skeleton {
    width: 80%;
    height: 1rem;
    border-radius: 4px;
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
    grid-template-columns: minmax(0, 1fr) 6.5rem 6.5rem 5rem minmax(5rem, 1fr) minmax(7.75rem, auto);
    gap: 1rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--border-color);
    font-weight: 600;
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
    grid-template-columns: minmax(0, 1fr) 6.5rem 6.5rem 5rem minmax(5rem, 1fr) minmax(7.75rem, auto);
    gap: 1rem;
    padding: 0.7rem 1rem;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
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

    .pagination-results {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--normal-text-color);
      white-space: nowrap;
    }
    .pagination-results-icon {
      color: var(--header-text-color);
      font-size: 0.875rem;
    }
    .page-size-select-premium {
      :deep(.select-trigger) {
        padding: 0;
        border: none;
        background: transparent;
        height: auto;
        min-width: 0;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--header-text-color);
        gap: 0.25rem;

        &:hover {
          background: transparent;
          color: var(--primary-green-color);
        }

        .select-icon {
          font-size: 0.65rem;
        }
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
      border: 1px solid var(--primary-green-color);
      border-radius: var(--border-radius);
      background-color: var(--primary-green-color);
      color: white;
      cursor: pointer;
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
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
    }
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

  .col {
    min-width: 0;
  }

  .col-name,
  .col-target,
  .col-current,
  .col-percent,
  .col-status {
    display: flex;
    align-items: center;
    min-height: 2rem;
  }

  .col-actions {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.35rem;
    min-width: 0;

    .row-action-btn {
      flex-shrink: 0;
    }
  }

  .col-mobile-label,
  .col-mobile-label-skeleton {
    display: none;
  }

  .goal-name {
    min-width: 0;
    font-weight: 600;
    color: var(--header-text-color);
    font-size: 0.8rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .col-value {
    font-size: 0.75rem;
    color: var(--normal-text-color);
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: var(--border-radius);
    font-size: 0.7rem;
    &.status-ok {
      background-color: rgba(92, 184, 92, 0.15);
      color: var(--primary-green-color);
    }
    &.status-warning {
      background-color: rgba(196, 160, 80, 0.18);
      color: #b8860b;
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

    .datepicker-wrapper {
      width: 100%;
      :deep(.mx-datepicker) {
        width: 100%;
      }
      :deep(.mx-input) {
        width: 100%;
        height: 2.75rem;
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        background-color: var(--background-color);
        color: var(--header-text-color);
        font-size: 0.9375rem;
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
    }

    .input-with-prefix {
      display: flex;
      align-items: stretch;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      background-color: var(--background-color);
      overflow: hidden;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
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
}

@media (max-width: 1024px) {
  .goals-table-container {
    padding: 1rem;
    .header {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }
    .header__title {
      display: none;
    }
    .header__toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }
    .toolbar-actions {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    .toolbar-actions .btn,
    .toolbar-actions .btn-skeleton {
      width: 100%;
      min-height: 2.75rem;
      font-size: 0.875rem;
    }
    .toolbar-actions .btn-skeleton {
      height: auto;
    }
    .toolbar-filters {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }
    .filter-input,
    .filter-select,
    .filter-skeleton {
      width: 100%;
      min-width: 0;
    }
    .filter-skeleton {
      min-height: 2.75rem;
      height: auto;
    }
    .table-header {
      display: none !important;
    }
    .table-row.goal-card,
    .table-row.skeleton-row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      margin-bottom: 0.75rem;
      .col {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        width: 100%;
      }
      .col-mobile-label {
        display: inline;
        min-width: 5rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--normal-text-color);
      }
      .col-mobile-label-skeleton {
        display: block;
        width: 100px;
        height: 1rem;
        border-radius: 4px;
        flex-shrink: 0;
      }
      .col-actions {
        margin-top: 0.5rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-color);
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: flex-start;
        gap: 0.35rem;

        .row-action-btn {
          flex-shrink: 0;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .goals-table-container {
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
    display: none;
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

  .toolbar-actions .btn,
  .toolbar-actions .btn-skeleton {
    width: 100%;
    min-width: 0;
    min-height: 2.75rem;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    box-sizing: border-box;
  }
  .toolbar-actions .btn-skeleton {
    height: auto;
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
  .filter-select,
  .filter-skeleton {
    width: 100%;
    min-width: 0;
    max-width: none;
    min-height: 2.75rem;
    font-size: 1rem;
    box-sizing: border-box;
  }
  .filter-skeleton {
    height: auto;
  }

  .table-wrap {
    overflow: visible;
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

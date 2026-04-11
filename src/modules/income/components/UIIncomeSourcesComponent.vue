<template>
  <div class="income-sources-container">
    <div class="header">
      <div v-if="loading" class="skeleton-box title-skeleton"></div>
      <h1 v-else class="title">
        {{ selectedLanguage == 'English' ? 'Income Sources' : 'Gelir Kaynakları' }}
      </h1>
      <div v-if="loading" class="header-actions">
        <div class="skeleton-box btn-skeleton"></div>
        <div class="skeleton-box date-skeleton"></div>
      </div>
      <div v-else class="header-actions">
        <button class="add-source-btn" @click="showAddModal">
          {{ selectedLanguage == 'English' ? 'Add Source' : 'Kaynak Ekle' }}
        </button>
        <div class="date-range-picker-wrap">
          <Datepicker
            :value="dateRangeModel"
            range
            :placeholder="selectedLanguage == 'English' ? 'Date range' : 'Tarih aralığı'"
            :disabled-date="disableFutureDates"
            :shortcuts="dateRangeShortcuts"
            popup-class="income-datepicker-popup"
            @update:value="onDateRangeChange"
          />
        </div>
      </div>
    </div>

    <div class="table-wrap" :class="{ 'table-wrap--empty': isTableEmpty }">
      <div v-if="incomeSources && incomeSources.length > 0" class="table" role="table">
        <div v-if="loading" class="table-header" role="row">
          <div class="col col-name" role="columnheader"><div class="skeleton-box header-skeleton"></div></div>
          <div class="col col-type" role="columnheader"><div class="skeleton-box header-skeleton"></div></div>
          <div class="col col-amount" role="columnheader"><div class="skeleton-box header-skeleton"></div></div>
          <div class="col col-actions" role="columnheader"><div class="skeleton-box header-skeleton"></div></div>
        </div>
        <div v-else class="table-header" role="row">
          <div class="col col-name" role="columnheader">
            {{ selectedLanguage == 'English' ? 'Name' : 'Ad' }}
          </div>
          <div class="col col-type" role="columnheader">
            {{ selectedLanguage == 'English' ? 'Type' : 'Tür' }}
          </div>
          <div class="col col-amount" role="columnheader">
            {{ selectedLanguage == 'English' ? 'Amount' : 'Miktar' }}
          </div>
          <div class="col col-actions" role="columnheader">
            {{ selectedLanguage == 'English' ? 'Actions' : 'İşlemler' }}
          </div>
        </div>
        <template v-if="loading">
          <div v-for="i in 5" :key="i" class="table-row skeleton-row" role="row">
            <div class="col col-name"><div class="skeleton-box row-skeleton"></div></div>
            <div class="col col-type"><div class="skeleton-box row-skeleton"></div></div>
            <div class="col col-amount"><div class="skeleton-box row-skeleton"></div></div>
            <div class="col col-actions"><div class="skeleton-box row-skeleton"></div></div>
          </div>
        </template>
        <template v-else>
          <div v-for="(source, index) in incomeSources" :key="index" class="table-row income-card" role="row">
            <div class="col col-name">
              <span class="col-mobile-label">{{ selectedLanguage == 'English' ? 'Name' : 'Ad' }}</span>
              <div class="source-name">{{ source.name }}</div>
            </div>
            <div class="col col-type">
              <span class="col-mobile-label">{{ selectedLanguage == 'English' ? 'Type' : 'Tür' }}</span>
              <span class="col-value">{{ isRecurrent(source) }} – {{ source.method }}</span>
            </div>
            <div class="col col-amount">
              <span class="col-mobile-label">{{ selectedLanguage == 'English' ? 'Amount' : 'Miktar' }}</span>
              <span class="col-value">{{ formatCurrency(source.amount) }}</span>
            </div>
            <div class="col col-actions">
              <span class="col-mobile-label">{{ selectedLanguage == 'English' ? 'Actions' : 'İşlemler' }}</span>
              <div class="col-actions-buttons">
                <button
                  type="button"
                  class="row-action-btn"
                  @click="openEditModal(source)"
                  :aria-label="selectedLanguage == 'English' ? 'Edit source' : 'Kaynağı düzenle'"
                >
                  <font-awesome-icon :icon="actionIcons.edit" class="action-icon" />
                </button>
                <button
                  type="button"
                  class="row-action-btn"
                  @click="deleteSource(source)"
                  :aria-label="selectedLanguage == 'English' ? 'Delete source' : 'Kaynağı sil'"
                >
                  <font-awesome-icon :icon="actionIcons.delete" class="delete-icon" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div v-if="isTableEmpty" class="empty-state">
        <div class="empty-state__icon-wrap">
          <font-awesome-icon
            :icon="emptyStateIcons.incomeSources"
            class="empty-state__icon"
            aria-hidden="true"
          />
        </div>
        <h2 class="empty-state__heading">
          {{ selectedLanguage == 'English' ? 'No income sources yet' : 'Henüz gelir kaynağı yok' }}
        </h2>
        <p class="empty-state__text">
          {{
            selectedLanguage == 'English'
              ? 'Add your first income source to start tracking your earnings.'
              : 'Kazançlarınızı takip etmek için ilk gelir kaynağınızı ekleyin.'
          }}
        </p>
      </div>
    </div>

    <!-- Pagination bar (layout like reference: page size dropdown left, page nav right) -->
    <div v-if="loading" class="pagination-bar pagination-bar--skeleton">
      <div class="skeleton-box pagination-skeleton"></div>
    </div>
    <div v-else-if="incomeSources && incomeSources.length > 0 && totalPages > 0" class="pagination-bar">
      <div class="pagination-results">
        <font-awesome-icon
          :icon="paginationIcons.results"
          class="pagination-results-icon"
          aria-hidden="true"
        />
        <select
          :value="pageSize"
          class="page-size-select"
          :aria-label="selectedLanguage == 'English' ? 'Results per page' : 'Sayfa başına sonuç'"
          @change="onPageSizeChange"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
        <span class="pagination-results-label">
          {{ selectedLanguage == 'English' ? 'of' : '/' }}
          <span class="pagination-total">{{ totalCount }}</span>
          {{ selectedLanguage == 'English' ? 'results' : 'sonuç' }}
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

    <div v-if="isAddModalVisible" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            {{
              editingSourceId != null
                ? selectedLanguage == 'English'
                  ? 'Edit Income'
                  : 'Geliri Düzenle'
                : selectedLanguage == 'English'
                  ? 'Income Add Module'
                  : 'Gelir Ekleme Modülü'
            }}
          </h3>
          <button type="button" class="close-btn" @click="hideAddModal" aria-label="Close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="income-source-name">{{
              selectedLanguage == 'English' ? 'Name' : 'Ad'
            }}</label>
            <input
              id="income-source-name"
              type="text"
              v-model="newSource.name"
              :placeholder="
                selectedLanguage == 'English' ? 'Enter income name' : 'Gelir adını girin'
              "
              class="modal-input"
              :aria-invalid="!!(errorMessage && errorMessage.toLowerCase().includes('name'))"
            />
          </div>
          <div class="form-group">
            <label for="income-source-amount">{{
              selectedLanguage == 'English' ? 'Amount' : 'Miktar'
            }}</label>
            <div class="input-with-prefix">
              <span class="input-prefix">{{ currencySymbol }}</span>
              <input
                id="income-source-amount"
                type="number"
                v-model="newSource.amount"
                :placeholder="selectedLanguage == 'English' ? '0.00' : '0,00'"
                class="modal-input"
                min="0"
                step="0.01"
                :aria-invalid="
                  !!(
                    errorMessage &&
                    (errorMessage.toLowerCase().includes('amount') ||
                      errorMessage.toLowerCase().includes('miktar'))
                  )
                "
              />
            </div>
          </div>
          <div class="form-group">
            <label for="income-source-method">{{
              selectedLanguage == 'English' ? 'Payment method' : 'Ödeme yöntemi'
            }}</label>
            <input
              id="income-source-method"
              type="text"
              v-model="newSource.method"
              :placeholder="
                selectedLanguage == 'English' ? 'e.g. Bank transfer, Cash' : 'Örn. Havale, Nakit'
              "
              class="modal-input"
              :aria-invalid="
                !!(
                  errorMessage &&
                  (errorMessage.toLowerCase().includes('payment') ||
                    errorMessage.toLowerCase().includes('ödeme'))
                )
              "
            />
          </div>
          <div class="form-group">
            <label for="income-source-date">{{
              selectedLanguage == 'English' ? 'Transaction date' : 'İşlem tarihi'
            }}</label>
            <div class="datepicker-wrapper">
              <Datepicker
                v-model:value="newSource.transactionDate"
                :placeholder="selectedLanguage == 'English' ? 'Select date' : 'Tarih seçin'"
              />
            </div>
          </div>
          <div class="form-group">
            <span class="form-group-label">{{
              selectedLanguage == 'English' ? 'Frequency' : 'Sıklık'
            }}</span>
            <div class="frequency-segmented">
              <button
                type="button"
                :class="['frequency-option', { active: newSource.isRecurring === true }]"
                @click="newSource.isRecurring = true"
              >
                {{ selectedLanguage == 'English' ? 'Periodic' : 'Periyodik' }}
              </button>
              <button
                type="button"
                :class="['frequency-option', { active: newSource.isRecurring === false }]"
                @click="newSource.isRecurring = false"
              >
                {{ selectedLanguage == 'English' ? 'One-time' : 'Tek seferlik' }}
              </button>
            </div>
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <button type="button" class="add-btn" @click="submitIncomeSource">
            {{
              editingSourceId != null
                ? selectedLanguage == 'English'
                  ? 'Save'
                  : 'Kaydet'
                : selectedLanguage == 'English'
                  ? 'Add Income'
                  : 'Gelir Ekle'
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { IncomeSource } from '@/interfaces/IncomeSources'
import {
  arrowIcons,
  actionIcons,
  emptyStateIcons,
  paginationIcons,
} from '@/icons/fontawesome-icons'
import { useCurrency } from '@/composables/useCurrency'
import Datepicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'

export default {
  name: 'UIIncomeSourcesComponent',
  components: {
    Datepicker,
  },
  setup() {
    const { formatCurrency, currencySymbol } = useCurrency()
    return { formatCurrency, currencySymbol }
  },
  data() {
    return {
      isAddModalVisible: false,
      errorMessage: '',
      newSource: {
        name: '',
        amount: null,
        isRecurring: false,
        method: '',
        transactionDate: '',
      },
      arrowIcons,
      actionIcons,
      emptyStateIcons,
      paginationIcons,
      pageSizeOptions: [5, 10, 25, 50, 100],
      editingSourceId: null as number | null,
    }
  },
  props: {
    incomeSources: {
      type: Array as () => {
        id: number
        name: string
        amount: number
        isRecurring: boolean
        method: string
      }[],
      required: true,
    },

    hasMoreItems: {
      type: Boolean,
      required: true,
    },

    selectedLanguage: {
      type: String,
      default: 'English',
    },

    pageNumber: {
      type: Number,
      required: true,
    },
    pageSize: {
      type: Number,
      required: true,
    },
    totalCount: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
      default: null,
    },
    endDate: {
      type: String,
      default: null,
    },
    getIncomeById: {
      type: Function,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    dateRangeShortcuts(): Array<{ text: string; onClick: () => [Date, Date] }> {
      const toDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const isEn = this.selectedLanguage === 'English'
      return [
        {
          text: isEn ? 'Today' : 'Bugün',
          onClick: () => {
            const d = toDate(new Date())
            return [d, d]
          },
        },
        {
          text: isEn ? 'Yesterday' : 'Dün',
          onClick: () => {
            const d = toDate(new Date())
            d.setDate(d.getDate() - 1)
            return [d, d]
          },
        },
        {
          text: isEn ? 'This week' : 'Bu hafta',
          onClick: () => {
            const end = toDate(new Date())
            const start = toDate(new Date())
            const day = start.getDay()
            const diff = start.getDate() - day + (day === 0 ? -6 : 1)
            start.setDate(diff)
            return [start, end]
          },
        },
        {
          text: isEn ? 'Last week' : 'Geçen hafta',
          onClick: () => {
            const end = toDate(new Date())
            const day = end.getDay()
            const diff = end.getDate() - day + (day === 0 ? -6 : 1)
            end.setDate(diff - 1)
            const start = toDate(new Date(end))
            start.setDate(start.getDate() - 6)
            return [start, end]
          },
        },
        {
          text: isEn ? 'Last 7 days' : 'Son 7 gün',
          onClick: () => {
            const end = toDate(new Date())
            const start = toDate(new Date())
            start.setDate(start.getDate() - 7)
            return [start, end]
          },
        },
        {
          text: isEn ? 'Last 30 days' : 'Son 30 gün',
          onClick: () => {
            const end = toDate(new Date())
            const start = toDate(new Date())
            start.setDate(start.getDate() - 30)
            return [start, end]
          },
        },
        {
          text: isEn ? 'This month' : 'Bu ay',
          onClick: () => {
            const end = toDate(new Date())
            const start = toDate(new Date())
            start.setDate(1)
            return [start, end]
          },
        },
        {
          text: isEn ? 'Last month' : 'Geçen ay',
          onClick: () => {
            const end = toDate(new Date())
            end.setMonth(end.getMonth() - 1)
            end.setDate(0)
            const start = toDate(new Date(end))
            start.setDate(1)
            return [start, end]
          },
        },
        {
          text: isEn ? 'This period' : 'Bu dönem',
          onClick: () => {
            const end = toDate(new Date())
            const start = toDate(new Date())
            start.setDate(1)
            return [start, end]
          },
        },
        {
          text: isEn ? 'Last period' : 'Geçen dönem',
          onClick: () => {
            const end = toDate(new Date())
            end.setMonth(end.getMonth() - 1)
            end.setDate(0)
            const start = toDate(new Date(end))
            start.setDate(1)
            return [start, end]
          },
        },
        {
          text: isEn ? 'This year' : 'Bu yıl',
          onClick: () => {
            const end = toDate(new Date())
            const start = toDate(new Date())
            start.setMonth(0)
            start.setDate(1)
            return [start, end]
          },
        },
        {
          text: isEn ? 'Last year' : 'Geçen yıl',
          onClick: () => {
            const end = toDate(new Date())
            end.setFullYear(end.getFullYear() - 1)
            end.setMonth(11)
            end.setDate(31)
            const start = toDate(new Date(end))
            start.setMonth(0)
            start.setDate(1)
            return [start, end]
          },
        },
        {
          text: isEn ? 'Last 90 days' : 'Son 90 gün',
          onClick: () => {
            const end = toDate(new Date())
            const start = toDate(new Date())
            start.setDate(start.getDate() - 90)
            return [start, end]
          },
        },
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
      const src = this.incomeSources
      return !src || !Array.isArray(src) || src.length === 0
    },
    displayedPages() {
      // Display up to 5 page numbers around the current page
      const maxVisiblePages = 5
      const halfVisible = Math.floor(maxVisiblePages / 2)

      let startPage = Math.max(1, this.pageNumber - halfVisible)
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
    isRecurrent(source: IncomeSource) {
      if (this.selectedLanguage == 'Turkish') {
        if (source.isRecurring) {
          return 'Periyodik'
        } else {
          return 'Tek seferlik'
        }
      }
      if (this.selectedLanguage == 'English') {
        if (source.isRecurring) {
          return 'Periodic'
        } else {
          return 'One-time'
        }
      }
    },
    changePage(pageNumber: number) {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.$emit('changePage', pageNumber)
      }
    },
    onDateRangeChange(value: [Date, Date] | Date | null) {
      if (!value || !Array.isArray(value) || value.length < 2) {
        this.$emit('updateDateRange', null, null)
        return
      }
      const [start, end] = value
      const toYmd = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      this.$emit('updateDateRange', toYmd(start), toYmd(end))
    },
    onPageSizeChange(event: Event) {
      const target = event.target as HTMLSelectElement
      const size = parseInt(target.value, 10)
      if (!isNaN(size) && this.pageSizeOptions.includes(size)) {
        this.$emit('updatePageSize', size)
      }
    },
    disableFutureDates(date: Date): boolean {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return date.getTime() > today.getTime()
    },

    deleteSource(source: IncomeSource) {
      this.$emit('deleteSource', source)
    },
    showAddModal() {
      this.isAddModalVisible = true
    },
    hideAddModal() {
      this.isAddModalVisible = false
      this.errorMessage = ''
      this.editingSourceId = null
      this.resetNewSource()
    },
    async openEditModal(source: IncomeSource) {
      try {
        const data = await this.getIncomeById(source.id)
        this.editingSourceId = data.id ?? source.id
        const txDate = data.transactionDate
        this.newSource = {
          name: data.name,
          amount: data.amount,
          isRecurring: data.isRecurring,
          method: data.method,
          transactionDate: (txDate ? new Date(txDate) : '') as string,
        }
        this.isAddModalVisible = true
      } catch (e) {
        console.error('Failed to load income for edit:', e)
      }
    },
    resetNewSource() {
      this.newSource = {
        name: '',
        amount: null,
        isRecurring: false,
        method: '',
        transactionDate: '',
      }
    },
    submitIncomeSource() {
      this.errorMessage = ''

      if (!this.newSource.name) {
        this.errorMessage =
          this.selectedLanguage === 'English'
            ? 'Please enter income name'
            : 'Lütfen gelir adını girin'
        return
      }

      if (!this.newSource.amount) {
        this.errorMessage =
          this.selectedLanguage === 'English' ? 'Please enter amount' : 'Lütfen miktar girin'
        return
      }

      const amount = parseFloat(this.newSource.amount)
      if (isNaN(amount) || amount <= 0) {
        this.errorMessage =
          this.selectedLanguage === 'English'
            ? 'Please enter a valid positive amount'
            : 'Lütfen geçerli bir pozitif miktar girin'
        return
      }

      if (!this.newSource.method) {
        this.errorMessage =
          this.selectedLanguage === 'English'
            ? 'Please enter payment type'
            : 'Lütfen ödeme türünü girin'
        return
      }

      const dateVal = this.newSource.transactionDate
      if (!dateVal) {
        this.errorMessage =
          this.selectedLanguage === 'English'
            ? 'Please select transaction date'
            : 'Lütfen işlem tarihini seçin'
        return
      }

      const d = (dateVal as unknown) instanceof Date ? (dateVal as unknown as Date) : null
      const transactionDateStr = d
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        : String(dateVal)

      const payload = {
        name: this.newSource.name,
        amount,
        isRecurring: this.newSource.isRecurring,
        method: this.newSource.method,
        transactionDate: transactionDateStr,
      }

      if (this.editingSourceId != null) {
        this.$emit('updateIncomeSource', this.editingSourceId, payload)
      } else {
        this.$emit('addIncomeSource', payload)
      }
      this.hideAddModal()
    },
  },
}
</script>

<style scoped lang="scss">
.income-sources-container {
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

  .header .title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--header-text-color);
    flex-shrink: 0;
  }

  .header .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: nowrap;
    flex-shrink: 0;
  }

  .header .add-source-btn {
    flex-shrink: 0;
    background-color: var(--primary-green-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.8125rem;
    white-space: nowrap;

    &:hover {
      opacity: var(--hover-opacity);
    }
  }

  .title-skeleton {
    width: 200px;
    height: 1.5rem;
    border-radius: 4px;
    margin: 0;
  }

  .btn-skeleton {
    width: 100px;
    height: 2.25rem;
    border-radius: var(--border-radius);
  }

  .date-skeleton {
    width: 12rem;
    height: 2.25rem;
    border-radius: var(--border-radius);
  }

  .row-skeleton {
    width: 80%;
    height: 1rem;
    border-radius: 4px;
  }

  .header .date-range-picker-wrap {
    flex-shrink: 0;
    min-width: 12rem;
    cursor: pointer;

    :deep(.mx-datepicker) {
      width: 100%;
      min-width: 0;
      cursor: pointer;
    }

    :deep(.mx-input) {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      cursor: pointer;
      font-size: 0.8125rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--border-radius);
      border: 1px solid var(--border-color);
      background-color: var(--background-color);
      color: var(--header-text-color);
    }
  }

  .table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
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
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  /* Balanced columns: Name & Type share space, Amount and Actions fixed width */
  .table-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 6rem 5.5rem;
    gap: 1rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--border-color);
    font-weight: 600;
    font-size: 0.75rem;
    color: var(--normal-text-color);
    text-transform: uppercase;
    letter-spacing: 0.05em;

    .header-skeleton {
      width: 80%;
      height: 0.75rem;
      border-radius: 4px;
    }

    .col {
      text-align: left;
    }

    .col-actions {
      justify-content: flex-start;
    }
  }

  .table-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 6rem 5.5rem;
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
    text-align: left;
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
    color: var(--primary-green-color);
    font-size: 0.8125rem;
    text-align: left;
  }

  .col-actions {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
  }

  .col-actions-buttons {
    display: flex;
    align-items: center;
    gap: 0.25rem;
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
    background-color: rgba(92, 184, 92, 0.12);
    color: var(--primary-green-color);
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
    padding: 1rem 0 0;
    margin-top: 0.5rem;
    border-top: 1px solid var(--border-color);

    &--skeleton {
      justify-content: center;
      padding: 1rem 0;
    }

    .pagination-skeleton {
      width: 100%;
      max-width: 400px;
      height: 2.25rem;
      border-radius: var(--border-radius);
    }
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

    .pagination-count,
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
        border-top-right-radius: var(--border-radius);
        border-bottom-right-radius: var(--border-radius);

        &:focus {
          box-shadow: none;
        }

        /* Hide number input spinners to avoid buggy right-edge appearance */
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

      :deep(.mx-input-wrapper .mx-icon),
      :deep(.mx-calendar-icon) {
        cursor: pointer;
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
}
@media (max-width: 1024px) {
  .income-sources-container {
    flex: 1 1 auto;
    min-height: 0;
    height: auto;
  }

  .header .date-range-picker-wrap {
    width: 12rem;
    min-width: 10rem;
  }

  .table-wrap {
    min-height: 12rem;
  }
}

@media (max-width: 768px) {
  .income-sources-container {
    width: 100%;
    min-height: 0;
    height: auto;
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1rem;
    gap: 0.75rem;
  }

  .header .title {
    display: none; /* Remove "Income Sources" header on mobile */
  }

  .header .header-actions {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 0.75rem;
  }

  .header .add-source-btn {
    width: 100%;
    min-height: 2.75rem;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }

  .header .date-range-picker-wrap {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .header .date-range-picker-wrap :deep(.mx-datepicker) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  .header .date-range-picker-wrap :deep(.mx-input) {
    width: 100%;
    min-height: 2.75rem;
    font-size: 1rem;
    padding: 0.625rem 0.75rem;
  }

  .table-wrap {
    overflow: visible;
    min-height: 10rem;
  }

  .income-sources-container .table-header,
  .table .table-header {
    display: none !important;
  }

  .table-row.income-card {
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

  .table-row.income-card:last-child {
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

  .table-row .col-name .source-name,
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

  .table-row .col-actions-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .empty-state {
    min-height: 14rem;
    padding: 2rem 1.5rem;
  }

  .empty-state__icon-wrap {
    width: 4.5rem;
    height: 4.5rem;
    margin-bottom: 1.25rem;
  }

  .empty-state__icon {
    font-size: 2rem;
  }

  .empty-state__heading {
    font-size: 1.2rem;
  }

  .empty-state__text {
    font-size: 0.9375rem;
  }

  .pagination-bar {
    flex-direction: column;
    align-items: flex-start;
    padding-top: 0.75rem;
  }

  .pagination-nav {
    width: 100%;
    justify-content: flex-end;
  }

  .modal-content {
    width: 90%;
    max-width: none;

    .modal-body {
      padding: 1rem;
    }

    .modal-input,
    .datepicker-wrapper :deep(.mx-input) {
      height: 2.5rem;
      font-size: 0.875rem;
    }

    .frequency-segmented .frequency-option {
      font-size: 0.8125rem;
      padding: 0.45rem 0.75rem;
    }

    .error-message {
      font-size: 0.8rem;
    }

    .modal-header h3 {
      font-size: 1.125rem;
    }
  }
}
</style>

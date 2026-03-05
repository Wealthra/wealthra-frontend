<template>
  <div class="income-sources-container">
    <div class="header">
      <div class="title">
        {{ selectedLanguage == 'English' ? 'Income Sources' : 'Gelir Kaynakları' }}
      </div>
      <button class="add-source-btn" @click="showAddModal">
        {{ selectedLanguage == 'English' ? 'Add Source' : 'Kaynak Ekle' }}
      </button>
    </div>
    <div class="sources-list" v-if="incomeSources && incomeSources.length > 0">
      <div v-for="(source, index) in incomeSources" :key="index" class="source-item">
        <div class="source-info">
          <div class="source-details">
            <div class="source-name">{{ source.name }}</div>
            <div class="source-type">{{ isRecurrent(source) }} - {{ source.method }}</div>
          </div>
        </div>
        <div class="source-amount">${{ source.amount }}</div>
        <div class="source-actions" @click="deleteSource(source)">
          <font-awesome-icon :icon="actionIcons.delete" class="delete-icon" />
        </div>
      </div>
    </div>

    <div v-if="!incomeSources || incomeSources?.length === 0" class="no-income">
      {{
        selectedLanguage == 'English'
          ? '💰 No income sources available 💰'
          : '💰 Hiç gelir kaynağı yok 💰'
      }}
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="incomeSources && incomeSources.length > 0">
      <button
        :disabled="pageNumber === 1"
        @click="changePage(pageNumber - 1)"
        class="pagination-btn"
      >
        <font-awesome-icon :icon="arrowIcons.left" class="arrow-left" />
      </button>

      <span
        v-for="page in displayedPages"
        :key="page"
        :class="['page-number', { active: page === pageNumber }]"
        @click="changePage(page)"
      >
        {{ page }}
      </span>

      <span v-if="showEllipsis" class="ellipsis">...</span>

      <span
        v-if="showLastPage"
        :class="['page-number', { active: totalPages === pageNumber }]"
        @click="changePage(totalPages)"
      >
        {{ totalPages }}
      </span>

      <button
        :disabled="pageNumber === totalPages || totalPages === 0"
        @click="changePage(pageNumber + 1)"
        class="pagination-btn"
      >
        <font-awesome-icon :icon="arrowIcons.right" class="arrow-right" />
      </button>
    </div>

    <div v-if="isAddModalVisible" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ selectedLanguage == 'English' ? 'Income Add Module' : 'Gelir Ekleme Modülü' }}</h3>
          <button class="close-btn" @click="hideAddModal">&times;</button>
        </div>
        <div class="modal-body">
          <input
            type="text"
            v-model="newSource.name"
            :placeholder="selectedLanguage == 'English' ? 'Enter income name' : 'Gelir adını girin'"
            class="modal-input"
          />
          <input
            type="number"
            v-model="newSource.amount"
            :placeholder="
              selectedLanguage == 'English' ? 'Enter income amount' : 'Gelir miktarını girin'
            "
            class="modal-input"
          />
          <input
            type="text"
            v-model="newSource.method"
            :placeholder="
              selectedLanguage == 'English'
                ? 'Enter income payment method'
                : 'Gelir ödeme yöntemini girin'
            "
            class="modal-input"
          />
          <input
            type="date"
            v-model="newSource.transactionDate"
            :placeholder="
              selectedLanguage == 'English'
                ? 'Select transaction date'
                : 'İşlem tarihini seçin'
            "
            class="modal-input"
          />
          <div class="frequency-buttons">
            <button
              :class="['frequency-btn', newSource.isRecurring === true ? 'active' : '']"
              @click="newSource.isRecurring = true"
            >
              {{ selectedLanguage == 'English' ? 'Periodic' : 'Periyodik' }}
            </button>
            <button
              :class="['frequency-btn', newSource.isRecurring === false ? 'active' : '']"
              @click="newSource.isRecurring = false"
            >
              {{ selectedLanguage == 'English' ? 'One-time' : 'Tek seferlik' }}
            </button>
          </div>
          <button class="add-btn" @click="addIncomeSource">
            {{ selectedLanguage == 'English' ? 'Add Income' : 'Gelir Ekle' }}
          </button>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { IncomeSource } from '@/interfaces/IncomeSources'
import { arrowIcons, actionIcons } from '@/icons/fontawesome-icons'

export default {
  name: 'UIIncomeSourcesComponent',
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
  },

  computed: {
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

    deleteSource(source: IncomeSource) {
      this.$emit('deleteSource', source)
    },
    showAddModal() {
      this.isAddModalVisible = true
    },
    hideAddModal() {
      this.isAddModalVisible = false
      this.errorMessage = ''
      this.resetNewSource()
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
    addIncomeSource() {
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

      if (!this.newSource.transactionDate) {
        this.errorMessage =
          this.selectedLanguage === 'English'
            ? 'Please select transaction date'
            : 'Lütfen işlem tarihini seçin'
        return
      }

      const newIncomeSource = {
        name: this.newSource.name,
        amount: amount,
        isRecurring: this.newSource.isRecurring,
        method: this.newSource.method,
        transactionDate: this.newSource.transactionDate,
      }

      this.$emit('addIncomeSource', newIncomeSource)
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
  height: 80%;
  background-color: var(--background-color-soft);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  padding: 1.5rem;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--header-text-color);
    margin-bottom: 1.5rem;

    .title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .add-source-btn {
      background-color: var(--background-color);
      color: var(--header-text-color);
      border: none;
      border-radius: 5px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;

      &:hover {
        background-color: var(--background-color-reverse);
        color: var(--reverse-header-text-color);
        transition: background-color 0.2s;
      }
    }
  }

  .sources-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 0.4rem;

    .source-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--background-color);
      border-radius: var(--border-radius);
      padding: 0.5rem 1rem;
      margin-bottom: 0.5rem;

      .source-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;

        .source-details {
          .source-name {
            font-weight: 500;
            color: var(--header-text-color);
            font-size: 0.9rem;
          }

          .source-type {
            font-size: 0.8rem;
            color: var(--normal-text-color);
          }
        }
      }

      .source-amount {
        font-weight: 600;
        color: var(--primary-green-color);
        font-size: 1rem;
        margin-right: 1rem;
      }

      .source-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        img {
          width: 1.2rem;
          height: 1.2rem;
          filter: invert(0.5);
          transition: filter 0.2s;

          &:hover {
            scale: 1.1;
            transition: scale 0.2s;
          }
        }
      }
    }
  }

  .no-income {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    text-align: center;
    padding: 1rem;
    font-size: 1.2rem;
    color: var(--normal-text-color);
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
    width: 40%;
    height: 50%;
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
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

        &:hover {
          opacity: 0.8;
          transition: opacity 0.2s;
        }
      }
    }
    .modal-body {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      gap: 1.5rem;

      .modal-input {
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        background-color: var(--background-color-soft);
        color: var(--normal-text-color);
        font-size: 0.9rem;

        &:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      }

      .frequency-buttons {
        display: flex;
        gap: 0.5rem;

        .frequency-btn {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 5px;
          background-color: var(--background-color);
          color: var(--normal-text-color);
          cursor: pointer;

          &.active {
            background-color: var(--background-color-reverse);
            color: var(--reverse-header-text-color);
          }

          &:hover:not(.active) {
            background-color: var(--background-color-soft);
          }
        }
      }

      .add-btn {
        padding: 0.75rem;
        border: none;
        border-radius: var(--border-radius);
        background-color: var(--primary-green-color);
        color: white;
        font-weight: 500;
        cursor: pointer;

        &:hover {
          opacity: 0.9;
          transition: background-color 0.2s;
        }
      }
      .error-message {
        color: var(--error-color, #e74c3c);
        font-size: 0.85rem;
        text-align: center;
        padding: 0.5rem;
        background-color: rgba(231, 76, 60, 0.1);
        border-radius: var(--border-radius);
        margin-top: 0.5rem;
      }
    }
  }
}
@media (max-width: 768px) {
  .income-sources-container {
    width: 100%;
    height: 100%;
    padding: 1rem;

    .modal-content {
      width: 90%;
      height: auto;
    }

    .header {
      align-items: flex-start;

      .title {
        font-size: 1.2rem;
      }
    }

    .sources-list {
      .source-item {
        .source-info {
          flex-direction: column;
          align-items: flex-start;

          .source-details {
            .source-name {
              font-size: 1rem;
            }

            .source-type {
              font-size: 0.9rem;
            }
          }
        }

        .source-amount {
          font-size: 1.2rem;
        }
      }
    }

    .no-income {
      font-size: 1rem;
    }

    .pagination {
      padding: 10px 0;
      gap: 0.5rem;
      flex-wrap: wrap;

      .pagination-btn {
        width: 35px;
        height: 35px;

        .arrow-left,
        .arrow-right {
          width: 14px;
          height: 14px;
        }
      }

      .page-number {
        width: 35px;
        height: 35px;
        font-size: 0.9rem;
      }

      .ellipsis {
        padding: 0 4px;
      }
    }

    .modal-body {
      padding: 0.5rem;

      .modal-input {
        font-size: 0.85rem;
      }

      .frequency-buttons {
        flex-direction: column;
        gap: 0.5rem;

        .frequency-btn {
          width: 100%;
        }
      }

      .add-btn {
        width: 100%;
      }
    }

    .error-message {
      font-size: 0.8rem;
    }

    .modal-header {
      h3 {
        font-size: 1.2rem;
      }
    }
  }
}
</style>

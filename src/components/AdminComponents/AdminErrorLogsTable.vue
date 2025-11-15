<template>
  <div class="admin-error-logs-table-c">
    <table class="error-table">
      <thead>
        <tr>
          <th>{{ selectedLanguage == 'English' ? 'ID' : 'ID' }}</th>
          <th>{{ selectedLanguage == 'English' ? 'Message' : 'Mesaj' }}</th>
          <th>{{ selectedLanguage == 'English' ? 'Source' : 'Kaynak' }}</th>
          <th>{{ selectedLanguage == 'English' ? 'Endpoint' : 'Endpoint' }}</th>
          <th>{{ selectedLanguage == 'English' ? 'Timestamp' : 'Zaman' }}</th>
          <th>{{ selectedLanguage == 'English' ? 'User ID' : 'Kullanıcı ID' }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(error, index) in dataError" :key="index">
          <td>{{ error.id }}</td>
          <td>{{ error.message }}</td>
          <td>{{ error.source }}</td>
          <td>{{ error.endpoint }}</td>
          <td>{{ formatDate(error.timestamp) }}</td>
          <td>{{ error.userId }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination" v-if="dataError">
      <button :disabled="page === 1" @click="$emit('changePage', page - 1)" class="pagination-btn">
        <img src="../../icons/arrow.svg" alt="arrow" class="arrow-left" />
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
        :class="['page-number', { active: totalPagesError === page }]"
        @click="$emit('changePage', totalPagesError)"
      >
        {{ totalPagesError }}
      </span>

      <button
        :disabled="page === totalPagesError || totalPagesError === 0"
        @click="$emit('changePage', page + 1)"
        class="pagination-btn"
      >
        <img src="../../icons/arrow.svg" alt="arrow" class="arrow-right" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AdminErrorLogsTable',
  props: {
    pageNumberError: {
      type: Number,
      required: true,
    },
    pageSizeError: {
      type: Number,
      required: true,
    },
    dataError: {
      type: Array as () => Array<{
        id: number
        message: string
        source: string
        endpoint: string
        timestamp: string
        userId: string
      }>,
      required: true,
    },
    hasMoreItemsError: {
      type: Boolean,
      required: true,
    },
    totalCountError: {
      type: Number,
      required: true,
    },
    totalPagesError: {
      type: Number,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
    selectedLanguage: {
      type: String,
      required: true,
    },
  },
  computed: {
    displayedPages() {
      // Display up to 5 page numbers around the current page
      const maxVisiblePages = 5
      const halfVisible = Math.floor(maxVisiblePages / 2)

      let startPage = Math.max(1, this.page - halfVisible)
      const endPage = Math.min(startPage + maxVisiblePages - 1, this.totalPagesError)

      // Adjust start page if we're near the end
      if (this.totalPagesError - endPage < halfVisible) {
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
        this.displayedPages[this.displayedPages.length - 1] < this.totalPagesError - 1
      )
    },
    showLastPage() {
      return (
        this.displayedPages.length > 0 &&
        this.displayedPages[this.displayedPages.length - 1] < this.totalPagesError
      )
    },
  },
  methods: {
    formatDate(dateString: string) {
      try {
        const date = new Date(dateString)
        if (this.selectedLanguage === 'Turkish') {
          return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        }
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      } catch {
        return dateString
      }
    },
    changePage(pageNumber: number) {
      if (pageNumber >= 1 && pageNumber <= this.totalPagesError) {
        this.$emit('changePage', pageNumber)
      }
    },
  },
}
</script>

<style scoped lang="scss">
.admin-error-logs-table-c {
  width: 100%;
  margin: 1rem 0;
  border-radius: var(--border-radius);
  overflow: hidden;
  border: 1px solid var(--border-color);

  .error-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
      color: var(--header-text-color);
    }

    thead {
      background-color: var(--background-color-soft);
      color: var(--header-text-color);
    }
  }

  .pagination {
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
}
@media (max-width: 768px) {
  .admin-error-logs-table-c {
    margin: 0.5rem 0;
    border-radius: var(--border-radius);

    .error-table {
      display: block;
      overflow-x: auto;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch;

      th,
      td {
        padding: 8px 10px;
        font-size: 0.85rem;
      }
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
  }
}
</style>

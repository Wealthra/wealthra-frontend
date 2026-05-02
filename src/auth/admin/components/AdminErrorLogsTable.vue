<template>
  <div class="admin-error-logs-table-c">
    <div class="table-wrapper">
      <table class="error-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Message</th>
            <th>Exception</th>
            <th>User</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="error in dataError" :key="error.id" @click="selectedError = error" class="clickable-row">
            <td>
              <span :class="['status-badge', getStatusClass(error.statusCode)]">
                {{ error.statusCode }}
              </span>
            </td>
            <td class="message-cell">{{ error.message }}</td>
            <td class="type-cell">{{ error.exceptionType }}</td>
            <td class="user-cell">{{ error.userId || 'Anonymous' }}</td>
            <td class="date-cell">{{ formatDate(error.createdUtc) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPagesError > 1">
      <button :disabled="page === 1" @click="$emit('changePage', page - 1)" class="pagination-btn">
        <font-awesome-icon :icon="faChevronLeft" />
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
        :disabled="page === totalPagesError"
        @click="$emit('changePage', page + 1)"
        class="pagination-btn"
      >
        <font-awesome-icon :icon="faChevronRight" />
      </button>
    </div>

    <!-- Error Detail Modal -->
    <div v-if="selectedError" class="modal-overlay" @click.self="selectedError = null">
      <div class="modal-content glass-card detail-modal">
        <div class="modal-header">
          <h3>Error Details #{{ selectedError.id }}</h3>
          <button class="close-btn" @click="selectedError = null">
            <font-awesome-icon :icon="faXmark" />
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Status Code</label>
              <span :class="['status-badge', getStatusClass(selectedError.statusCode)]">{{ selectedError.statusCode }}</span>
            </div>
            <div class="detail-item">
              <label>Correlation ID</label>
              <code class="mono">{{ selectedError.correlationId }}</code>
            </div>
            <div class="detail-item full">
              <label>Full Message</label>
              <p class="full-message">{{ selectedError.message }}</p>
            </div>
            <div class="detail-item full">
              <label>Exception Type</label>
              <p class="exception-type">{{ selectedError.exceptionType }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import type { ErrorLog } from '@/services/api/admin/admin.models'
import { faChevronLeft, faChevronRight, faXmark } from '@fortawesome/free-solid-svg-icons'

export default defineComponent({
  name: 'AdminErrorLogsTable',
  props: {
    dataError: {
      type: Array as () => ErrorLog[],
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
  setup(props) {
    const selectedError = ref<ErrorLog | null>(null)

    const displayedPages = computed(() => {
      const maxVisiblePages = 5
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let startPage = Math.max(1, props.page - halfVisible)
      const endPage = Math.min(startPage + maxVisiblePages - 1, props.totalPagesError)

      if (props.totalPagesError - endPage < halfVisible) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      const pages = []
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      return pages
    })

    const showEllipsis = computed(() => {
      return (
        displayedPages.value.length > 0 &&
        displayedPages.value[displayedPages.value.length - 1] < props.totalPagesError - 1
      )
    })

    const showLastPage = computed(() => {
      return (
        displayedPages.value.length > 0 &&
        displayedPages.value[displayedPages.value.length - 1] < props.totalPagesError
      )
    })

    const getStatusClass = (code: number) => {
      if (code >= 500) return 'status-500'
      if (code >= 400) return 'status-400'
      return 'status-other'
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })
    }

    return {
      selectedError,
      displayedPages,
      showEllipsis,
      showLastPage,
      getStatusClass,
      formatDate,
      faChevronLeft,
      faChevronRight,
      faXmark
    }
  }
})
</script>

<style scoped lang="scss">
.admin-error-logs-table-c {
  width: 100%;
}

.table-wrapper {
  overflow-x: auto;
}

.error-table {
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    background-color: var(--background-color-soft);
    color: var(--normal-text-color);
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 0.05em;
  }

  .clickable-row {
    cursor: pointer;
    transition: background-color 0.2s;
    &:hover { background-color: var(--background-color-soft); }
  }

  .status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 800;
    font-family: monospace;
    
    &.status-500 { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    &.status-400 { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    &.status-other { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
  }

  .method-tag {
    font-size: 11px;
    font-weight: 800;
    color: var(--normal-text-color);
    opacity: 0.8;
  }

  .path-cell { font-family: monospace; font-size: 13px; color: var(--header-text-color); }
  .message-cell { font-size: 13px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .type-cell { font-size: 12px; color: var(--normal-text-color); font-style: italic; }
  .user-cell { font-size: 12px; color: var(--normal-text-color); }
  .date-cell { font-size: 12px; color: var(--normal-text-color); opacity: 0.7; }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  gap: 8px;

  .pagination-btn, .page-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--background-color);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;

    &:hover:not(:disabled):not(.active) { background: var(--background-color-soft); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
    &.active { background: var(--primary-green-color); border-color: var(--primary-green-color); color: white; }
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.detail-modal {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 0;
  
  .modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 { margin: 0; font-size: 18px; }
    .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--normal-text-color); }
  }

  .modal-body {
    padding: 24px;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      &.full { grid-column: 1 / -1; }
      
      label { font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--normal-text-color); opacity: 0.6; }
      .mono { font-family: monospace; font-size: 13px; color: var(--primary-green-color); }
      .full-message { font-size: 14px; color: var(--header-text-color); line-height: 1.6; }
      .exception-type { font-size: 13px; color: #ef4444; font-family: monospace; }
    }
  }
}
</style>

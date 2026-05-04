<template>
  <div class="admin-error-logs-table-c">
    <div class="table-container">
      <div class="table-scroll">
        <table class="tickets-table">
          <thead>
            <tr>
              <th class="col-code">{{ t.code }}</th>
              <th class="col-exception">{{ t.exception }}</th>
              <th class="col-user">{{ t.user }}</th>
              <th class="col-date">{{ t.timestamp }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr v-for="i in 10" :key="'skeleton-' + i" class="skeleton-row">
                <td class="col-code" :data-label="t.code"><UISkeletonLoader width="100%" height="24px" border-radius="6px" /></td>
                <td class="col-exception" :data-label="t.exception"><UISkeletonLoader width="70%" height="16px" border-radius="4px" /></td>
                <td class="col-user" :data-label="t.user"><UISkeletonLoader width="120px" height="16px" border-radius="4px" /></td>
                <td class="col-date" :data-label="t.timestamp"><UISkeletonLoader width="100px" height="14px" border-radius="4px" /></td>
              </tr>
            </template>
            <template v-else>
              <tr 
                v-for="error in dataError" 
                :key="error.id" 
                @click="selectedError = error" 
                class="clickable-row"
              >
                <td class="col-code" :data-label="t.code">
                  <span :class="['status-badge-mono', getStatusClass(error.statusCode)]">
                     {{ error.statusCode }}
                  </span>
                </td>
                <td class="col-exception" :data-label="t.exception">
                  <span class="exception-type-mono">{{ error.exceptionType }}</span>
                </td>
                <td class="col-user" :data-label="t.user">
                  <span class="user-text">{{ error.userId || t.anonymous }}</span>
                </td>
                <td class="col-date date-cell" :data-label="t.timestamp">
                  {{ formatDate(error.createdUtc) }}
                </td>
              </tr>
              <tr v-if="dataError.length === 0">
                <td colspan="4" class="no-data-premium">
                  <div class="empty-state-wrap">
                    <div class="empty-icon-circle">
                      <font-awesome-icon icon="circle-check" />
                    </div>
                    <p class="empty-text">{{ t.noLogs }}</p>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Error Detail Modal -->
    <UIModal 
      :is-open="!!selectedError" 
      :title="t.errorDetailTitle + (selectedError?.id || '')" 
      max-width="700px" 
      @close="selectedError = null"
    >
      <div v-if="selectedError" class="error-detail-content">
        <div class="detail-grid">
          <div class="detail-item">
            <label>{{ t.code }}</label>
            <span :class="['status-badge-mono', getStatusClass(selectedError.statusCode)]">
              {{ selectedError.statusCode }}
            </span>
          </div>
          <div class="detail-item">
            <label>{{ t.correlationId }}</label>
            <code class="mono-id">{{ selectedError.correlationId }}</code>
          </div>
          <div class="detail-item full">
            <label>{{ t.message }}</label>
            <div class="detail-text-box">{{ selectedError.message }}</div>
          </div>
          <div class="detail-item full">
            <label>{{ t.exceptionType }}</label>
            <code class="exception-code">{{ selectedError.exceptionType }}</code>
          </div>
          <div v-if="selectedError.userId" class="detail-item">
            <label>{{ t.userId }}</label>
            <code class="mono-id">{{ selectedError.userId }}</code>
          </div>
          <div class="detail-item">
            <label>{{ t.timestamp }}</label>
            <span class="detail-date">{{ formatDate(selectedError.createdUtc) }}</span>
          </div>
        </div>
      </div>
    </UIModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import type { ErrorLog } from '@/services/api/admin/admin.models'
import UIModal from '@/components/UIModal.vue'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

export default defineComponent({
  name: 'AdminErrorLogsTable',
  components: { UIModal, UISkeletonLoader },
  props: {
    dataError: {
      type: Array as () => ErrorLog[],
      required: true,
    },
    selectedLanguage: {
      type: String,
      required: true,
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const selectedError = ref<ErrorLog | null>(null)

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        code: isTr ? 'Kod' : 'Code',
        exception: isTr ? 'İstisna' : 'Exception',
        user: isTr ? 'Kullanıcı' : 'User',
        timestamp: isTr ? 'Zaman Damgası' : 'Timestamp',
        anonymous: isTr ? 'Anonim' : 'Anonymous',
        noLogs: isTr ? 'Seçilen kriterlere göre hata günlüğü bulunamadı.' : 'No error logs found for the selected criteria.',
        errorDetailTitle: isTr ? 'Hata Detayları #' : 'Error Details #',
        correlationId: 'Correlation ID',
        message: isTr ? 'Mesaj' : 'Message',
        exceptionType: isTr ? 'İstisna Türü' : 'Exception Type',
        userId: 'User ID'
      }
    })

    const getStatusClass = (code: number) => {
      if (code >= 500) return 'status-500'
      if (code >= 400) return 'status-400'
      return 'status-other'
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString(props.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    }

    const truncate = (text: string, max: number) => {
      if (!text) return '—'
      return text.length <= max ? text : `${text.slice(0, max)}…`
    }

    return {
      selectedError,
      getStatusClass,
      formatDate,
      truncate,
      t
    }
  }
})
</script>

<style scoped lang="scss">
.admin-error-logs-table-c {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.table-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--background-color);
}

.table-scroll {
  flex: 1;
  overflow: auto;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--background-color-soft);

    @media (max-width: 1200px) {
      display: none;
    }
  }

  tr {
    display: grid;
    grid-template-columns: 80px 1fr 220px 180px;
    gap: 24px;
    align-items: center;
    padding: 0 24px;
    border-bottom: 1px solid var(--border-color);

    @media (max-width: 1200px) {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: 20px;
      gap: 12px;
      background: var(--background-color-soft);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      margin: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }
      
      td {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 12px 0 !important;
        border: none !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        gap: 16px;
        text-align: right;
        
        &:last-child {
          border-bottom: none !important;
        }
        
        &::before {
          content: attr(data-label);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--normal-text-color);
          opacity: 0.5;
          padding-top: 2px;
          flex-shrink: 0;
          width: 100px;
          text-align: left;
        }
      }
    }
  }

  tbody {
    @media (max-width: 1200px) {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 10px;
      padding: 10px;
    }
  }

  th, td {
    padding: 16px 0;
    text-align: left;
    min-width: 0;
  }

  th {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--normal-text-color);
  }

  tbody tr:hover:not(.skeleton-row) {
    background: rgba(0, 0, 0, 0.02);
    cursor: pointer;
  }

  .skeleton-row {
    pointer-events: none;
    td {
      display: flex;
      align-items: center;
    }
  }

  .status-badge-mono {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 6px;
    font-family: ui-monospace, monospace;
    font-size: 11px;
    font-weight: 700;
    text-align: center;
    width: 100%;
    
    &.status-500 { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    &.status-400 { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    &.status-other { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

    @media (max-width: 1200px) {
      width: auto;
      min-width: 60px;
    }
  }

  .exception-type-mono {
    font-family: ui-monospace, monospace;
    font-size: 12px;
    color: var(--normal-text-color);
    opacity: 0.8;
    word-break: break-all;
  }

  .user-text {
    font-size: 13px;
    color: var(--normal-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .date-cell {
    font-size: 12px;
    color: var(--normal-text-color);
    opacity: 0.7;
    white-space: nowrap;
    text-align: right;
  }
}

.no-data-premium {
  padding: 80px !important;
  text-align: center;

  .empty-state-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .empty-icon-circle {
    width: 64px;
    height: 64px;
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
  }

  .empty-text {
    font-size: 16px;
    color: var(--normal-text-color);
    margin: 0;
    font-weight: 500;
  }
}

/* Detail Modal Styles */
.error-detail-content {
  display: flex;
  flex-direction: column;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
    &.full { grid-column: 1 / -1; }

    label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--normal-text-color);
      letter-spacing: 0.05em;
      opacity: 0.6;
    }

    .mono-id {
      font-family: ui-monospace, monospace;
      font-size: 13px;
      background: var(--background-color-soft);
      padding: 6px 12px;
      border-radius: 8px;
      color: var(--header-text-color);
    }

    .detail-text-box {
      background: var(--background-color-soft);
      padding: 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.6;
      color: var(--header-text-color);
      border: 1px solid var(--border-color);
    }

    .exception-code {
      font-family: ui-monospace, monospace;
      font-size: 12px;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid rgba(239, 68, 68, 0.1);
      word-break: break-all;
    }

    .detail-date {
      font-size: 14px;
      color: var(--header-text-color);
      font-weight: 500;
    }
  }
}
</style>

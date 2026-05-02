<template>
  <div class="admin-error-logs">
    <div class="table-toolbar">
      <div class="table-toolbar__title-wrap">
        <font-awesome-icon icon="bug" class="table-toolbar__icon" />
        <h2 class="table-toolbar__title">System Error Logs</h2>
      </div>
      <div class="table-toolbar__filter">
        <UISelect
          v-model="statusFilter"
          :options="statusOptions"
          @update:model-value="fetchLogs"
        />
      </div>
    </div>

    <div class="logs-container">
      <div v-if="error" class="error-state">
        <font-awesome-icon :icon="faTriangleExclamation" />
        <p>{{ error }}</p>
        <button @click="fetchLogs" class="retry-btn">Retry</button>
      </div>
      <AdminErrorLogsTable
        v-else
        :dataError="logs"
        :selectedLanguage="selectedLanguage"
        :isLoading="isLoading"
      />
      
      <footer v-if="!isLoading" class="tickets-table-footer">
        <div class="tickets-table-footer__hint">
          <font-awesome-icon icon="circle-info" />
          <span class="tickets-table-footer__text">
            Showing the latest server-side exceptions and status code errors. Click a row to view full details.
          </span>
        </div>
        <button
          v-if="logs.length >= take"
          type="button"
          class="tickets-load-more"
          :disabled="isLoading"
          @click="loadMore"
        >
          <font-awesome-icon v-if="isLoading" icon="spinner" spin />
          {{ isLoading ? 'Loading...' : 'Load More Logs' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import AdminErrorLogsTable from './AdminErrorLogsTable.vue'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import UISelect from '@/components/UISelect.vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { ErrorLog } from '@/services/api/admin/admin.models'
import { faTriangleExclamation, faBug } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

library.add(faBug)

export default defineComponent({
  name: 'AdminErrorLogs',
  components: {
    AdminErrorLogsTable,
    UISkeletonLoader,
    UISelect
  },
  props: {
    selectedLanguage: {
      type: String,
      default: 'English'
    }
  },
  setup() {
    const logs = ref<ErrorLog[]>([])
    const isLoading = ref(true)
    const error = ref<string | null>(null)
    
    const skip = ref(0)
    const take = ref(50)
    const statusFilter = ref<string | number>('all')
    const currentPage = ref(1)

    const statusOptions = [
      { label: 'All Status Codes', value: 'all' },
      { label: '400 Bad Request', value: 400 },
      { label: '401 Unauthorized', value: 401 },
      { label: '403 Forbidden', value: 403 },
      { label: '404 Not Found', value: 404 },
      { label: '500 Server Error', value: 500 },
      { label: '503 Service Unavailable', value: 503 }
    ]

    const fetchLogs = async () => {
      isLoading.value = true
      error.value = null
      try {
        const status = statusFilter.value === 'all' ? undefined : (statusFilter.value as number)
        const response = await adminService.getErrors(0, take.value, status)
        logs.value = response
        skip.value = 0
        currentPage.value = 1
      } catch (err) {
        console.error('Failed to fetch error logs', err)
        error.value = 'Failed to load error logs.'
      } finally {
        isLoading.value = false
      }
    }

    const loadMore = async () => {
      isLoading.value = true
      try {
        const nextSkip = skip.value + take.value
        const status = statusFilter.value === 'all' ? undefined : (statusFilter.value as number)
        const response = await adminService.getErrors(nextSkip, take.value, status)
        logs.value = [...logs.value, ...response]
        skip.value = nextSkip
        currentPage.value++
      } catch (err) {
        console.error('Failed to load more logs', err)
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      fetchLogs()
      window.addEventListener('app:refetch', fetchLogs)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:refetch', fetchLogs)
    })

    return {
      logs,
      isLoading,
      error,
      currentPage,
      take,
      statusFilter,
      statusOptions,
      fetchLogs,
      loadMore,
      faTriangleExclamation
    }
  }
})
</script>

<style scoped lang="scss">
.admin-error-logs {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 0 24px;

  &__title-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--primary-red-color);
  }

  &__icon {
    font-size: 20px;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--header-text-color);
  }

  &__filter {
    flex: 0 0 auto;
    width: clamp(200px, 24vw, 250px);
  }
}

.logs-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.loading-state, .error-state {
  padding: 80px;
  text-align: center;
  background: var(--background-color-soft);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.error-state {
  color: #ef4444;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  p { margin: 0; font-weight: 500; }
  
  .retry-btn {
    padding: 10px 24px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: filter 0.2s;
    &:hover { filter: brightness(1.1); }
  }
}

.tickets-table-footer {
  padding: 14px 18px;
  background: var(--background-color-soft);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;

  &__hint {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--normal-text-color);
  }
}

.tickets-load-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--background-color);
  color: var(--header-text-color);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: var(--primary-green-color);
    background: rgba(34, 197, 94, 0.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>

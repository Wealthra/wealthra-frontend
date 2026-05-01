<template>
  <div class="admin-error-logs">
    <div v-if="isLoading && logs.length === 0" class="loading-state">
      <UISkeletonLoader height="400px" />
    </div>
    <div v-else-if="error" class="error-state">
      <font-awesome-icon icon="triangle-exclamation" />
      <p>{{ error }}</p>
      <button @click="fetchLogs" class="retry-btn">Retry</button>
    </div>
    <div v-else class="logs-container">
      <div class="filters">
        <div class="filter-group">
          <label>Status Code</label>
          <input v-model.number="statusFilter" type="number" placeholder="All" @change="fetchLogs" />
        </div>
        <button @click="fetchLogs" class="refresh-btn" :disabled="isLoading">
          <font-awesome-icon icon="arrows-rotate" :spin="isLoading" />
          Refresh
        </button>
      </div>

      <AdminErrorLogsTable
        :dataError="logs"
        :page="currentPage"
        :totalPagesError="100" 
        :selectedLanguage="selectedLanguage"
        @changePage="handlePageChange"
      />
      
      <div class="load-more" v-if="logs.length >= take">
         <button @click="loadMore" :disabled="isLoading" class="load-more-btn">
           {{ isLoading ? 'Loading...' : 'Load Next 50' }}
         </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import AdminErrorLogsTable from './AdminErrorLogsTable.vue'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { ErrorLog } from '@/services/api/admin/admin.models'

export default defineComponent({
  name: 'AdminErrorLogs',
  components: {
    AdminErrorLogsTable,
    UISkeletonLoader
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
    const statusFilter = ref<number | undefined>(undefined)
    const currentPage = ref(1)

    const fetchLogs = async () => {
      isLoading.value = true
      error.value = null
      try {
        const response = await adminService.getErrors(0, take.value, statusFilter.value)
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
        const response = await adminService.getErrors(nextSkip, take.value, statusFilter.value)
        logs.value = [...logs.value, ...response]
        skip.value = nextSkip
        currentPage.value++
      } catch (err) {
        console.error('Failed to load more logs', err)
      } finally {
        isLoading.value = false
      }
    }

    const handlePageChange = (newPage: number) => {
       // Simple load more logic for now as the API returns a flat array
       if (newPage > currentPage.value) {
         loadMore()
       }
    }

    onMounted(fetchLogs)

    return {
      logs,
      isLoading,
      error,
      currentPage,
      take,
      statusFilter,
      fetchLogs,
      loadMore,
      handlePageChange
    }
  }
})
</script>

<style scoped lang="scss">
.admin-error-logs {
  padding: 0;
}

.loading-state, .error-state {
  padding: 60px;
  text-align: center;
  background: var(--background-color-soft);
  border-radius: 16px;
}

.error-state {
  color: #ef4444;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  p { margin: 0; font-weight: 500; }
  
  .retry-btn {
    padding: 8px 24px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  padding: 0 4px;

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label { font-size: 12px; font-weight: 800; text-transform: uppercase; opacity: 0.6; }
    input {
      padding: 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-color-soft);
      color: var(--header-text-color);
      width: 100px;
    }
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--background-color-soft);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    color: var(--header-text-color);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover { background: var(--background-color); border-color: var(--primary-green-color); }
  }
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 32px;

  .load-more-btn {
    padding: 12px 32px;
    background: var(--primary-green-color);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover:not(:disabled) { transform: translateY(-2px); }
    &:disabled { opacity: 0.6; }
  }
}
</style>

<template>
  <div class="admin-error-logs">
    <div v-if="isLoading" class="loading-state">
      <UISkeletonLoader height="400px" />
    </div>
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>
    <AdminErrorLogsTable
      v-else
      :dataError="logs"
      :page="currentPage"
      :pageNumberError="currentPage"
      :pageSizeError="pageSize"
      :totalCountError="totalCount"
      :totalPagesError="totalPages"
      :hasMoreItemsError="currentPage < totalPages"
      :selectedLanguage="selectedLanguage"
      @changePage="handlePageChange"
    />
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
    
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalCount = ref(0)
    const totalPages = ref(0)

    const fetchLogs = async (page: number) => {
      isLoading.value = true
      error.value = null
      try {
        const response = await adminService.getErrors(page, pageSize.value)
        logs.value = response.items
        currentPage.value = response.page
        totalCount.value = response.totalCount
        totalPages.value = response.totalPages
      } catch (err) {
        console.error('Failed to fetch error logs', err)
        error.value = 'Failed to load error logs.'
      } finally {
        isLoading.value = false
      }
    }

    const handlePageChange = (newPage: number) => {
      fetchLogs(newPage)
    }

    onMounted(() => {
      fetchLogs(1)
    })

    return {
      logs,
      isLoading,
      error,
      currentPage,
      pageSize,
      totalCount,
      totalPages,
      handlePageChange
    }
  }
})
</script>

<style scoped>
.loading-state, .error-state {
  padding: 24px;
  text-align: center;
}
.error-state {
  color: var(--primary-red-color);
}
</style>

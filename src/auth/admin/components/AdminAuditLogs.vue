<template>
  <div class="admin-audit-logs">
    <div v-if="isLoading && rows.length === 0" class="admin-audit-logs__loading">
      <UISkeletonLoader height="280px" border-radius="12px" />
    </div>
    <div v-else-if="loadError" class="admin-audit-logs__error">
      <p>{{ loadError }}</p>
      <button type="button" class="retry-btn" @click="fetchPage(true)">{{ t.retry }}</button>
    </div>
    <template v-else>
      <div class="admin-audit-logs__toolbar">
        <button type="button" class="refresh-btn" :disabled="isLoading" @click="fetchPage(true)">
          <font-awesome-icon icon="arrows-rotate" :spin="isLoading" />
          {{ t.refresh }}
        </button>
      </div>
      <div class="table-scroll">
        <table class="audit-table">
          <thead>
            <tr>
              <th>{{ t.when }}</th>
              <th>{{ t.actor }}</th>
              <th>{{ t.action }}</th>
              <th>{{ t.target }}</th>
              <th>{{ t.ip }}</th>
              <th>{{ t.details }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td class="audit-table__mono">{{ formatDt(row.createdUtc) }}</td>
              <td class="audit-table__mono">{{ abbreviateId(row.actorUserId) }}</td>
              <td>{{ row.action }}</td>
              <td class="audit-table__mono">{{ abbreviateId(row.targetUserId) }}</td>
              <td>{{ row.ipAddress }}</td>
              <td class="audit-table__details" :title="row.detailsJson">{{ truncate(row.detailsJson, 80) }}</td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="6" class="audit-table__empty">{{ t.empty }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="mayHaveMore && rows.length > 0" class="admin-audit-logs__more">
        <button type="button" class="load-more-btn" :disabled="isLoading" @click="loadMore">
          {{ isLoading ? t.loading : t.loadMore }}
        </button>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import type { PropType } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { AdminAuditLog } from '@/services/api/admin/admin.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

const TAKE = 50

export default defineComponent({
  name: 'AdminAuditLogs',
  components: { UISkeletonLoader },
  props: {
    selectedLanguage: {
      type: String as PropType<'English' | 'Turkish'>,
      default: 'English',
    },
  },
  setup(props) {
    const rows = ref<AdminAuditLog[]>([])
    const isLoading = ref(true)
    const loadError = ref<string | null>(null)
    /** Next `skip` value for API (= current row count when paging forward). */
    const nextSkip = ref(0)
    const mayHaveMore = ref(false)

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        refresh: isTr ? 'Yenile' : 'Refresh',
        when: isTr ? 'Zaman' : 'When',
        actor: isTr ? 'Aktör' : 'Actor',
        action: isTr ? 'İşlem' : 'Action',
        target: isTr ? 'Hedef' : 'Target',
        ip: 'IP',
        details: isTr ? 'Detay' : 'Details',
        empty: isTr ? 'Kayıt yok.' : 'No audit entries.',
        loadMore: isTr ? 'Sonraki kayıtlar' : 'Load more',
        loading: isTr ? 'Yükleniyor…' : 'Loading…',
        retry: isTr ? 'Yeniden dene' : 'Retry',
        failed: isTr ? 'Denetim günlüğü yüklenemedi.' : 'Failed to load audit logs.',
      }
    })

    const locale = computed(() => (props.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US'))

    const formatDt = (iso: string) => {
      try {
        return new Date(iso).toLocaleString(locale.value, {
          dateStyle: 'short',
          timeStyle: 'short',
        })
      } catch {
        return iso
      }
    }

    const abbreviateId = (id: string) => {
      if (!id) return '—'
      return id.length <= 12 ? id : `${id.slice(0, 6)}…${id.slice(-4)}`
    }

    const truncate = (s: string, max: number) => {
      if (!s) return '—'
      return s.length <= max ? s : `${s.slice(0, max)}…`
    }

    const fetchPage = async (reset = false) => {
      isLoading.value = true
      loadError.value = null
      const skipVal = reset ? 0 : nextSkip.value
      try {
        const data = await adminService.getAuditLogs(skipVal, TAKE)
        if (reset) {
          rows.value = data
          nextSkip.value = data.length
        } else {
          rows.value = [...rows.value, ...data]
          nextSkip.value += data.length
        }
        mayHaveMore.value = data.length === TAKE
      } catch {
        loadError.value = t.value.failed
        if (reset) {
          rows.value = []
          nextSkip.value = 0
          mayHaveMore.value = false
        }
      } finally {
        isLoading.value = false
      }
    }

    const loadMore = async () => {
      await fetchPage(false)
    }

    onMounted(() => fetchPage(true))

    return {
      rows,
      isLoading,
      loadError,
      t,
      mayHaveMore,
      formatDt,
      abbreviateId,
      truncate,
      fetchPage,
      loadMore,
    }
  },
})
</script>

<style scoped lang="scss">
.admin-audit-logs {
  padding: 0;
}

.admin-audit-logs__loading,
.admin-audit-logs__error {
  padding: 2rem;
  text-align: center;
}

.admin-audit-logs__error {
  color: var(--notification-alert-color, #ef4444);

  .retry-btn {
    margin-top: 12px;
    padding: 8px 20px;
    border-radius: 8px;
    border: none;
    background: var(--notification-alert-color, #ef4444);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }
}

.admin-audit-logs__toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--background-color-soft);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--header-text-color);
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: var(--primary-green-color);
  }

  &:disabled {
    opacity: 0.6;
  }
}

.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--normal-text-color);
    background: var(--background-color-soft);
    white-space: nowrap;
  }

  td {
    color: var(--header-text-color);
  }
}

.audit-table__mono {
  font-family: ui-monospace, monospace;
  font-size: 12px;
}

.audit-table__details {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audit-table__empty {
  text-align: center;
  padding: 2rem !important;
  color: var(--normal-text-color);
}

.admin-audit-logs__more {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0 0;
}

.load-more-btn {
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: var(--primary-green-color);
  color: #fff;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
  }
}
</style>

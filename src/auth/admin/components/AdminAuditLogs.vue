<template>
  <div class="admin-audit-logs">
    <div v-if="loadError" class="admin-audit-logs__error">
      <font-awesome-icon icon="triangle-exclamation" />
      <p>{{ loadError }}</p>
      <button type="button" class="retry-btn" @click="fetchPage(true)">{{ t.retry }}</button>
    </div>
    <template v-else>
      <div class="table-toolbar">
        <div class="table-toolbar__title-wrap">
          <font-awesome-icon icon="list-check" class="table-toolbar__icon" />
          <h2 class="table-toolbar__title">{{ t.title }}</h2>
        </div>
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
            <template v-if="isLoading">
              <tr v-for="i in 10" :key="'skeleton-' + i" class="skeleton-row">
                <td class="audit-table__mono"><UISkeletonLoader width="100%" height="16px" border-radius="4px" /></td>
                <td class="audit-table__mono"><UISkeletonLoader width="100%" height="16px" border-radius="4px" /></td>
                <td><UISkeletonLoader width="100%" height="16px" border-radius="4px" /></td>
                <td class="audit-table__mono"><UISkeletonLoader width="100%" height="16px" border-radius="4px" /></td>
                <td><UISkeletonLoader width="100%" height="16px" border-radius="4px" /></td>
                <td><UISkeletonLoader width="100%" height="16px" border-radius="4px" /></td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="row in rows" :key="row.id">
                <td class="audit-table__mono" :data-label="t.when">{{ formatDt(row.createdUtc) }}</td>
                <td class="audit-table__mono" :data-label="t.actor">{{ abbreviateId(row.actorUserId) }}</td>
                <td :data-label="t.action">{{ row.action }}</td>
                <td class="audit-table__mono" :data-label="t.target">{{ abbreviateId(row.targetUserId) }}</td>
                <td :data-label="t.ip">{{ row.ipAddress }}</td>
                <td class="audit-table__details" :data-label="t.details" :title="row.detailsJson">{{ truncate(row.detailsJson, 200) }}</td>
              </tr>
              <tr v-if="rows.length === 0">
                <td colspan="6" class="audit-table__empty">{{ t.empty }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <footer class="audit-table-footer">
        <div class="audit-table-footer__hint">
          <font-awesome-icon icon="circle-info" />
          <span class="audit-table-footer__text">
            {{ t.footerHint }}
          </span>
        </div>
        <button 
          v-if="mayHaveMore && rows.length > 0"
          type="button" 
          class="load-more-btn" 
          :disabled="isLoading" 
          @click="loadMore"
        >
          <font-awesome-icon v-if="isLoading" icon="spinner" spin />
          {{ isLoading ? t.loading : t.loadMore }}
        </button>
      </footer>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue'
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
    const nextSkip = ref(0)
    const mayHaveMore = ref(false)

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        title: isTr ? 'Denetim Günlükleri' : 'Audit Logs',
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
        footerHint: isTr ? 'Sistem üzerindeki tüm idari ve kritik işlemler kaydedilmektedir.' : 'All administrative and critical operations on the system are recorded.'
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

    const handleGlobalRefetch = () => fetchPage(true)

    onMounted(() => {
      fetchPage(true)
      window.addEventListener('app:refetch', handleGlobalRefetch)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:refetch', handleGlobalRefetch)
    })

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
    color: var(--primary-green-color);
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
}

.admin-audit-logs__loading,
.admin-audit-logs__error {
  padding: 80px;
  text-align: center;
  background: var(--background-color-soft);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.admin-audit-logs__error {
  color: #ef4444;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

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

.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  min-height: 0;
  background: var(--background-color);
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  tr {
    display: grid;
    grid-template-columns: 160px 100px 180px 100px 140px 1fr;
    gap: 20px;
    align-items: center;
    padding: 0 24px;
    border-bottom: 1px solid var(--border-color);

    @media (max-width: 1100px) {
      grid-template-columns: 140px 90px 150px 90px 120px 1fr;
      gap: 12px;
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
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--background-color);
    
    @media (max-width: 768px) {
      display: none;
    }
  }

  td {
    color: var(--header-text-color);
  }

  tbody tr:hover:not(.skeleton-row) {
    background: rgba(0, 0, 0, 0.02);
  }

  .skeleton-row {
    pointer-events: none;
    td {
      display: flex;
      align-items: center;
    }
  }
}

.audit-table__mono {
  font-family: ui-monospace, monospace;
  font-size: 12px;
  color: var(--primary-green-color) !important;
}

.audit-table__details {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.7;
}

.audit-table__empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px !important;
  color: var(--normal-text-color);
}

.audit-table-footer {
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

.load-more-btn {
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

@media (max-width: 1200px) {
  .audit-table {
    thead {
      display: none;
    }

    tbody {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      padding: 20px;
    }

    tbody tr {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: 20px;
      gap: 0;
      background: var(--background-color-soft);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      margin-bottom: 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }
      
      &::after { display: none; }
    }

    td {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 14px 0 !important;
      border: none !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
      text-align: right;

      &::before {
        content: attr(data-label);
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--normal-text-color);
        opacity: 0.5;
        text-align: left;
        margin-right: 24px;
        flex-shrink: 0;
        width: 100px;
        padding-top: 2px;
      }

      &:last-child {
        border-bottom: none !important;
      }

      &.audit-table__details {
        word-break: break-all;
        white-space: normal;
        text-align: right;
        max-width: 100%;
      }
    }
  }
}
</style>

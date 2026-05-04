<template>
  <div class="admin-security">
    <div class="table-toolbar">
      <div class="table-toolbar__title-wrap">
        <font-awesome-icon icon="shield-halved" class="table-toolbar__icon" />
        <h2 class="table-toolbar__title">Blocked IP Addresses</h2>
      </div>
      <div class="table-toolbar__actions">
        <button class="add-btn-premium" @click="showAddModal = true">
          <font-awesome-icon icon="plus" />
          Block New IP
        </button>
      </div>
    </div>

    <div class="table-container">
      <div class="table-scroll">
        <table class="tickets-table">
          <thead>
            <tr>
              <th class="col-ip">IP Address</th>
              <th class="col-reason">Reason</th>
              <th class="col-blocked-at">Blocked At</th>
              <th class="col-expires-at">Expires At</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr v-for="i in 8" :key="'skeleton-' + i" class="skeleton-row">
                <td class="col-ip"><UISkeletonLoader width="100%" height="20px" border-radius="6px" /></td>
                <td class="col-reason"><UISkeletonLoader width="60%" height="16px" border-radius="4px" /></td>
                <td class="col-blocked-at"><UISkeletonLoader width="110px" height="14px" border-radius="4px" /></td>
                <td class="col-expires-at"><UISkeletonLoader width="110px" height="14px" border-radius="4px" /></td>
                <td class="col-actions"><UISkeletonLoader width="80px" height="32px" border-radius="8px" /></td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="ip in blockedIps" :key="ip.id">
                <td class="col-ip" data-label="IP Address">
                  <span class="mono ip-text">{{ isPrivacyMode ? '•••.•••.•••.•••' : ip.ipAddress }}</span>
                </td>
                <td class="col-reason" data-label="Reason">
                  <span class="reason-cell" :title="ip.reason">{{ truncate(ip.reason, 40) }}</span>
                </td>
                <td class="col-blocked-at date-cell" data-label="Blocked At">{{ formatDateTime(ip.createdUtc) }}</td>
                <td class="col-expires-at" data-label="Expires At">
                  <span :class="['status-badge', isExpired(ip.expiresUtc) ? 'closed' : 'pending']">
                    {{ formatDateTime(ip.expiresUtc) }}
                  </span>
                </td>
                <td class="col-actions">
                  <UITooltip :content="confirmingIp === ip.ipAddress ? 'Click again to confirm' : 'Unblock this IP'" side="left">
                    <button 
                      :class="['table-action-btn-red', { 'is-confirming': confirmingIp === ip.ipAddress }]" 
                      @click="handleUnblockClick(ip.ipAddress)"
                    >
                      {{ confirmingIp === ip.ipAddress ? 'Confirm?' : 'Unblock' }}
                    </button>
                  </UITooltip>
                </td>
              </tr>
              <tr v-if="blockedIps.length === 0">
                <td colspan="5" class="no-data-premium">
                  <div class="empty-state-wrap">
                    <div class="empty-icon-circle">
                      <font-awesome-icon icon="circle-check" />
                    </div>
                    <p class="empty-text">No IPs are currently blocked. Your system is clean!</p>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <footer v-if="!isLoading" class="tickets-table-footer">
        <div class="tickets-table-footer__hint">
          <font-awesome-icon icon="circle-info" />
          <span class="tickets-table-footer__text">
            Security policies are active. All listed IPs are currently restricted from accessing the platform.
          </span>
        </div>
      </footer>
    </div>

    <!-- Add IP Modal -->
    <UIModal :is-open="showAddModal" title="Block New IP Address" max-width="500px" @close="showAddModal = false">
      <form @submit.prevent="handleAddIp" class="block-ip-form">
        <div class="form-section">
          <div class="form-group">
            <label>IP Address</label>
            <div class="input-container">
              <font-awesome-icon icon="network-wired" class="input-icon" />
              <input v-model="newIp.ipAddress" type="text" placeholder="e.g. 192.168.1.1" required />
            </div>
          </div>

          <div class="form-group">
            <label>Expiry Date</label>
            <UIDatepicker 
              v-model="newIp.expiresUtc" 
              type="datetime" 
              value-type="format"
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="Select expiry date"
            />
          </div>

          <div class="form-group">
            <label>Reason for blocking</label>
            <textarea 
              v-model="newIp.reason" 
              rows="3" 
              placeholder="Describe why this IP is being blocked..." 
              required
            ></textarea>
          </div>
        </div>

        <div class="modal-form-actions">
          <button type="button" class="btn-secondary" @click="showAddModal = false">Cancel</button>
          <button type="submit" class="btn-primary-red" :disabled="isSubmitting">
            <font-awesome-icon v-if="isSubmitting" icon="spinner" spin />
            {{ isSubmitting ? 'Blocking...' : 'Block IP' }}
          </button>
        </div>
      </form>
    </UIModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { BlockedIp, CreateBlockedIpRequest } from '@/services/api/admin/admin.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import UIModal from '@/components/UIModal.vue'
import UIDatepicker from '@/components/UIDatepicker.vue'
import UITooltip from '@/components/UITooltip.vue'
import { useToast } from '@/stores/useToast'
import { useCurrency } from '@/composables/useCurrency'

export default defineComponent({
  name: 'AdminSecurity',
  components: { UISkeletonLoader, UIModal, UIDatepicker, UITooltip },
  setup() {
    const { isPrivacyMode } = useCurrency()
    const blockedIps = ref<BlockedIp[]>([])
    const isLoading = ref(true)
    const showAddModal = ref(false)
    const isSubmitting = ref(false)
    const toast = useToast()
    
    const newIp = ref<CreateBlockedIpRequest>({
      ipAddress: '',
      reason: '',
      expiresUtc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })

    const fetchIps = async () => {
      isLoading.value = true
      try {
        blockedIps.value = await adminService.getBlockedIps()
      } catch (err) {
        console.error(err)
      } finally {
        isLoading.value = false
      }
    }

    const handleAddIp = async () => {
      if (!newIp.value.ipAddress || !newIp.value.reason) return
      isSubmitting.value = true
      try {
        await adminService.blockIp(newIp.value)
        newIp.value = { 
          ipAddress: '', 
          reason: '', 
          expiresUtc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
        showAddModal.value = false
        toast.success('IP blocked successfully.')
        await fetchIps()
      } catch (err) {
        toast.error('Failed to block IP.')
      } finally {
        isSubmitting.value = false
      }
    }

    const handleUnblock = async (ip: string) => {
      try {
        await adminService.unblockIp(ip)
        await fetchIps()
      } catch (err) {
        console.error('Failed to unblock IP:', err)
      }
    }

    const confirmingIp = ref<string | null>(null)
    let confirmTimeout: any = null

    const handleUnblockClick = (ip: string) => {
      if (confirmingIp.value === ip) {
        handleUnblock(ip)
        confirmingIp.value = null
        if (confirmTimeout) clearTimeout(confirmTimeout)
      } else {
        confirmingIp.value = ip
        if (confirmTimeout) clearTimeout(confirmTimeout)
        confirmTimeout = setTimeout(() => {
          confirmingIp.value = null
        }, 3000)
      }
    }

    const formatDateTime = (iso: string) => {
      try {
        return new Date(iso).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      } catch {
        return iso
      }
    }

    const isExpired = (dateStr: string) => {
      return new Date(dateStr) < new Date()
    }

    const truncate = (text: string, max: number) => {
      if (!text) return '—'
      return text.length <= max ? text : `${text.slice(0, max)}…`
    }

    onMounted(() => {
      fetchIps()
      window.addEventListener('app:refetch', fetchIps)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:refetch', fetchIps)
    })

    return {
      blockedIps,
      isLoading,
      showAddModal,
      isSubmitting,
      newIp,
      confirmingIp,
      handleAddIp,
      handleUnblockClick,
      formatDateTime,
      isExpired,
      truncate,
      isPrivacyMode
    }
  }
})
</script>

<style scoped lang="scss">
.admin-security {
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
}

.add-btn-premium {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--background-color-soft);
  color: var(--header-text-color);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-red-color);
    background: rgba(239, 68, 68, 0.05);
    color: var(--primary-red-color);
  }
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
  display: flex;
  flex-direction: column;

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
    grid-template-columns: 140px 1fr 150px 150px 100px;
    gap: 16px;
    align-items: center;
    padding: 0 16px;
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

      .col-actions {
        margin-top: 8px;
        padding-top: 16px !important;
        border-top: 1px solid var(--border-color) !important;
        border-bottom: none !important;
        justify-content: center;
        
        &::before { display: none; }
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

  .mono {
    font-family: ui-monospace, monospace;
    font-size: 13px;
  }

  .skeleton-row {
    pointer-events: none;
    td {
      display: flex;
      align-items: center;
    }
  }

  .ip-text {
    color: var(--primary-red-color);
    font-weight: 700;
    font-size: 13px;
  }

  .reason-cell {
    display: block;
    color: var(--header-text-color);
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .date-cell {
    font-size: 12px;
    color: var(--normal-text-color);
    opacity: 0.8;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;

    &.pending { background: #f59e0b; }
    &.closed { background: #10b981; }
  }

  .table-action-btn-red {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
    padding: 6px 0;
    width: 100%;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #ef4444;
      color: #fff;
    }

    &.is-confirming {
      background: #f59e0b;
      border-color: #d97706;
      color: #fff;
      animation: pulse 1.5s infinite;

      &:hover {
        background: #d97706;
      }
    }
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
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

/* Modal Form Styles */
.block-ip-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: var(--normal-text-color);
  }

  .input-container {
    position: relative;
    display: flex;
    align-items: center;

    .input-icon {
      position: absolute;
      left: 12px;
      color: var(--normal-text-color);
      opacity: 0.6;
    }

    input {
      width: 100%;
      height: 38px;
      padding: 0 12px 0 38px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      background: var(--background-color);
      color: var(--header-text-color);
      font-size: 14px;
      outline: none;
      transition: all 0.2s;

      &:focus { border-color: var(--primary-red-color); }
    }
  }

  textarea {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    background: var(--background-color);
    color: var(--header-text-color);
    font-size: 14px;
    outline: none;
    resize: none;
    transition: all 0.2s;

    &:focus { border-color: var(--primary-red-color); }
  }
}

.modal-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;

  button {
    padding: 10px 24px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--header-text-color);

    &:hover { background: var(--background-color-soft); }
  }

  .btn-primary-red {
    background: #ef4444;
    color: white;
    border: none;

    &:hover { background: #dc2626; }
    &:disabled { opacity: 0.7; cursor: not-allowed; }
  }
}
</style>


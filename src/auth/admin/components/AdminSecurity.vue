<template>
  <div class="admin-security glass-card">
    <div class="header-actions">
      <div class="title-with-icon">
        <font-awesome-icon icon="shield-halved" />
        <h3>Blocked IP Addresses</h3>
      </div>
      <button class="add-btn" @click="showAddForm = !showAddForm">
        <font-awesome-icon :icon="showAddForm ? 'xmark' : 'plus'" />
        {{ showAddForm ? 'Cancel' : 'Block New IP' }}
      </button>
    </div>

    <transition name="slide-down">
      <form v-if="showAddForm" @submit.prevent="handleAddIp" class="add-form">
        <div class="form-grid">
          <div class="form-group">
            <label>IP Address</label>
            <div class="input-wrapper">
              <font-awesome-icon icon="globe" class="input-icon" />
              <input v-model="newIp.ipAddress" type="text" placeholder="e.g. 192.168.1.1" required />
            </div>
          </div>
          <div class="form-group">
            <label>Expiry Date</label>
            <div class="input-wrapper">
              <font-awesome-icon icon="calendar-clock" class="input-icon" />
              <input v-model="newIp.expiresUtc" type="datetime-local" required />
            </div>
          </div>
          <div class="form-group full-width">
            <label>Reason for blocking</label>
            <div class="input-wrapper">
              <font-awesome-icon icon="comment-slash" class="input-icon" />
              <input v-model="newIp.reason" type="text" placeholder="e.g. Brute force attack" required />
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="block-btn" :disabled="isSubmitting">
            <font-awesome-icon v-if="isSubmitting" icon="spinner" spin />
            <font-awesome-icon v-else icon="ban" />
            {{ isSubmitting ? 'Blocking...' : 'Confirm Block' }}
          </button>
        </div>
      </form>
    </transition>

    <div v-if="isLoading" class="loading">
      <UISkeletonLoader v-for="i in 5" :key="i" height="50px" style="margin-bottom: 8px" />
    </div>
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Reason</th>
            <th>Blocked At</th>
            <th>Expires At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ip in blockedIps" :key="ip.id">
            <td class="ip-address">
              <font-awesome-icon icon="network-wired" class="row-icon" />
              {{ ip.ipAddress }}
            </td>
            <td class="reason-cell">{{ ip.reason }}</td>
            <td class="date-cell">{{ formatDate(ip.createdUtc) }}</td>
            <td class="date-cell">
              <span :class="['expiry-tag', isExpired(ip.expiresUtc) ? 'expired' : 'active']">
                {{ formatDate(ip.expiresUtc) }}
              </span>
            </td>
            <td>
              <button class="unblock-btn" @click="handleUnblock(ip.ipAddress)">
                <font-awesome-icon icon="unlock" />
                Unblock
              </button>
            </td>
          </tr>
          <tr v-if="blockedIps.length === 0">
            <td colspan="5" class="no-data">
              <div class="empty-state">
                <font-awesome-icon icon="check-circle" />
                <p>No IPs are currently blocked. Your system is clean!</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { BlockedIp, CreateBlockedIpRequest } from '@/services/api/admin/admin.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

export default defineComponent({
  name: 'AdminSecurity',
  components: { UISkeletonLoader },
  setup() {
    const blockedIps = ref<BlockedIp[]>([])
    const isLoading = ref(true)
    const showAddForm = ref(false)
    const isSubmitting = ref(false)
    
    const newIp = ref<CreateBlockedIpRequest>({
      ipAddress: '',
      reason: '',
      expiresUtc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
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
        await adminService.blockIp({
          ...newIp.value,
          expiresUtc: new Date(newIp.value.expiresUtc).toISOString()
        })
        newIp.value = { 
          ipAddress: '', 
          reason: '', 
          expiresUtc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) 
        }
        showAddForm.value = false
        await fetchIps()
      } catch (err) {
        alert('Failed to block IP.')
      } finally {
        isSubmitting.value = false
      }
    }

    const handleUnblock = async (ip: string) => {
      if (!confirm(`Are you sure you want to unblock IP ${ip}?`)) return
      try {
        await adminService.unblockIp(ip)
        await fetchIps()
      } catch (err) {
        alert('Failed to unblock IP.')
      }
    }

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    }

    const isExpired = (dateStr: string) => {
      return new Date(dateStr) < new Date()
    }

    onMounted(fetchIps)

    return {
      blockedIps,
      isLoading,
      showAddForm,
      isSubmitting,
      newIp,
      handleAddIp,
      handleUnblock,
      formatDate,
      isExpired
    }
  }
})
</script>

<style scoped lang="scss">
.admin-security {
  padding: 32px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  
  .title-with-icon {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--primary-red-color);
    h3 { margin: 0; font-size: 18px; color: var(--header-text-color); }
  }
  
  .add-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--header-text-color);
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    
    &:hover {
      background: var(--background-color-soft);
      border-color: var(--header-text-color);
    }
  }
}

.add-form {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--background-color-soft);
  border-radius: 16px;
  border: 1px solid var(--border-color);

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label { font-weight: 500; font-size: 13px; color: var(--normal-text-color); }

    &.full-width { grid-column: 1 / -1; }
  }

  .input-wrapper {
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
      padding: 12px 12px 12px 38px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-color);
      color: var(--header-text-color);
      font-size: 14px;
      
      &:focus { border-color: var(--primary-red-color); outline: none; }
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    
    .block-btn {
      background: #ef4444;
      color: white;
      border: none;
      padding: 12px 28px;
      border-radius: 10px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s;

      &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
      &:disabled { opacity: 0.7; cursor: not-allowed; }
    }
  }
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th, td {
    text-align: left;
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 800;
    color: var(--normal-text-color);
    letter-spacing: 0.05em;
  }

  td {
    font-size: 14px;
    color: var(--header-text-color);
    
    &.ip-address {
      font-family: 'Fira Code', monospace;
      font-weight: 500;
      color: #ef4444;
      display: flex;
      align-items: center;
      gap: 10px;

      .row-icon { opacity: 0.5; font-size: 12px; }
    }

    &.reason-cell {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    &.date-cell {
      color: var(--normal-text-color);
      font-size: 13px;
    }
  }

  .expiry-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;

    &.active { background: rgba(16, 185, 129, 0.1); color: var(--primary-green-color); }
    &.expired { background: rgba(239, 68, 68, 0.1); color: #ef4444; text-decoration: line-through; }
  }
}

.unblock-btn {
  background: transparent;
  border: 1px solid var(--primary-green-color);
  color: var(--primary-green-color);
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: var(--primary-green-color);
    color: white;
  }
}

.loading { padding: 40px 0; }

.no-data {
  padding: 60px !important;
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: var(--primary-green-color);
    font-size: 24px;
    opacity: 0.8;

    p { font-size: 16px; color: var(--normal-text-color); margin: 0; font-style: italic; }
  }
}

/* Transitions */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
</style>

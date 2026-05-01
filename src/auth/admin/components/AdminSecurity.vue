<template>
  <div class="admin-security glass-card">
    <div class="header-actions">
      <h3>Blocked IP Addresses</h3>
      <button class="add-btn" @click="showAddForm = !showAddForm">
        {{ showAddForm ? 'Cancel' : 'Block IP' }}
      </button>
    </div>

    <form v-if="showAddForm" @submit.prevent="handleAddIp" class="add-form">
      <div class="form-group">
        <input v-model="newIp.ip" type="text" placeholder="IP Address (e.g. 192.168.1.1)" required />
      </div>
      <div class="form-group flex-grow">
        <input v-model="newIp.reason" type="text" placeholder="Reason for blocking" required />
      </div>
      <button type="submit" class="save-btn" :disabled="isSubmitting">Block</button>
    </form>

    <div v-if="isLoading" class="loading">Loading...</div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>IP Address</th>
          <th>Reason</th>
          <th>Blocked At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ip in blockedIps" :key="ip.ip">
          <td class="ip-address">{{ ip.ip }}</td>
          <td>{{ ip.reason }}</td>
          <td class="date">{{ new Date(ip.blockedAt).toLocaleString() }}</td>
          <td>
            <button class="unblock-btn" @click="handleUnblock(ip.ip)">Unblock</button>
          </td>
        </tr>
        <tr v-if="blockedIps.length === 0">
          <td colspan="4" class="no-data">No IPs are currently blocked.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { BlockedIp } from '@/services/api/admin/admin.models'

export default defineComponent({
  name: 'AdminSecurity',
  setup() {
    const blockedIps = ref<BlockedIp[]>([])
    const isLoading = ref(true)
    const showAddForm = ref(false)
    const isSubmitting = ref(false)
    
    const newIp = ref<Partial<BlockedIp>>({
      ip: '',
      reason: ''
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
      if (!newIp.value.ip || !newIp.value.reason) return
      isSubmitting.value = true
      try {
        await adminService.blockIp({
          ip: newIp.value.ip,
          reason: newIp.value.reason,
          blockedAt: new Date().toISOString()
        })
        newIp.value = { ip: '', reason: '' }
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

    onMounted(fetchIps)

    return {
      blockedIps,
      isLoading,
      showAddForm,
      isSubmitting,
      newIp,
      handleAddIp,
      handleUnblock
    }
  }
})
</script>

<style scoped lang="scss">
.admin-security {
  padding: 24px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 { margin: 0; font-size: 18px; }
  
  .add-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--header-text-color);
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    
    &:hover {
      background: var(--background-color-soft);
    }
  }
}

.add-form {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  background: var(--background-color-soft);
  padding: 16px;
  border-radius: 8px;

  .form-group {
    input {
      width: 100%;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-color);
      color: var(--header-text-color);
    }
  }
  
  .flex-grow {
    flex-grow: 1;
  }
  
  .save-btn {
    background: var(--primary-red-color);
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th, td {
    text-align: left;
    padding: 12px;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    font-size: 12px;
    text-transform: uppercase;
    color: var(--normal-text-color);
  }

  td {
    font-size: 14px;
    
    &.ip-address {
      font-family: monospace;
      font-weight: bold;
    }
    
    &.date {
      color: var(--normal-text-color);
      font-size: 13px;
    }
  }
}

.unblock-btn {
  background: transparent;
  border: 1px solid var(--primary-green-color);
  color: var(--primary-green-color);
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: var(--primary-green-color);
    color: white;
  }
}

.no-data, .loading {
  text-align: center;
  padding: 40px !important;
  color: var(--normal-text-color);
}
</style>

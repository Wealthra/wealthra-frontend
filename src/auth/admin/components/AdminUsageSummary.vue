<template>
  <div class="table-container">
    <table class="admin-table">
      <thead>
        <tr>
          <th>{{ t.user }}</th>
          <th>{{ t.tier }}</th>
          <th>{{ t.chatUsage }}</th>
          <th>{{ t.scanUsage }}</th>
          <th>{{ t.lastActive }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usage in usages" :key="usage.email">
          <td>
            <div class="user-cell">
              <span class="user-name">{{ usage.name }}</span>
              <span class="user-email">{{ usage.email }}</span>
            </div>
          </td>
          <td>
            <span class="tier-badge">{{ usage.tier }}</span>
          </td>
          <td>
            <div class="usage-bar-container">
              <div class="usage-info">
                <span>{{ usage.aiChatUsage }} / {{ usage.aiChatLimit }}</span>
                <span>{{ Math.round((usage.aiChatUsage / usage.aiChatLimit) * 100) }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: Math.min((usage.aiChatUsage / usage.aiChatLimit) * 100, 100) + '%' }"
                  :class="{ warning: usage.aiChatUsage / usage.aiChatLimit > 0.8 }"
                ></div>
              </div>
            </div>
          </td>
          <td>
            <div class="usage-bar-container">
              <div class="usage-info">
                <span>{{ usage.receiptScanUsage }} / {{ usage.receiptScanLimit }}</span>
                <span>{{ Math.round((usage.receiptScanUsage / usage.receiptScanLimit) * 100) }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: Math.min((usage.receiptScanUsage / usage.receiptScanLimit) * 100, 100) + '%' }"
                  :class="{ warning: usage.receiptScanUsage / usage.receiptScanLimit > 0.8 }"
                ></div>
              </div>
            </div>
          </td>
          <td>
            <span class="date-cell">{{ formatDate(usage.lastActive) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type { PropType } from 'vue'
import type { AdminUserUsageSummary } from '@/services/api/adminPlans/adminPlans.models'

export default defineComponent({
  name: 'AdminUsageSummary',
  props: {
    usages: {
      type: Array as PropType<AdminUserUsageSummary[]>,
      required: true
    },
    selectedLanguage: {
      type: String,
      default: 'English'
    }
  },
  setup(props) {
    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        user: isTr ? 'Kullanıcı' : 'User',
        tier: isTr ? 'Seviye' : 'Tier',
        chatUsage: isTr ? 'AI Sohbet' : 'AI Chat',
        scanUsage: isTr ? 'Fiş Tarama' : 'Receipt Scan',
        lastActive: isTr ? 'Son Aktif' : 'Last Active'
      }
    })

    const formatDate = (dateStr: string) => {
      if (!dateStr) return 'N/A'
      const date = new Date(dateStr)
      return date.toLocaleDateString(props.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return { t, formatDate }
  }
})
</script>

<style scoped lang="scss">
.table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    padding: 16px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--normal-text-color);
    border-bottom: 1px solid var(--border-color);
  }

  td {
    padding: 16px;
    font-size: 14px;
    color: var(--header-text-color);
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
  }
}

.user-cell {
  display: flex;
  flex-direction: column;
  
  .user-name { font-weight: 600; }
  .user-email { font-size: 11px; color: var(--normal-text-color); }
}

.tier-badge {
  background: var(--hover-color);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.usage-bar-container {
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .usage-info {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 600;
    color: var(--normal-text-color);
  }

  .progress-bar {
    height: 6px;
    background: var(--background-color-soft);
    border-radius: 3px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: var(--primary-green-color);
      border-radius: 3px;
      transition: width 0.3s ease;

      &.warning {
        background: #ffc107;
      }
    }
  }
}

.date-cell {
  font-size: 13px;
  color: var(--normal-text-color);
}
</style>

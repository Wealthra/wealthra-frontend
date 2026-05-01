<template>
  <div class="usage-summary-container">
    <!-- Stat Cards -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">{{ t.totalUsers }}</div>
        <div class="stat-value">{{ summary.totalUsers }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">{{ t.activePlans }}</div>
        <div class="stat-value">{{ summary.activePlans }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">{{ t.totalOcr }}</div>
        <div class="stat-value">{{ summary.totalOcrRequestsThisMonth }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">{{ t.totalStt }}</div>
        <div class="stat-value">{{ summary.totalSttRequestsThisMonth }}</div>
      </div>
    </div>

    <!-- Breakdown Table -->
    <div class="glass-card mt-6">
      <h3 class="breakdown-title">{{ t.planBreakdown }}</h3>
      <div class="table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>{{ t.plan }}</th>
              <th>{{ t.userCount }}</th>
              <th>{{ t.ocrUsage }}</th>
              <th>{{ t.sttUsage }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in summary.planBreakdown" :key="item.planId || 'null'">
              <td>
                <span class="plan-name-tag">{{ item.planName }}</span>
              </td>
              <td>{{ item.userCount }}</td>
              <td>{{ item.totalOcrRequests }}</td>
              <td>{{ item.totalSttRequests }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type { PropType } from 'vue'
import type { AdminUsageSummary } from '@/services/api/adminPlans/adminPlans.models'

export default defineComponent({
  name: 'AdminUsageSummary',
  props: {
    summary: {
      type: Object as PropType<AdminUsageSummary>,
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
        totalUsers: isTr ? 'Toplam Kullanıcı' : 'Total Users',
        activePlans: isTr ? 'Aktif Planlar' : 'Active Plans',
        totalOcr: isTr ? 'Toplam OCR' : 'Total OCR',
        totalStt: isTr ? 'Toplam STT' : 'Total STT',
        planBreakdown: isTr ? 'Plan Dağılımı' : 'Plan Breakdown',
        plan: isTr ? 'Plan' : 'Plan',
        userCount: isTr ? 'Kullanıcı Sayısı' : 'User Count',
        ocrUsage: isTr ? 'OCR Kullanımı' : 'OCR Usage',
        sttUsage: isTr ? 'STT Kullanımı' : 'STT Usage'
      }
    })

    return { t }
  }
})
</script>

<style scoped lang="scss">
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .stat-label {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--normal-text-color);
    text-transform: uppercase;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 800;
    color: var(--primary-green-color);
  }
}

.mt-6 { margin-top: 24px; }

.breakdown-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--header-text-color);
}

.table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    padding: 12px 16px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--normal-text-color);
    border-bottom: 1px solid var(--border-color);
  }

  td {
    padding: 12px 16px;
    font-size: var(--font-size-sm);
    color: var(--header-text-color);
    border-bottom: 1px solid var(--border-color);
  }
}

.plan-name-tag {
  background: var(--hover-color);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.glass-card {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>

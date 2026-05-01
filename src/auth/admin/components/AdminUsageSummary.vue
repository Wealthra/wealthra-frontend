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
    <div class="glass-card breakdown-card mt-6">
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
              <td :data-label="t.plan">
                <span class="plan-name-tag">{{ item.planName }}</span>
              </td>
              <td :data-label="t.userCount">{{ item.userCount }}</td>
              <td :data-label="t.ocrUsage">{{ item.totalOcrRequests }}</td>
              <td :data-label="t.sttUsage">{{ item.totalSttRequests }}</td>
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
.usage-summary-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, 1fr);
  }
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
    font-weight: 500;
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

.breakdown-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.table-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    padding: 16px 20px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    color: var(--normal-text-color);
    border-bottom: 1px solid var(--border-color);
    white-space: nowrap;
  }

  td {
    padding: 16px 20px;
    font-size: var(--font-size-sm);
    color: var(--header-text-color);
    border-bottom: 1px solid var(--border-color);
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    thead {
      display: none;
    }

    tr {
      display: block;
      padding: 16px;
      border-bottom: 2px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }
    }

    td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--background-color-soft);
      white-space: normal;
      text-align: right;

      &:last-child {
        border-bottom: none;
      }

      &::before {
        content: attr(data-label);
        font-weight: 500;
        font-size: 11px;
        text-transform: uppercase;
        color: var(--normal-text-color);
        margin-right: 16px;
        text-align: left;
      }
    }
  }
}

.plan-name-tag {
  background: var(--hover-color);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.glass-card {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>

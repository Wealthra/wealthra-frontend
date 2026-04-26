<template>
  <div class="table-container">
    <table class="admin-table">
      <thead>
        <tr>
          <th>{{ t.name }}</th>
          <th>{{ t.price }}</th>
          <th>{{ t.chatLimit }}</th>
          <th>{{ t.scanLimit }}</th>
          <th>{{ t.popularity }}</th>
          <th class="actions-cell">{{ t.actions }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="plan in plans" :key="plan.id">
          <td>
            <div class="plan-name-cell">
              <span class="plan-name">{{ plan.name }}</span>
              <span class="plan-id">ID: {{ plan.id }}</span>
            </div>
          </td>
          <td>
            <span class="price-badge">{{ plan.price }} {{ plan.currency }}</span>
          </td>
          <td>{{ plan.aiChatLimit }}</td>
          <td>{{ plan.receiptScanLimit }}</td>
          <td>
            <span v-if="plan.isPopular" class="popular-badge">{{ t.popular }}</span>
            <span v-else class="normal-badge">{{ t.regular }}</span>
          </td>
          <td class="actions-cell">
            <button class="action-btn edit" @click="$emit('edit', plan)" :title="t.edit">
              <font-awesome-icon icon="pen-to-square" />
            </button>
            <button class="action-btn delete" @click="$emit('delete', plan.id)" :title="t.delete">
              <font-awesome-icon icon="trash-can" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type { PropType } from 'vue'
import type { AdminPlan } from '@/services/api/adminPlans/adminPlans.models'

export default defineComponent({
  name: 'AdminPlanTable',
  props: {
    plans: {
      type: Array as PropType<AdminPlan[]>,
      required: true
    },
    selectedLanguage: {
      type: String,
      default: 'English'
    }
  },
  emits: ['edit', 'delete'],
  setup(props) {
    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        name: isTr ? 'İsim' : 'Name',
        price: isTr ? 'Fiyat' : 'Price',
        chatLimit: isTr ? 'Sohbet Limiti' : 'Chat Limit',
        scanLimit: isTr ? 'Tarama Limiti' : 'Scan Limit',
        popularity: isTr ? 'Popülerlik' : 'Popularity',
        actions: isTr ? 'İşlemler' : 'Actions',
        popular: isTr ? 'Popüler' : 'Popular',
        regular: isTr ? 'Normal' : 'Regular',
        edit: isTr ? 'Düzenle' : 'Edit',
        delete: isTr ? 'Sil' : 'Delete'
      }
    })

    return { t }
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

  tr:last-child td {
    border-bottom: none;
  }
}

.plan-name-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .plan-name {
    font-weight: 600;
  }

  .plan-id {
    font-size: 11px;
    color: var(--normal-text-color);
  }
}

.price-badge {
  background: var(--background-color-soft);
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 700;
  color: var(--primary-green-color);
}

.popular-badge {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.normal-badge {
  color: var(--normal-text-color);
  font-size: 11px;
}

.actions-cell {
  text-align: right;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &.edit {
    color: var(--primary-blue-color);
    &:hover { background: var(--primary-blue-color); color: white; border-color: var(--primary-blue-color); }
  }

  &.delete {
    color: var(--primary-red-color);
    &:hover { background: var(--primary-red-color); color: white; border-color: var(--primary-red-color); }
  }
}
</style>

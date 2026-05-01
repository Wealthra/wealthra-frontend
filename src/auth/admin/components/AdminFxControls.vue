<template>
  <div class="admin-fx-controls">
    <div class="split-layout">
      <!-- Manual Rates -->
      <div class="panel glass-card">
        <h3>Manual FX Rates</h3>
        <form @submit.prevent="handleSaveManualRate" class="inline-form">
          <div class="form-group">
            <input v-model="newRate.currencyPair" placeholder="Pair (e.g. USD-EUR)" required />
          </div>
          <div class="form-group">
            <input v-model.number="newRate.rate" type="number" step="0.0001" placeholder="Rate" required />
          </div>
          <button type="submit" class="save-btn" :disabled="isSavingRate">Save</button>
        </form>

        <div v-if="isLoadingRates" class="loading">Loading...</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Rate</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rate in manualRates" :key="rate.currencyPair">
              <td>{{ rate.currencyPair }}</td>
              <td>{{ rate.rate }}</td>
              <td>{{ new Date(rate.lastUpdated).toLocaleString() }}</td>
            </tr>
            <tr v-if="manualRates.length === 0">
              <td colspan="3" class="no-data">No manual rates configured.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Provider Priority -->
      <div class="panel glass-card">
        <h3>Provider Priority Order</h3>
        <p class="desc">Drag to reorder or update as comma-separated list.</p>
        
        <form @submit.prevent="handleUpdateProviders" class="full-form">
          <div class="form-group">
            <textarea 
              v-model="providerOrderStr" 
              rows="4" 
              placeholder="e.g. OpenExchangeRates, Fixer, Manual"
            ></textarea>
          </div>
          <div class="actions">
            <button type="submit" class="save-btn" :disabled="isSavingProviders">
              {{ isSavingProviders ? 'Saving...' : 'Update Order' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { FxRate } from '@/services/api/admin/admin.models'

export default defineComponent({
  name: 'AdminFxControls',
  setup() {
    const manualRates = ref<FxRate[]>([])
    const isLoadingRates = ref(true)
    const isSavingRate = ref(false)
    const newRate = ref<Partial<FxRate>>({ currencyPair: '', rate: 1 })

    const providerOrderStr = ref('')
    const isSavingProviders = ref(false)

    const fetchRates = async () => {
      try {
        manualRates.value = await adminService.getManualRates()
      } catch (err) {
        console.error(err)
      } finally {
        isLoadingRates.value = false
      }
    }

    const fetchProviders = async () => {
      try {
        const order = await adminService.getProviderOrder()
        providerOrderStr.value = order.join(', ')
      } catch (err) {
        console.error(err)
      }
    }

    const handleSaveManualRate = async () => {
      if (!newRate.value.currencyPair || !newRate.value.rate) return
      isSavingRate.value = true
      try {
        await adminService.setManualRate({
          currencyPair: newRate.value.currencyPair.toUpperCase(),
          rate: newRate.value.rate,
          lastUpdated: new Date().toISOString()
        })
        newRate.value = { currencyPair: '', rate: 1 }
        await fetchRates()
      } catch (err) {
        alert('Failed to save manual rate')
      } finally {
        isSavingRate.value = false
      }
    }

    const handleUpdateProviders = async () => {
      isSavingProviders.value = true
      try {
        const orderArray = providerOrderStr.value.split(',').map(s => s.trim()).filter(Boolean)
        await adminService.updateProviderOrder(orderArray)
        await fetchProviders()
        alert('Provider order updated successfully')
      } catch (err) {
        alert('Failed to update provider order')
      } finally {
        isSavingProviders.value = false
      }
    }

    onMounted(() => {
      fetchRates()
      fetchProviders()
    })

    return {
      manualRates,
      isLoadingRates,
      isSavingRate,
      newRate,
      providerOrderStr,
      isSavingProviders,
      handleSaveManualRate,
      handleUpdateProviders
    }
  }
})
</script>

<style scoped lang="scss">
.split-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .split-layout {
    grid-template-columns: 1fr;
  }
}

.panel {
  padding: 24px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
  }

  .desc {
    font-size: 13px;
    color: var(--normal-text-color);
    margin-bottom: 16px;
  }
}

.inline-form {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;

  .form-group {
    flex-grow: 1;
    input {
      width: 100%;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-color-soft);
      color: var(--header-text-color);
    }
  }
}

.full-form {
  display: flex;
  flex-direction: column;
  gap: 16px;

  textarea {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--background-color-soft);
    color: var(--header-text-color);
    font-family: monospace;
    resize: vertical;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }
}

.save-btn {
  background: var(--primary-green-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
  }
}

.no-data {
  text-align: center;
  color: var(--normal-text-color);
  padding: 24px !important;
}
</style>

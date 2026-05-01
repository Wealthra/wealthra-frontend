<template>
  <div class="admin-fx-controls">
    <div class="split-layout">
      <!-- Manual Rates -->
      <div class="panel glass-card">
        <div class="panel-header">
          <font-awesome-icon icon="money-bill-transfer" />
          <h3>Manual FX Rates</h3>
        </div>
        <form @submit.prevent="handleSaveManualRate" class="inline-form">
          <div class="form-group">
            <input v-model="newRate.fromCurrency" placeholder="From (USD)" required />
          </div>
          <div class="form-group">
            <input v-model="newRate.toCurrency" placeholder="To (EUR)" required />
          </div>
          <div class="form-group">
            <input v-model.number="newRate.rate" type="number" step="0.0001" placeholder="Rate" required />
          </div>
          <button type="submit" class="save-btn" :disabled="isSavingRate">
            <font-awesome-icon v-if="isSavingRate" icon="spinner" spin />
            <font-awesome-icon v-else icon="plus" />
          </button>
        </form>

        <div v-if="isLoadingRates" class="loading">
          <UISkeletonLoader v-for="i in 5" :key="i" height="40px" style="margin-bottom: 8px" />
        </div>
        <div v-else class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Rate</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rate in manualRates" :key="rate.id">
                <td><span class="currency-tag">{{ rate.fromCurrency }}</span></td>
                <td><span class="currency-tag">{{ rate.toCurrency }}</span></td>
                <td class="rate-value">{{ rate.rate.toFixed(4) }}</td>
                <td class="date-cell">{{ formatDate(rate.updatedOn) }}</td>
              </tr>
              <tr v-if="manualRates.length === 0">
                <td colspan="4" class="no-data">No manual rates configured.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Provider Priority -->
      <div class="panel glass-card">
        <div class="panel-header">
          <font-awesome-icon icon="server" />
          <h3>Provider Priority Order</h3>
        </div>
        <p class="desc">JSON configuration for FX provider fallback sequence.</p>
        
        <form @submit.prevent="handleUpdateProviders" class="full-form">
          <div class="form-group">
            <div class="editor-wrapper">
              <textarea 
                v-model="providerOrderJson" 
                rows="8" 
                placeholder='["OpenExchangeRates", "Fixer", "Manual"]'
                spellcheck="false"
              ></textarea>
            </div>
          </div>
          <div class="actions">
            <button type="submit" class="save-btn" :disabled="isSavingProviders">
              <font-awesome-icon v-if="isSavingProviders" icon="spinner" spin />
              <font-awesome-icon v-else icon="save" />
              {{ isSavingProviders ? 'Saving...' : 'Update Config' }}
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
import type { FxRate, CreateFxRateRequest } from '@/services/api/admin/admin.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

export default defineComponent({
  name: 'AdminFxControls',
  components: { UISkeletonLoader },
  setup() {
    const manualRates = ref<FxRate[]>([])
    const isLoadingRates = ref(true)
    const isSavingRate = ref(false)
    const newRate = ref<CreateFxRateRequest>({ fromCurrency: '', toCurrency: '', rate: 1.0 })

    const providerOrderJson = ref('')
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
        providerOrderJson.value = order
      } catch (err) {
        console.error(err)
      }
    }

    const handleSaveManualRate = async () => {
      if (!newRate.value.fromCurrency || !newRate.value.toCurrency || !newRate.value.rate) return
      isSavingRate.value = true
      try {
        await adminService.setManualRate({
          fromCurrency: newRate.value.fromCurrency.toUpperCase(),
          toCurrency: newRate.value.toCurrency.toUpperCase(),
          rate: newRate.value.rate
        })
        newRate.value = { fromCurrency: '', toCurrency: '', rate: 1.0 }
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
        await adminService.updateProviderOrder(providerOrderJson.value)
        await fetchProviders()
        alert('Provider order updated successfully')
      } catch (err) {
        alert('Failed to update provider order. Ensure valid JSON.')
      } finally {
        isSavingProviders.value = false
      }
    }

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
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
      providerOrderJson,
      isSavingProviders,
      handleSaveManualRate,
      handleUpdateProviders,
      formatDate
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

@media (max-width: 1024px) {
  .split-layout {
    grid-template-columns: 1fr;
  }
}

.panel {
  padding: 28px;
  display: flex;
  flex-direction: column;
  
  .panel-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    color: var(--primary-green-color);

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: var(--header-text-color);
    }
  }

  .desc {
    font-size: 13px;
    color: var(--normal-text-color);
    margin-bottom: 20px;
    opacity: 0.8;
  }
}

.inline-form {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;

  .form-group {
    flex: 1;
    input {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-color-soft);
      color: var(--header-text-color);
      font-size: 14px;
      
      &:focus {
        border-color: var(--primary-green-color);
        outline: none;
      }
    }
  }

  .save-btn {
    width: 44px;
    height: 44px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-green-color);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;

    &:hover { transform: scale(1.05); }
    &:disabled { opacity: 0.7; cursor: not-allowed; }
  }
}

.table-wrapper {
  overflow-x: auto;
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
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 800;
    color: var(--normal-text-color);
    letter-spacing: 0.05em;
  }

  td {
    font-size: 14px;
    color: var(--header-text-color);
  }

  .currency-tag {
    background: var(--background-color-soft);
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
    font-size: 12px;
    border: 1px solid var(--border-color);
  }

  .rate-value {
    font-family: monospace;
    font-weight: 500;
    color: var(--primary-green-color);
  }

  .date-cell {
    font-size: 12px;
    color: var(--normal-text-color);
    opacity: 0.8;
  }
}

.full-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;

  .editor-wrapper {
    background: #1e1e1e;
    border-radius: 12px;
    padding: 4px;
    border: 1px solid var(--border-color);
  }

  textarea {
    width: 100%;
    padding: 16px;
    background: transparent;
    color: #e0e0e0;
    font-family: 'Fira Code', monospace;
    font-size: 13px;
    border: none;
    resize: none;
    line-height: 1.6;
    
    &:focus { outline: none; }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    
    .save-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      background: var(--primary-green-color);
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 500;
      cursor: pointer;
      
      &:hover { transform: translateY(-1px); }
      &:disabled { opacity: 0.7; }
    }
  }
}

.loading {
  padding: 20px 0;
}

.no-data {
  text-align: center;
  color: var(--normal-text-color);
  padding: 40px !important;
  font-style: italic;
}
</style>

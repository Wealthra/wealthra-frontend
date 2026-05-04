<template>
  <div class="admin-fx-controls fx-container">
    <div class="header">
      <h1 class="fx-title">
        <font-awesome-icon icon="money-bill-transfer" class="title-icon" />
        {{ selectedLanguage === 'Turkish' ? 'Manuel Döviz Kurları' : 'Manual FX Rates' }}
      </h1>
      
      <form @submit.prevent="handleSaveManualRate" class="quick-add-form">
        <div class="form-inputs">
          <div class="input-group">
            <UISelect
              v-model="newRate.fromCurrency"
              :options="currencyOptions"
              :placeholder="selectedLanguage === 'Turkish' ? 'Kaynak' : 'From'"
              :disabled="isLoadingRates"
              compact
              required
            />
          </div>
          <div class="input-group">
            <UISelect
              v-model="newRate.toCurrency"
              :options="currencyOptions"
              :placeholder="selectedLanguage === 'Turkish' ? 'Hedef' : 'To'"
              :disabled="isLoadingRates"
              compact
              required
            />
          </div>
          <div class="input-group input-group--number">
            <input v-model.number="newRate.rate" type="number" step="0.0001" :placeholder="selectedLanguage === 'Turkish' ? 'Kur' : 'Rate'" :disabled="isLoadingRates" required />
          </div>
        </div>
        <button type="submit" class="add-btn" :disabled="isSavingRate || isLoadingRates" :aria-label="selectedLanguage === 'Turkish' ? 'Ekle' : 'Add'">
          <font-awesome-icon v-if="isSavingRate" icon="spinner" spin />
          <font-awesome-icon v-else icon="plus" />
        </button>
      </form>
    </div>

    <div class="table-wrap" :class="{ 'table-wrap--empty': !isLoadingRates && manualRates.length === 0 }">
      <div v-if="isLoadingRates || manualRates.length > 0" class="table" role="table">
        <div class="table-header" role="row">
          <div class="col col-pair" role="columnheader">{{ selectedLanguage === 'Turkish' ? 'Parite' : 'Pair' }}</div>
          <div class="col col-rate" role="columnheader">{{ selectedLanguage === 'Turkish' ? 'Kur' : 'Rate' }}</div>
          <div class="col col-updated" role="columnheader">{{ selectedLanguage === 'Turkish' ? 'Son Güncelleme' : 'Last Updated' }}</div>
          <div class="col col-actions" role="columnheader"></div>
        </div>

        <template v-if="isLoadingRates">
          <div v-for="i in 5" :key="i" class="table-row skeleton-row-fidelity" role="row">
            <div class="col col-pair">
              <UISkeletonLoader width="60px" height="24px" border-radius="6px" />
              <UISkeletonLoader width="12px" height="12px" border-radius="2px" />
              <UISkeletonLoader width="60px" height="24px" border-radius="6px" />
            </div>
            <div class="col col-rate">
              <UISkeletonLoader width="100px" height="24px" border-radius="4px" />
            </div>
            <div class="col col-updated">
              <UISkeletonLoader width="140px" height="14px" border-radius="4px" />
            </div>
            <div class="col col-actions">
              <UISkeletonLoader width="60px" height="24px" border-radius="4px" />
            </div>
          </div>
        </template>
        
        <template v-else>
          <div 
            v-for="rate in manualRates" 
            :key="rate.id" 
            class="table-row" 
            role="row"
            @dblclick="startEditing(rate)"
            :title="selectedLanguage === 'Turkish' ? 'Düzenlemek için çift tıkla' : 'Double click to edit'"
          >
            <div class="col col-pair" :data-label="selectedLanguage === 'Turkish' ? 'Parite' : 'Pair'">
              <span class="currency-badge">{{ rate.fromCurrency }}</span>
              <font-awesome-icon icon="chevron-right" class="pair-arrow" />
              <span class="currency-badge">{{ rate.toCurrency }}</span>
            </div>
            <div class="col col-rate" :data-label="selectedLanguage === 'Turkish' ? 'Kur' : 'Rate'">
              <template v-if="editingId === rate.id">
                <input 
                  v-model.number="editingRate" 
                  type="number" 
                  step="0.0001" 
                  class="edit-input" 
                  @keyup.enter="handleUpdateRate(rate.id)" 
                  @keyup.esc="cancelEditing"
                  autoFocus
                />
              </template>
              <span v-else class="rate-value">{{ isPrivacyMode ? '••••' : rate.rate.toFixed(4) }}</span>
            </div>
            <div class="col col-updated" :data-label="selectedLanguage === 'Turkish' ? 'Son Güncelleme' : 'Last Updated'">
              <span class="date-text">{{ formatDate(rate.updatedOn) }}</span>
            </div>
            <div class="col col-actions">
              <template v-if="editingId === rate.id">
                <button class="action-btn save" @click="handleUpdateRate(rate.id)" :title="selectedLanguage === 'Turkish' ? 'Kaydet' : 'Save'">
                  <font-awesome-icon icon="check" />
                </button>
                <button class="action-btn cancel" @click="cancelEditing" :title="selectedLanguage === 'Turkish' ? 'İptal' : 'Cancel'">
                  <font-awesome-icon icon="xmark" />
                </button>
              </template>
              <template v-else>
                <button class="action-btn edit" @click="startEditing(rate)" :title="selectedLanguage === 'Turkish' ? 'Düzenle' : 'Edit'">
                  <font-awesome-icon icon="pen" />
                </button>
                <button 
                  class="action-btn delete" 
                  :class="{ 'delete--confirming': isConfirmingDeleteId === rate.id }"
                  @click.stop="handleDeleteClick(rate.id)" 
                  :title="selectedLanguage === 'Turkish' ? (isConfirmingDeleteId === rate.id ? 'Onaylamak için tekrar tıkla' : 'Sil') : (isConfirmingDeleteId === rate.id ? 'Click again to confirm' : 'Delete')"
                >
                  <font-awesome-icon v-if="isConfirmingDeleteId === rate.id" icon="triangle-exclamation" />
                  <font-awesome-icon v-else icon="trash" />
                </button>
              </template>
            </div>
          </div>
        </template>
      </div>

      <div v-if="!isLoadingRates && manualRates.length === 0" class="empty-state">
        <div class="empty-state__icon-wrap">
          <font-awesome-icon :icon="emptyStateIcons.incomeSources" class="empty-state__icon" aria-hidden="true" />
        </div>
        <h2 class="empty-state__heading">
          {{ selectedLanguage === 'Turkish' ? 'Kur yapılandırması yok' : 'No manual rates configured' }}
        </h2>
        <p class="empty-state__text">
          {{ selectedLanguage === 'Turkish' ? 'Henüz manuel bir döviz kuru eklemediniz.' : 'You haven\'t added any manual exchange rates yet.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import type { PropType } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { FxRate, CreateFxRateRequest } from '@/services/api/admin/admin.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import UISelect from '@/components/UISelect.vue'
import { useCurrency } from '@/composables/useCurrency'
import { emptyStateIcons } from '@/icons/fontawesome-icons'

export default defineComponent({
  name: 'AdminFxControls',
  components: { UISkeletonLoader, UISelect },
  props: {
    selectedLanguage: {
      type: String as PropType<'English' | 'Turkish'>,
      default: 'English'
    }
  },
  setup(props) {
    const { isPrivacyMode } = useCurrency()
    const manualRates = ref<FxRate[]>([])
    const isLoadingRates = ref(true)
    const isSavingRate = ref(false)
    const newRate = ref<CreateFxRateRequest>({ fromCurrency: 'USD', toCurrency: 'TRY', rate: 1.0 })
    const editingId = ref<number | null>(null)
    const editingRate = ref<number>(0)
    const isConfirmingDeleteId = ref<number | null>(null)

    const currencyOptions = [
      { label: 'USD', value: 'USD' },
      { label: 'EUR', value: 'EUR' },
      { label: 'TRY', value: 'TRY' }
    ]

    const fetchRates = async () => {
      isLoadingRates.value = true
      try {
        manualRates.value = await adminService.getManualRates()
      } catch (err) {
        console.error(err)
      } finally {
        isLoadingRates.value = false
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
        console.error('Failed to save manual rate', err)
      } finally {
        isSavingRate.value = false
      }
    }

    const startEditing = (rate: FxRate) => {
      editingId.value = rate.id
      editingRate.value = rate.rate
    }

    const cancelEditing = () => {
      editingId.value = null
    }

    const handleUpdateRate = async (id: number) => {
      try {
        await adminService.updateManualRate(id, editingRate.value)
        editingId.value = null
        await fetchRates()
      } catch (err) {
        console.error('Failed to update rate', err)
      }
    }

    const handleDeleteClick = (id: number) => {
      if (isConfirmingDeleteId.value === id) {
        handleDeleteRate(id)
        isConfirmingDeleteId.value = null
      } else {
        isConfirmingDeleteId.value = id
        setTimeout(() => {
          if (isConfirmingDeleteId.value === id) isConfirmingDeleteId.value = null
        }, 3000)
      }
    }

    const handleDeleteRate = async (id: number) => {
      try {
        await adminService.deleteManualRate(id)
        await fetchRates()
      } catch (err) {
        console.error('Failed to delete rate', err)
      }
    }

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    }

    const handleGlobalRefetch = () => {
      fetchRates()
    }

    onMounted(() => {
      fetchRates()
      window.addEventListener('app:refetch', handleGlobalRefetch)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:refetch', handleGlobalRefetch)
    })

    return {
      manualRates,
      isLoadingRates,
      isSavingRate,
      newRate,
      currencyOptions,
      handleSaveManualRate,
      startEditing,
      cancelEditing,
      handleUpdateRate,
      handleDeleteClick,
      editingId,
      editingRate,
      isConfirmingDeleteId,
      formatDate,
      handleGlobalRefetch,
      isPrivacyMode,
      emptyStateIcons
    }
  }
})
</script>

<style scoped lang="scss">
.fx-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: 1.5rem 1.25rem;
  border: 1px solid var(--border-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.fx-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: var(--header-text-color);
  display: flex;
  align-items: center;
  gap: 12px;

  .title-icon {
    color: var(--primary-green-color);
    font-size: 1.1rem;
  }
}

/* Quick Add Form */
.quick-add-form {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--background-color-soft);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--border-color);

  .form-inputs {
    display: flex;
    gap: 8px;
  }

  .input-group {
    input {
      width: 90px;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-color);
      color: var(--header-text-color);
      font-size: 0.8rem;
      font-weight: 500;
      transition: all 0.2s;
      height: 32px;

      &:focus {
        border-color: var(--primary-green-color);
        outline: none;
        box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
      }
    }

    .ui-select {
      width: 90px;
    }

    &--number input {
      width: 110px;
    }
  }

  .add-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-green-color);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

/* Table Style */
.table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  &.table-wrap--empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
  }
}

.table {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 200px 1fr 200px 100px;
  gap: 1.5rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  font-weight: 700;
  font-size: 0.75rem;
  color: var(--normal-text-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-row {
  display: grid;
  grid-template-columns: 200px 1fr 200px 100px;
  gap: 1.5rem;
  padding: 1rem 1.25rem;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
}

.col {
  min-width: 0;
  display: flex;
  align-items: center;
}

.col-pair {
  gap: 12px;
  
  .currency-badge {
    background: var(--background-color-soft);
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.8rem;
    color: var(--header-text-color);
    border: 1px solid var(--border-color);
    font-family: monospace;
  }

  .pair-arrow {
    font-size: 0.7rem;
    color: var(--normal-text-color);
    opacity: 0.5;
  }
}

.col-rate {
  .rate-value {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--primary-green-color);
    font-family: 'Fira Code', monospace;
    letter-spacing: -0.02em;
  }
}

.col-updated {
  .date-text {
    font-size: 0.8rem;
    color: var(--normal-text-color);
    font-weight: 500;
  }
}

.col-actions {
  justify-content: flex-end;
  gap: 8px;

  .action-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--background-color);
    color: var(--normal-text-color);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.85rem;

    &:hover {
      background: var(--background-color-soft);
      color: var(--header-text-color);
    }

    &.save {
      color: var(--primary-green-color);
      border-color: rgba(34, 197, 94, 0.3);
      &:hover { background: rgba(34, 197, 94, 0.1); }
    }

    &.cancel {
      color: var(--error-red-color, #ef4444);
      border-color: rgba(239, 68, 68, 0.3);
      &:hover { background: rgba(239, 68, 68, 0.1); }
    }

    &.delete {
      &:hover {
        color: var(--error-red-color, #ef4444);
        border-color: rgba(239, 68, 68, 0.3);
        background: rgba(239, 68, 68, 0.1);
      }

      &--confirming {
        background: rgba(239, 68, 68, 0.1) !important;
        color: var(--error-red-color, #ef4444) !important;
        border-color: var(--error-red-color, #ef4444) !important;
        animation: pulse-border 1.5s infinite;
      }
    }

    &.edit {
      &:hover {
        color: var(--primary-green-color);
        border-color: rgba(34, 197, 94, 0.3);
        background: rgba(34, 197, 94, 0.1);
      }
    }
  }
}

.edit-input {
  width: 110px;
  height: 32px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid var(--primary-green-color);
  background: var(--background-color);
  color: var(--header-text-color);
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Fira Code', monospace;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state__icon-wrap {
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(34, 197, 94, 0.1);
  color: var(--primary-green-color);
  border-radius: 20px;
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

.empty-state__heading {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--header-text-color);
  margin: 0 0 0.5rem;
}

.empty-state__text {
  font-size: 0.95rem;
  color: var(--normal-text-color);
  max-width: 300px;
  line-height: 1.5;
  margin: 0;
}

/* Skeleton */
.skeleton-row-fidelity {
  display: grid;
  grid-template-columns: 200px 1fr 200px 100px;
  gap: 1.5rem;
  padding: 1rem 1.25rem;
  align-items: center;
  border-bottom: 1px solid var(--border-color);

  .col-pair {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .quick-add-form {
    flex-direction: column;
    padding: 12px;

    .form-inputs {
      width: 100%;
      flex-direction: column;
    }

    .input-group, .input-group--number {
      input { width: 100%; }
    }

    .add-btn {
      width: 100%;
    }
  }

  .table-header {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 1.25rem;
    background: var(--background-color-soft);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    margin-bottom: 12px;

    &:last-child { margin-bottom: 0; }
  }

  .col {
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    &:last-child { border-bottom: none; }

    &::before {
      content: attr(data-label);
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--normal-text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.6;
    }
  }

  .col-pair {
    justify-content: flex-end;
    &::before { margin-right: auto; }
  }
  
  .col-rate {
    justify-content: flex-end;
    &::before { margin-right: auto; }
  }

  .col-updated {
    justify-content: flex-end;
    &::before { margin-right: auto; }
  }
}
</style>

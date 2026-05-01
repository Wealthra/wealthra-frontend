<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3>{{ isEdit ? t.editPlan : t.createPlan }}</h3>
        <button class="close-btn" @click="$emit('close')">
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <div class="modal-body">
        <div class="form-grid">
          <div class="form-group full-width">
            <label>{{ t.name }}</label>
            <input v-model="form.name" type="text" placeholder="e.g. Pro Plan" required />
          </div>
          <div class="form-group full-width">
            <label>{{ t.description }}</label>
            <textarea v-model="form.description" rows="2" placeholder="Describe the plan benefits..."></textarea>
          </div>
          
          <!-- Price and Currency -->
          <div class="form-group">
            <label>{{ t.monthlyPrice }}</label>
            <input v-model.number="form.monthlyPrice" type="number" step="0.01" required />
          </div>
          <div class="form-group">
            <label>{{ t.priceCurrency }}</label>
            <UISelect 
              v-model="form.priceCurrency" 
              :options="[
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
                { label: 'TRY (₺)', value: 'TRY' },
                { label: 'GBP (£)', value: 'GBP' }
              ]"
            />
          </div>

          <div class="form-group">
            <label>{{ t.ocrLimit }}</label>
            <input v-model.number="form.monthlyOcrLimit" type="number" required />
          </div>
          <div class="form-group">
            <label>{{ t.sttLimit }}</label>
            <input v-model.number="form.monthlySttLimit" type="number" required />
          </div>
        </div>

        <div class="form-group checkbox-group">
          <input type="checkbox" v-model="form.isActive" id="isActive" />
          <label for="isActive">{{ t.isActive }}</label>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">{{ t.cancel }}</button>
        <button class="save-btn" @click="handleSave" :disabled="isSubmitting">
          <font-awesome-icon v-if="isSubmitting" icon="spinner" spin />
          {{ isSubmitting ? t.saving : t.save }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import type { PropType } from 'vue'
import { adminPlansService } from '@/services/api/adminPlans/adminPlans.service'
import type { AdminPlan } from '@/services/api/adminPlans/adminPlans.models'
import UISelect from '@/components/UISelect.vue'

export default defineComponent({
  name: 'UIPlanModal',
  components: { UISelect },
  props: {
    plan: {
      type: Object as PropType<AdminPlan | null>,
      default: null
    },
    selectedLanguage: {
      type: String,
      default: 'English'
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const isEdit = computed(() => !!props.plan)
    const isSubmitting = ref(false)

    const form = ref({
      name: '',
      description: '',
      monthlyOcrLimit: 0,
      monthlySttLimit: 0,
      monthlyPrice: 0,
      priceCurrency: 'USD',
      isActive: true
    })

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        createPlan: isTr ? 'Yeni Plan Oluştur' : 'Create New Plan',
        editPlan: isTr ? 'Planı Düzenle' : 'Edit Plan',
        name: isTr ? 'İsim' : 'Name',
        description: isTr ? 'Açıklama' : 'Description',
        monthlyPrice: isTr ? 'Aylık Fiyat' : 'Monthly Price',
        priceCurrency: isTr ? 'Para Birimi' : 'Currency',
        ocrLimit: isTr ? 'Aylık OCR Limiti' : 'Monthly OCR Limit',
        sttLimit: isTr ? 'Aylık STT Limiti' : 'Monthly STT Limit',
        isActive: isTr ? 'Aktif Plan' : 'Is Active Plan',
        cancel: isTr ? 'İptal' : 'Cancel',
        save: isTr ? 'Kaydet' : 'Save',
        saving: isTr ? 'Kaydediliyor...' : 'Saving...'
      }
    })

    onMounted(() => {
      if (props.plan) {
        form.value = {
          name: props.plan.name,
          description: props.plan.description,
          monthlyOcrLimit: props.plan.monthlyOcrLimit,
          monthlySttLimit: props.plan.monthlySttLimit,
          monthlyPrice: props.plan.monthlyPrice,
          priceCurrency: props.plan.priceCurrency,
          isActive: props.plan.isActive
        }
      }
    })

    const handleSave = async () => {
      isSubmitting.value = true
      try {
        if (isEdit.value && props.plan) {
          await adminPlansService.updatePlan(props.plan.id, { ...form.value, id: props.plan.id })
        } else {
          await adminPlansService.createPlan(form.value)
        }
        emit('save')
      } catch (error) {
        console.error('Error saving plan:', error)
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      isEdit,
      isSubmitting,
      form,
      t,
      handleSave
    }
  }
})
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 90%;
  max-width: 550px;
  background: var(--background-color);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);

  h3 { margin: 0; font-size: 20px; font-weight: 800; color: var(--header-text-color); }
  .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--normal-text-color); }
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.full-width { grid-column: span 2; }
  
  label { font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--normal-text-color); opacity: 0.7; }
  
  input[type="text"], input[type="number"], textarea {
    padding: 12px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--background-color-soft);
    color: var(--header-text-color);
    font-size: 15px;
    transition: border-color 0.2s;
    
    &:focus { border-color: var(--primary-green-color); outline: none; }
  }

  &.checkbox-group {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    input { width: 20px; height: 20px; cursor: pointer; accent-color: var(--primary-green-color); }
    label { text-transform: none; font-size: 14px; opacity: 1; cursor: pointer; }
  }
}

.modal-footer {
  padding: 20px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: var(--background-color-soft);
  border-top: 1px solid var(--border-color);

  button {
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn { background: transparent; border: 1px solid var(--border-color); color: var(--header-text-color); }
  .save-btn {
    background: var(--primary-green-color);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
}
</style>

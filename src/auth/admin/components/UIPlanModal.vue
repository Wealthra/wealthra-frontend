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
          <div class="form-group">
            <label>{{ t.name }}</label>
            <input v-model="form.name" type="text" />
          </div>
          <div class="form-group">
            <label>{{ t.price }}</label>
            <div class="input-row">
              <input v-model.number="form.price" type="number" />
              <select v-model="form.currency">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="TRY">TRY</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>{{ t.chatLimit }}</label>
            <input v-model.number="form.aiChatLimit" type="number" />
          </div>
          <div class="form-group">
            <label>{{ t.scanLimit }}</label>
            <input v-model.number="form.receiptScanLimit" type="number" />
          </div>
        </div>

        <div class="form-group full-width">
          <label>{{ t.features }} ({{ t.commaSeparated }})</label>
          <textarea v-model="featuresText" rows="3"></textarea>
        </div>

        <div class="form-group checkbox-group">
          <input type="checkbox" v-model="form.isPopular" id="isPopular" />
          <label for="isPopular">{{ t.isPopular }}</label>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">{{ t.cancel }}</button>
        <button class="save-btn" @click="handleSave" :disabled="isSubmitting">
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

export default defineComponent({
  name: 'UIPlanModal',
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
    const featuresText = ref('')

    const form = ref({
      name: '',
      price: 0,
      currency: 'USD',
      aiChatLimit: 10,
      receiptScanLimit: 5,
      features: [] as string[],
      isPopular: false
    })

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        createPlan: isTr ? 'Yeni Plan Oluştur' : 'Create New Plan',
        editPlan: isTr ? 'Planı Düzenle' : 'Edit Plan',
        name: isTr ? 'İsim' : 'Name',
        price: isTr ? 'Fiyat' : 'Price',
        chatLimit: isTr ? 'AI Sohbet Limiti' : 'AI Chat Limit',
        scanLimit: isTr ? 'Fiş Tarama Limiti' : 'Receipt Scan Limit',
        features: isTr ? 'Özellikler' : 'Features',
        commaSeparated: isTr ? 'virgülle ayırın' : 'comma separated',
        isPopular: isTr ? 'Popüler Plan' : 'Is Popular Plan',
        cancel: isTr ? 'İptal' : 'Cancel',
        save: isTr ? 'Kaydet' : 'Save',
        saving: isTr ? 'Kaydediliyor...' : 'Saving...'
      }
    })

    onMounted(() => {
      if (props.plan) {
        form.value = { ...props.plan }
        featuresText.value = props.plan.features.join(', ')
      }
    })

    const handleSave = async () => {
      isSubmitting.value = true
      form.value.features = featuresText.value.split(',').map(s => s.trim()).filter(s => s)
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
      featuresText,
      t,
      handleSave
    }
  }
})
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 100%;
  max-width: 600px;
  background: var(--background-color);
  padding: 0;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);

  h3 { margin: 0; font-size: 20px; font-weight: 700; }
  .close-btn { 
    background: transparent; border: none; font-size: 20px; 
    color: var(--normal-text-color); cursor: pointer; 
  }
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
  &.checkbox-group { flex-direction: row; align-items: center; gap: 12px; }

  label { font-size: 13px; font-weight: 600; color: var(--normal-text-color); }
  
  input[type="text"], input[type="number"], select, textarea {
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--background-color-soft);
    color: var(--header-text-color);
    outline: none;
    font-size: 14px;

    &:focus { border-color: var(--primary-green-color); background: var(--background-color); }
  }

  .input-row {
    display: flex;
    gap: 8px;
    input { flex: 1; }
    select { width: 100px; }
  }
}

.modal-footer {
  padding: 20px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border-color);
  background: var(--background-color-soft);

  button {
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn { background: transparent; border: 1px solid var(--border-color); color: var(--header-text-color); }
  .save-btn { background: var(--primary-green-color); border: none; color: white; }
}
</style>

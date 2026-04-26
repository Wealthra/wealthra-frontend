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
            <input v-model="form.name" type="text" />
          </div>
          <div class="form-group full-width">
            <label>{{ t.description }}</label>
            <textarea v-model="form.description" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>{{ t.ocrLimit }}</label>
            <input v-model.number="form.monthlyOcrLimit" type="number" />
          </div>
          <div class="form-group">
            <label>{{ t.sttLimit }}</label>
            <input v-model.number="form.monthlySttLimit" type="number" />
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

    const form = ref({
      name: '',
      description: '',
      monthlyOcrLimit: 0,
      monthlySttLimit: 0,
      isActive: true
    })

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        createPlan: isTr ? 'Yeni Plan Oluştur' : 'Create New Plan',
        editPlan: isTr ? 'Planı Düzenle' : 'Edit Plan',
        name: isTr ? 'İsim' : 'Name',
        description: isTr ? 'Açıklama' : 'Description',
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
  max-width: 500px;
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

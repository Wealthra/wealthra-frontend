<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3>{{ t.exportData }}</h3>
        <button class="close-btn" @click="$emit('close')">
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>{{ t.startDate }}</label>
            <DatePicker 
              v-model:value="startDate" 
              type="date" 
              format="YYYY-MM-DD"
              value-type="format"
              :placeholder="t.selectDate"
            />
          </div>
          <div class="form-group">
            <label>{{ t.endDate }}</label>
            <DatePicker 
              v-model:value="endDate" 
              type="date" 
              format="YYYY-MM-DD"
              value-type="format"
              :placeholder="t.selectDate"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>{{ t.format }}</label>
            <UISelect v-model="format" :options="['PDF', 'Excel']" />
          </div>
          <div class="form-group">
            <label>{{ t.currency }}</label>
            <UISelect v-model="currency" :options="['USD', 'EUR', 'TRY']" />
          </div>
        </div>

        <div class="form-group">
          <label>{{ t.language }}</label>
          <UISelect v-model="language" :options="['English', 'Turkish']" />
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">{{ t.cancel }}</button>
        <button class="download-btn" @click="handleDownload" :disabled="isDownloading">
          <font-awesome-icon :icon="isDownloading ? 'spinner' : 'download'" :spin="isDownloading" />
          <span>{{ isDownloading ? t.downloading : t.download }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import DatePicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'
import { exportService } from '@/services/api/export/export.service'
import UISelect from '@/components/UISelect.vue'

export default defineComponent({
  name: 'UIExportModal',
  components: { DatePicker, UISelect },
  props: {
    selectedLanguage: {
      type: String,
      default: 'English'
    }
  },
  emits: ['close'],
  setup(props) {
    const startDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
    const endDate = ref(new Date().toISOString().split('T')[0])
    const format = ref<'PDF' | 'Excel'>('PDF')
    const currency = ref<'USD' | 'EUR' | 'TRY'>('USD')
    const language = ref<'English' | 'Turkish'>(props.selectedLanguage === 'Turkish' ? 'Turkish' : 'English')
    const isDownloading = ref(false)

    const t = computed(() => {
      const isTr = props.selectedLanguage === 'Turkish'
      return {
        exportData: isTr ? 'Verileri Dışa Aktar' : 'Export Data',
        startDate: isTr ? 'Başlangıç Tarihi' : 'Start Date',
        endDate: isTr ? 'Bitiş Tarihi' : 'End Date',
        selectDate: isTr ? 'Tarih seçin' : 'Select date',
        format: isTr ? 'Format' : 'Format',
        currency: isTr ? 'Para Birimi' : 'Currency',
        language: isTr ? 'Dil' : 'Language',
        cancel: isTr ? 'İptal' : 'Cancel',
        download: isTr ? 'İndir' : 'Download',
        downloading: isTr ? 'İndiriliyor...' : 'Downloading...'
      }
    })

    const handleDownload = async () => {
      isDownloading.value = true
      try {
        const blob = await exportService.exportData({
          startDate: startDate.value,
          endDate: endDate.value,
          format: format.value,
          currency: currency.value,
          language: language.value
        })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const extension = format.value === 'PDF' ? 'pdf' : 'xlsx'
        link.setAttribute('download', `Wealthra_Export_${startDate.value}_to_${endDate.value}.${extension}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Export failed:', error)
      } finally {
        isDownloading.value = false
      }
    }

    return {
      startDate,
      endDate,
      format,
      currency,
      language,
      isDownloading,
      t,
      handleDownload
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
  z-index: 200;
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

  h3 { margin: 0; font-size: 18px; font-weight: 700; color: var(--header-text-color); }
  .close-btn { 
    background: transparent; 
    border: none; 
    font-size: 12px; 
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: var(--normal-text-color); 
    cursor: pointer; 
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background-color: var(--background-color-soft);
      color: var(--header-text-color);
      transform: scale(0.92);
    }

    &:active {
      transform: scale(0.85);
    }
  }
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;

  label { font-size: 13px; font-weight: 600; color: var(--normal-text-color); }
  
  select {
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

/* DatePicker Overrides */
:deep(.mx-datepicker) {
  width: 100%;
}

:deep(.mx-input) {
  height: 38px;
  padding: 0 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--background-color);
  color: var(--header-text-color);
  box-shadow: none;
  font-size: 0.9rem;
  font-family: var(--main-font);

  &:focus { 
    border-color: var(--primary-green-color); 
    background: var(--background-color); 
    box-shadow: 0 0 0 2px rgba(92, 184, 92, 0.1);
  }

  &::placeholder {
    color: var(--normal-text-color);
    opacity: 0.5;
  }
}

/* Ensure the calendar icon color matches */
:deep(.mx-icon-calendar), :deep(.mx-icon-clear) {
  color: var(--normal-text-color);
  font-size: 14px;
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
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cancel-btn { background: transparent; border: 1px solid var(--border-color); color: var(--header-text-color); }
  .download-btn { background: var(--primary-green-color); border: none; color: white; }
}
</style>

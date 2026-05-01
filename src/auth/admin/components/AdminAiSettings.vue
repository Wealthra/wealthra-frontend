<template>
  <div class="admin-ai-settings glass-card">
    <div v-if="isLoading" class="loading">Loading Settings...</div>
    <form v-else @submit.prevent="handleSave" class="settings-form">
      <div class="form-group row">
        <label>Enable AI Features</label>
        <div class="toggle">
          <input type="checkbox" v-model="settings.isEnabled" id="ai-toggle" />
          <label for="ai-toggle"></label>
        </div>
      </div>
      
      <div class="form-group">
        <label>Model Name</label>
        <input v-model="settings.modelName" type="text" placeholder="e.g. gpt-4, claude-3-opus" required :disabled="!settings.isEnabled" />
      </div>

      <div class="form-group row">
        <div class="col">
          <label>Max Tokens</label>
          <input v-model.number="settings.maxTokens" type="number" required :disabled="!settings.isEnabled" />
        </div>
        <div class="col">
          <label>Temperature (0.0 - 2.0)</label>
          <input v-model.number="settings.temperature" type="number" step="0.1" min="0" max="2" required :disabled="!settings.isEnabled" />
        </div>
      </div>

      <div class="form-group">
        <label>System Prompt</label>
        <textarea v-model="settings.systemPrompt" rows="6" required :disabled="!settings.isEnabled"></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="save-btn" :disabled="isSaving">
          {{ isSaving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { AdminAiSettings } from '@/services/api/admin/admin.models'

export default defineComponent({
  name: 'AdminAiSettings',
  setup() {
    const settings = ref<AdminAiSettings>({
      modelName: '',
      maxTokens: 1000,
      temperature: 0.7,
      systemPrompt: '',
      isEnabled: true
    })
    const isLoading = ref(true)
    const isSaving = ref(false)

    const fetchSettings = async () => {
      try {
        settings.value = await adminService.getAiSettings()
      } catch (err) {
        console.error(err)
      } finally {
        isLoading.value = false
      }
    }

    const handleSave = async () => {
      isSaving.value = true
      try {
        await adminService.updateAiSettings(settings.value)
        alert('AI settings updated successfully.')
      } catch (err) {
        alert('Failed to update AI settings.')
      } finally {
        isSaving.value = false
      }
    }

    onMounted(fetchSettings)

    return {
      settings,
      isLoading,
      isSaving,
      handleSave
    }
  }
})
</script>

<style scoped lang="scss">
.admin-ai-settings {
  padding: 32px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    
    .col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      &:not(:last-child) { margin-right: 16px; }
    }
  }

  label {
    font-weight: 600;
    font-size: 14px;
    color: var(--header-text-color);
  }

  input[type="text"], input[type="number"], textarea {
    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--background-color-soft);
    color: var(--header-text-color);
    font-size: 14px;
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  textarea {
    font-family: monospace;
    resize: vertical;
  }
}

.toggle {
  position: relative;
  width: 48px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
    
    &:checked + label {
      background-color: var(--primary-green-color);
    }
    
    &:checked + label:before {
      transform: translateX(24px);
    }
  }
  
  label {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  
  .save-btn {
    background: var(--primary-green-color);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--normal-text-color);
}
</style>

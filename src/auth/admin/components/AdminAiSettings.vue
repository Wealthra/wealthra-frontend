<template>
  <div class="admin-ai-settings glass-card">
    <div v-if="isLoading" class="loading-state">
      <UISkeletonLoader height="200px" />
    </div>
    <form v-else @submit.prevent="handleSave" class="settings-form">
      <div class="section-title">
        <font-awesome-icon icon="robot" />
        <h3>AI Model Configuration</h3>
      </div>
      
      <div class="form-grid">
        <div class="form-group">
          <label for="enrichment-model">Enrichment Model</label>
          <div class="input-wrapper">
            <font-awesome-icon icon="microchip" class="input-icon" />
            <input 
              id="enrichment-model"
              v-model="settings.enrichmentModel" 
              type="text" 
              placeholder="e.g. gpt-4o" 
              required 
            />
          </div>
          <p class="help-text">Used for data extraction and classification tasks.</p>
        </div>

        <div class="form-group">
          <label for="chat-model">Default Chat Model</label>
          <div class="input-wrapper">
            <font-awesome-icon icon="comments" class="input-icon" />
            <input 
              id="chat-model"
              v-model="settings.defaultChatModel" 
              type="text" 
              placeholder="e.g. gpt-4-turbo" 
              required 
            />
          </div>
          <p class="help-text">Primary model for user conversations and Copilot.</p>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="save-btn" :disabled="isSaving">
          <font-awesome-icon v-if="isSaving" icon="spinner" spin />
          <font-awesome-icon v-else icon="check" />
          {{ isSaving ? 'Saving...' : 'Update AI Settings' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { AdminAiSettings } from '@/services/api/admin/admin.models'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

export default defineComponent({
  name: 'AdminAiSettings',
  components: { UISkeletonLoader },
  setup() {
    const settings = ref<AdminAiSettings>({
      enrichmentModel: '',
      defaultChatModel: ''
    })
    const isLoading = ref(true)
    const isSaving = ref(false)

    const fetchSettings = async () => {
      isLoading.value = true
      try {
        settings.value = await adminService.getAiSettings()
      } catch (err) {
        console.error('Failed to fetch AI settings:', err)
      } finally {
        isLoading.value = false
      }
    }

    const handleSave = async () => {
      isSaving.value = true
      try {
        await adminService.updateAiSettings(settings.value)
        // In a real app, we might use a toast notification here
      } catch (err) {
        console.error('Failed to save AI settings:', err)
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

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  color: var(--primary-green-color);

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
  }
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 500;
    font-size: 14px;
    color: var(--header-text-color);
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    .input-icon {
      position: absolute;
      left: 14px;
      color: var(--normal-text-color);
      opacity: 0.6;
    }

    input {
      width: 100%;
      padding: 12px 12px 12px 42px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--background-color-soft);
      color: var(--header-text-color);
      font-size: 15px;
      transition: all 0.2s;

      &:focus {
        border-color: var(--primary-green-color);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        outline: none;
      }
    }
  }

  .help-text {
    margin: 0;
    font-size: 12px;
    color: var(--normal-text-color);
    opacity: 0.7;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);

  .save-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--primary-green-color);
    color: white;
    border: none;
    padding: 12px 28px;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

.loading-state {
  padding: 20px 0;
}
</style>

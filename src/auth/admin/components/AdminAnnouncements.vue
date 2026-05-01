<template>
  <div class="admin-announcements">
    <div class="actions">
      <button class="add-btn" @click="showForm = !showForm">
        <font-awesome-icon :icon="showForm ? 'times' : 'plus'" />
        {{ showForm ? 'Cancel' : 'New Announcement' }}
      </button>
    </div>

    <!-- Create Form -->
    <div v-if="showForm" class="create-form glass-card">
      <h3>Create Announcement</h3>
      <form @submit.prevent="handleCreate">
        <div class="form-group">
          <label>Title</label>
          <input v-model="form.title" type="text" required />
        </div>
        <div class="form-group">
          <label>Type</label>
          <UISelect
            v-model="form.type"
            :options="[
              { label: 'Info', value: 'info' },
              { label: 'Warning', value: 'warning' },
              { label: 'Danger', value: 'danger' }
            ]"
          />
        </div>
        <div class="form-group">
          <label>Message</label>
          <textarea v-model="form.message" rows="3" required></textarea>
        </div>
        <div class="form-group">
          <label>Expires At (Optional)</label>
          <input v-model="form.expiresAt" type="datetime-local" />
        </div>
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </form>
    </div>

    <!-- List -->
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="announcements-list">
      <div v-for="ann in announcements" :key="ann.id" class="announcement-item glass-card">
        <div class="ann-header">
          <span :class="['badge', ann.type]">{{ ann.type }}</span>
          <h4 class="title">{{ ann.title }}</h4>
          <span class="date">{{ new Date(ann.createdAt).toLocaleDateString() }}</span>
        </div>
        <p class="message">{{ ann.message }}</p>
        <div class="ann-footer">
          <span v-if="ann.expiresAt" class="expires">Expires: {{ new Date(ann.expiresAt).toLocaleString() }}</span>
          <button class="delete-btn" @click="handleDelete(ann.id)">Delete</button>
        </div>
      </div>
      <div v-if="announcements.length === 0" class="no-data">
        No announcements found.
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { AdminAnnouncement, CreateAnnouncementRequest } from '@/services/api/admin/admin.models'
import UISelect from '@/components/UISelect.vue'

export default defineComponent({
  name: 'AdminAnnouncements',
  components: {
    UISelect
  },
  setup() {
    const announcements = ref<AdminAnnouncement[]>([])
    const isLoading = ref(true)
    const error = ref<string | null>(null)
    const showForm = ref(false)
    const isSubmitting = ref(false)

    const form = ref<CreateAnnouncementRequest>({
      title: '',
      message: '',
      type: 'info',
      expiresAt: ''
    })

    const fetchAnnouncements = async () => {
      isLoading.value = true
      try {
        announcements.value = await adminService.getAnnouncements()
      } catch (err) {
        error.value = 'Failed to load announcements.'
      } finally {
        isLoading.value = false
      }
    }

    const handleCreate = async () => {
      isSubmitting.value = true
      try {
        const payload = { ...form.value }
        if (!payload.expiresAt) delete payload.expiresAt
        await adminService.createAnnouncement(payload)
        showForm.value = false
        form.value = { title: '', message: '', type: 'info', expiresAt: '' }
        await fetchAnnouncements()
      } catch (err) {
        alert('Failed to create announcement.')
      } finally {
        isSubmitting.value = false
      }
    }

    const handleDelete = async (id: number) => {
      if (!confirm('Are you sure you want to delete this announcement?')) return
      try {
        await adminService.deleteAnnouncement(id)
        await fetchAnnouncements()
      } catch (err) {
        alert('Failed to delete announcement.')
      }
    }

    onMounted(fetchAnnouncements)

    return {
      announcements,
      isLoading,
      error,
      showForm,
      isSubmitting,
      form,
      handleCreate,
      handleDelete
    }
  }
})
</script>

<style scoped lang="scss">
.admin-announcements {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.add-btn {
  background: var(--primary-green-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    opacity: 0.9;
  }
}

.create-form {
  padding: 20px;
  h3 { margin-top: 0; margin-bottom: 16px; }
  
  .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
    gap: 8px;

    label { font-weight: 600; font-size: var(--font-size-xs); }
    input, select, textarea {
      padding: 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background-color-soft);
      color: var(--header-text-color);
      font-size: var(--font-size-sm);
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    .submit-btn {
      background: var(--primary-green-color);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
  }
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-item {
  padding: 20px;
  
  .ann-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    
    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      color: white;
      
      &.info { background: #3b82f6; }
      &.warning { background: #f59e0b; }
      &.danger { background: #ef4444; }
    }
    
    .title {
      margin: 0;
      flex-grow: 1;
      font-size: 16px;
    }
    
    .date {
      font-size: 12px;
      color: var(--normal-text-color);
    }
  }
  
  .message {
    margin: 0 0 16px 0;
    color: var(--normal-text-color);
    line-height: 1.5;
  }
  
  .ann-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    
    .expires { color: var(--normal-text-color); }
    
    .delete-btn {
      background: transparent;
      border: 1px solid var(--primary-red-color);
      color: var(--primary-red-color);
      padding: 4px 12px;
      border-radius: 6px;
      cursor: pointer;
      
      &:hover {
        background: var(--primary-red-color);
        color: white;
      }
    }
  }
}

.no-data, .loading, .error {
  text-align: center;
  padding: 40px;
  color: var(--normal-text-color);
}
</style>

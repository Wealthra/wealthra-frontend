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
        <div class="form-row">
          <div class="form-group">
            <label>Title (English)</label>
            <input v-model="form.titleEn" type="text" required />
          </div>
          <div class="form-group">
            <label>Title (Turkish)</label>
            <input v-model="form.titleTr" type="text" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Body (English)</label>
            <textarea v-model="form.bodyEn" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label>Body (Turkish)</label>
            <textarea v-model="form.bodyTr" rows="3" required></textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Severity</label>
            <UISelect
              v-model="form.severity"
              :options="[
                { label: 'Low', value: 0 },
                { label: 'Medium', value: 1 },
                { label: 'High', value: 2 },
                { label: 'Critical', value: 3 }
              ]"
            />
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.isPublished" />
              <span>Is Published</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.targetAllSubscribers" />
              <span>Target All Subscribers</span>
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Starts At</label>
            <input v-model="form.startsAt" type="datetime-local" required />
          </div>
          <div class="form-group">
            <label>Ends At</label>
            <input v-model="form.endsAt" type="datetime-local" required />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            <font-awesome-icon v-if="isSubmitting" icon="spinner" spin />
            {{ isSubmitting ? 'Creating...' : 'Create Announcement' }}
          </button>
        </div>
      </form>
    </div>

    <!-- List -->
    <div v-if="isLoading" class="loading">
      <UISkeletonLoader v-for="i in 3" :key="i" height="120px" style="margin-bottom: 16px" />
    </div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="announcements-list">
      <div v-for="ann in announcements" :key="ann.id" class="announcement-item glass-card">
        <div class="ann-header">
          <div class="header-left">
            <span :class="['severity-badge', getSeverityClass(ann.severity)]">
              {{ getSeverityLabel(ann.severity) }}
            </span>
            <h4 class="title">{{ ann.titleEn }} / {{ ann.titleTr }}</h4>
          </div>
          <div class="header-right">
            <span v-if="!ann.isPublished" class="draft-badge">Draft</span>
            <span class="date">{{ new Date(ann.startsAt).toLocaleDateString() }}</span>
          </div>
        </div>
        <div class="message-container">
          <p class="message"><strong>EN:</strong> {{ ann.bodyEn }}</p>
          <p class="message"><strong>TR:</strong> {{ ann.bodyTr }}</p>
        </div>
        <div class="ann-footer">
          <div class="footer-info">
            <span>Range: {{ formatDateTime(ann.startsAt) }} - {{ formatDateTime(ann.endsAt) }}</span>
            <span v-if="ann.targetAllSubscribers" class="target-badge">All Users</span>
          </div>
          <button class="delete-btn" @click="handleDelete(ann.id)">
            <font-awesome-icon icon="trash" />
            Delete
          </button>
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
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'

export default defineComponent({
  name: 'AdminAnnouncements',
  components: {
    UISelect,
    UISkeletonLoader
  },
  setup() {
    const announcements = ref<AdminAnnouncement[]>([])
    const isLoading = ref(true)
    const error = ref<string | null>(null)
    const showForm = ref(false)
    const isSubmitting = ref(false)

    const form = ref<CreateAnnouncementRequest>({
      titleEn: '',
      titleTr: '',
      bodyEn: '',
      bodyTr: '',
      severity: 0,
      startsAt: new Date().toISOString().slice(0, 16),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      targetAllSubscribers: true,
      targetPlanIdsJson: null,
      targetTiersJson: null,
      isPublished: true
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
        await adminService.createAnnouncement(form.value)
        showForm.value = false
        // Reset form
        form.value = {
          titleEn: '',
          titleTr: '',
          bodyEn: '',
          bodyTr: '',
          severity: 0,
          startsAt: new Date().toISOString().slice(0, 16),
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          targetAllSubscribers: true,
          targetPlanIdsJson: null,
          targetTiersJson: null,
          isPublished: true
        }
        await fetchAnnouncements()
      } catch (err) {
        console.error(err)
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
        console.error(err)
      }
    }

    const getSeverityLabel = (severity: number) => {
      switch (severity) {
        case 0: return 'Low'
        case 1: return 'Medium'
        case 2: return 'High'
        case 3: return 'Critical'
        default: return 'Info'
      }
    }

    const getSeverityClass = (severity: number) => {
      switch (severity) {
        case 0: return 'low'
        case 1: return 'medium'
        case 2: return 'high'
        case 3: return 'critical'
        default: return 'low'
      }
    }

    const formatDateTime = (dateStr: string) => {
      return new Date(dateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
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
      handleDelete,
      getSeverityLabel,
      getSeverityClass,
      formatDateTime
    }
  }
})
</script>

<style scoped lang="scss">
.admin-announcements {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.add-btn {
  background: var(--primary-green-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  }
}

.create-form {
  padding: 24px;
  border: 1px solid var(--primary-green-color);
  
  h3 { margin-top: 0; margin-bottom: 24px; font-size: 18px; color: var(--header-text-color); }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label { font-weight: 500; font-size: 13px; color: var(--normal-text-color); }
    
    input[type="text"], input[type="datetime-local"], textarea {
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

    &.checkbox-group {
      flex-direction: row;
      align-items: center;
      gap: 24px;
      padding-top: 24px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;

      input { width: 18px; height: 18px; cursor: pointer; }
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
    
    .submit-btn {
      background: var(--primary-green-color);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;

      &:disabled { opacity: 0.7; cursor: not-allowed; }
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
  transition: transform 0.2s;

  &:hover {
    transform: translateX(4px);
  }
  
  .ann-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .severity-badge {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: white;
      
      &.low { background: #10b981; }
      &.medium { background: #3b82f6; }
      &.high { background: #f59e0b; }
      &.critical { background: #ef4444; }
    }
    
    .title {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--header-text-color);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .draft-badge {
      font-size: 11px;
      background: var(--background-color-soft);
      border: 1px solid var(--border-color);
      padding: 2px 8px;
      border-radius: 4px;
      color: var(--normal-text-color);
    }

    .date {
      font-size: 12px;
      color: var(--normal-text-color);
      opacity: 0.8;
    }
  }
  
  .message-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
    padding: 12px;
    background: var(--background-color-soft);
    border-radius: 8px;
  }

  .message {
    margin: 0;
    color: var(--normal-text-color);
    font-size: 14px;
    line-height: 1.5;

    strong { color: var(--header-text-color); font-size: 12px; }
  }
  
  .ann-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border-color);
    padding-top: 16px;
    
    .footer-info {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 12px;
      color: var(--normal-text-color);

      .target-badge {
        background: rgba(16, 185, 129, 0.1);
        color: var(--primary-green-color);
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 500;
      }
    }
    
    .delete-btn {
      background: transparent;
      border: 1px solid #ef4444;
      color: #ef4444;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      
      &:hover {
        background: #ef4444;
        color: white;
      }
    }
  }
}

.no-data, .error {
  text-align: center;
  padding: 60px;
  color: var(--normal-text-color);
  background: var(--background-color-soft);
  border-radius: 16px;
  border: 1px dashed var(--border-color);
}
</style>

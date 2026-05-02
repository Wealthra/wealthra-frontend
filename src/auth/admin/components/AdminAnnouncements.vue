<template>
  <div class="admin-announcements announcements-container">
    <div class="header">
      <h1 class="ann-title">
        <font-awesome-icon icon="bullhorn" class="title-icon" />
        {{ selectedLanguage === 'Turkish' ? 'Sistem Duyuruları' : 'System Announcements' }}
      </h1>
      
      <button class="add-btn-premium" @click="showForm = !showForm">
        <font-awesome-icon :icon="showForm ? 'xmark' : 'plus'" />
        {{ showForm ? (selectedLanguage === 'Turkish' ? 'Vazgeç' : 'Cancel') : (selectedLanguage === 'Turkish' ? 'Yeni Duyuru' : 'New Announcement') }}
      </button>
    </div>

    <!-- Create Announcement Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h3>{{ selectedLanguage === 'Turkish' ? 'Yeni Duyuru Oluştur' : 'Create New Announcement' }}</h3>
            <button class="close-btn" @click="showForm = false">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleCreate">
              <div class="form-grid">
                <div class="form-group">
                  <label>{{ selectedLanguage === 'Turkish' ? 'Başlık (İngilizce)' : 'Title (English)' }}</label>
                  <input v-model="form.titleEn" type="text" required />
                </div>
                <div class="form-group">
                  <label>{{ selectedLanguage === 'Turkish' ? 'Başlık (Türkçe)' : 'Title (Turkish)' }}</label>
                  <input v-model="form.titleTr" type="text" required />
                </div>
                <div class="form-group full-width">
                  <label>{{ selectedLanguage === 'Turkish' ? 'Mesaj (İngilizce)' : 'Body (English)' }}</label>
                  <textarea v-model="form.bodyEn" rows="3" required></textarea>
                </div>
                <div class="form-group full-width">
                  <label>{{ selectedLanguage === 'Turkish' ? 'Mesaj (Türkçe)' : 'Body (Turkish)' }}</label>
                  <textarea v-model="form.bodyTr" rows="3" required></textarea>
                </div>
                <div class="form-group">
                  <label>{{ selectedLanguage === 'Turkish' ? 'Önem Derecesi' : 'Severity' }}</label>
                  <UISelect
                    v-model="form.severity"
                    :options="severityOptions"
                  />
                </div>
                <div class="form-group checkbox-row">
                  <label class="custom-checkbox">
                    <input type="checkbox" v-model="form.isPublished" />
                    <span class="checkmark"></span>
                    <span class="label-text">{{ selectedLanguage === 'Turkish' ? 'Yayınla' : 'Is Published' }}</span>
                  </label>
                  <label class="custom-checkbox">
                    <input type="checkbox" v-model="form.targetAllSubscribers" />
                    <span class="checkmark"></span>
                    <span class="label-text">{{ selectedLanguage === 'Turkish' ? 'Tüm Aboneler' : 'Target All Subscribers' }}</span>
                  </label>
                </div>
                <div class="form-group">
                  <label>{{ selectedLanguage === 'Turkish' ? 'Başlangıç' : 'Starts At' }}</label>
                  <div class="datepicker-wrapper">
                    <Datepicker
                      v-model:value="form.startsAt"
                      type="datetime"
                      value-type="format"
                      format="YYYY-MM-DD HH:mm"
                      :placeholder="selectedLanguage === 'Turkish' ? 'Tarih seçin' : 'Select date'"
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label>{{ selectedLanguage === 'Turkish' ? 'Bitiş' : 'Ends At' }}</label>
                  <div class="datepicker-wrapper">
                    <Datepicker
                      v-model:value="form.endsAt"
                      type="datetime"
                      value-type="format"
                      format="YYYY-MM-DD HH:mm"
                      :placeholder="selectedLanguage === 'Turkish' ? 'Tarih seçin' : 'Select date'"
                    />
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="submit" class="submit-btn" :disabled="isSubmitting">
                  <font-awesome-icon v-if="isSubmitting" icon="spinner" spin />
                  <font-awesome-icon v-else icon="paper-plane" />
                  {{ isSubmitting ? (selectedLanguage === 'Turkish' ? 'Oluşturuluyor...' : 'Creating...') : (selectedLanguage === 'Turkish' ? 'Duyuruyu Yayınla' : 'Post Announcement') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Announcements Table -->
    <div class="table-wrap" :class="{ 'table-wrap--empty': !isLoading && announcements.length === 0 }">
      <div v-if="isLoading || announcements.length > 0" class="table" role="table">
        <div class="table-header" role="row">
          <div class="col col-severity" role="columnheader">{{ selectedLanguage === 'Turkish' ? 'Önem' : 'Level' }}</div>
          <div class="col col-title" role="columnheader">{{ selectedLanguage === 'Turkish' ? 'Duyuru Başlığı' : 'Announcement' }}</div>
          <div class="col col-schedule" role="columnheader">{{ selectedLanguage === 'Turkish' ? 'Zamanlama' : 'Schedule' }}</div>
          <div class="col col-actions" role="columnheader">{{ selectedLanguage === 'Turkish' ? 'İşlemler' : 'Actions' }}</div>
        </div>

        <template v-if="isLoading">
          <div v-for="i in 5" :key="i" class="table-row skeleton-row-fidelity" role="row">
            <div class="col col-severity">
              <UISkeletonLoader width="60px" height="18px" border-radius="6px" />
            </div>
            <div class="col col-title">
              <div class="skel-title-stack">
                <UISkeletonLoader width="180px" height="16px" border-radius="4px" />
                <UISkeletonLoader width="120px" height="12px" border-radius="4px" />
              </div>
            </div>
            <div class="col col-schedule">
              <UISkeletonLoader width="200px" height="14px" border-radius="4px" />
            </div>
            <div class="col col-actions">
              <UISkeletonLoader width="36px" height="36px" border-radius="8px" />
            </div>
          </div>
        </template>
        
        <template v-else>
          <div v-for="ann in announcements" :key="ann.id" class="table-row" role="row">
            <div class="col col-severity">
              <span :class="['severity-tag', getSeverityClass(ann.severity)]">
                {{ getSeverityLabel(ann.severity) }}
              </span>
            </div>
            <div class="col col-title">
              <div class="title-info">
                <span class="main-title">{{ ann.titleEn }}</span>
                <span class="sub-title">{{ ann.titleTr }}</span>
              </div>
              <span v-if="!ann.isPublished" class="draft-tag">
                {{ selectedLanguage === 'Turkish' ? 'Taslak' : 'Draft' }}
              </span>
            </div>
            <div class="col col-schedule">
              <div class="schedule-info">
                <div class="time-range">
                  <font-awesome-icon icon="calendar-days" class="time-icon" />
                  <span>{{ formatDateTime(ann.startsAt) }} — {{ formatDateTime(ann.endsAt) }}</span>
                </div>
                <span v-if="ann.targetAllSubscribers" class="target-info">
                  <font-awesome-icon icon="users" /> {{ selectedLanguage === 'Turkish' ? 'Tüm Kullanıcılar' : 'All Users' }}
                </span>
              </div>
            </div>
            <div class="col col-actions">
              <button class="row-delete-btn" @click="handleDelete(ann.id)" :title="selectedLanguage === 'Turkish' ? 'Sil' : 'Delete'">
                <font-awesome-icon icon="trash-can" />
              </button>
            </div>
          </div>
        </template>
      </div>

      <div v-if="!isLoading && announcements.length === 0" class="empty-state">
        <div class="empty-state__icon-wrap">
          <font-awesome-icon icon="bullhorn" class="empty-state__icon" aria-hidden="true" />
        </div>
        <h2 class="empty-state__heading">
          {{ selectedLanguage === 'Turkish' ? 'Duyuru bulunamadı' : 'No announcements yet' }}
        </h2>
        <p class="empty-state__text">
          {{ selectedLanguage === 'Turkish' ? 'Henüz bir sistem duyurusu yayınlamadınız.' : 'You haven\'t posted any system announcements yet.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import { adminService } from '@/services/api/admin/admin.service'
import type { AdminAnnouncement, CreateAnnouncementRequest } from '@/services/api/admin/admin.models'
import UISelect from '@/components/UISelect.vue'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import Datepicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'

export default defineComponent({
  name: 'AdminAnnouncements',
  components: {
    UISelect,
    UISkeletonLoader,
    Datepicker
  },
  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English'
    }
  },
  setup(props) {
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
      severity: 1,
      startsAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' '),
      targetAllSubscribers: true,
      targetPlanIdsJson: null,
      targetTiersJson: null,
      isPublished: true
    })

    const severityOptions = [
      { label: 'Low', value: 0 },
      { label: 'Medium', value: 1 },
      { label: 'High', value: 2 },
      { label: 'Critical', value: 3 }
    ]

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
          startsAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' '),
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

    const handleGlobalRefetch = () => {
      fetchAnnouncements()
    }

    onMounted(() => {
      fetchAnnouncements()
      window.addEventListener('app:refetch', handleGlobalRefetch)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:refetch', handleGlobalRefetch)
    })

    return {
      announcements,
      isLoading,
      error,
      showForm,
      isSubmitting,
      form,
      severityOptions,
      handleCreate,
      handleDelete,
      getSeverityLabel,
      getSeverityClass,
      formatDateTime,
      handleGlobalRefetch
    }
  }
})
</script>

<style scoped lang="scss">
.announcements-container {
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
  margin-bottom: 1.5rem;
}

.ann-title {
  font-size: 1.25rem;
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

.add-btn-premium {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: var(--primary-green-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 800px;
  max-height: 85vh;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .modal-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 32px;
    border-bottom: 1px solid var(--border-color);
    background: var(--background-color);
    z-index: 10;

    h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--header-text-color); }

    .close-btn {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      color: var(--normal-text-color);
      cursor: pointer;
      line-height: 1;
      padding: 4px;
      opacity: 0.5;
      transition: all 0.2s;
      &:hover { opacity: 1; transform: scale(1.1); }
    }
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 32px;

    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &.full-width { grid-column: 1 / -1; }

    label { font-size: 0.8rem; font-weight: 600; color: var(--normal-text-color); margin-left: 4px; }

    input[type="text"], textarea {
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      background: var(--background-color-soft);
      color: var(--header-text-color);
      font-size: 0.95rem;
      font-family: inherit;
      transition: all 0.2s;
      
      &:focus {
        border-color: var(--primary-green-color);
        outline: none;
        box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        background: var(--background-color);
      }
    }
  }

  .checkbox-row {
    display: flex;
    flex-direction: row;
    gap: 32px;
    padding-top: 10px;
    align-items: center;
  }

  /* Custom Checkbox Styling */
  .custom-checkbox {
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 35px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--header-text-color);
    user-select: none;
    min-height: 24px;

    input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 24px;
      width: 24px;
      background-color: var(--background-color-soft);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      transition: all 0.2s;

      &::after {
        content: "";
        position: absolute;
        display: none;
        left: 8px;
        top: 4px;
        width: 6px;
        height: 11px;
        border: solid white;
        border-width: 0 2.5px 2.5px 0;
        transform: rotate(45deg);
      }
    }

    &:hover input ~ .checkmark {
      border-color: var(--primary-green-color);
    }

    input:checked ~ .checkmark {
      background-color: var(--primary-green-color);
      border-color: var(--primary-green-color);

      &::after {
        display: block;
      }
    }
  }
}

.datepicker-wrapper {
  width: 100%;

  :deep(.mx-datepicker) {
    width: 100%;
  }

  :deep(.mx-input) {
    height: 46px;
    background-color: var(--background-color-soft);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--header-text-color);
    font-size: 0.95rem;
    padding: 12px 16px;
    box-shadow: none !important;
    transition: all 0.2s;

    &:hover { border-color: var(--primary-green-color); }
    &:focus { border-color: var(--primary-green-color); box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1) !important; background: var(--background-color); }
    
    \u0026::after, \u0026::before { display: none !important; }
  }
}

.modal-actions {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  padding: 24px 32px;
  border-top: 1px solid var(--border-color);
  background: var(--background-color);

  .submit-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 32px;
    background: var(--primary-green-color);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;

    &:disabled { opacity: 0.7; cursor: not-allowed; }
    &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2); }
  }
}

/* Table Style */
.table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;

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
  grid-template-columns: 120px 1fr 280px 80px;
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
  grid-template-columns: 120px 1fr 280px 80px;
  gap: 1.5rem;
  padding: 1.25rem;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s ease;

  &:last-child { border-bottom: none; }
  &:hover { background: rgba(0, 0, 0, 0.02); }
}

.col {
  min-width: 0;
  display: flex;
  align-items: center;
}

.col-severity {
  .severity-tag {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    color: white;
    
    &.low { background: #10b981; }
    &.medium { background: #3b82f6; }
    &.high { background: #f59e0b; }
    &.critical { background: #ef4444; }
  }
}

.col-title {
  display: flex;
  align-items: center;
  gap: 12px;

  .title-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .main-title { font-weight: 700; color: var(--header-text-color); font-size: 0.95rem; }
    .sub-title { font-size: 0.8rem; color: var(--normal-text-color); opacity: 0.7; }
  }

  .draft-tag {
    font-size: 10px;
    background: var(--background-color-soft);
    border: 1px solid var(--border-color);
    padding: 2px 8px;
    border-radius: 4px;
    color: var(--normal-text-color);
    font-weight: 600;
    text-transform: uppercase;
  }
}

.col-schedule {
  .schedule-info {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .time-range {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--header-text-color);
      font-weight: 500;

      .time-icon { color: var(--primary-green-color); opacity: 0.6; }
    }

    .target-info {
      font-size: 0.75rem;
      color: var(--primary-green-color);
      background: rgba(16, 185, 129, 0.08);
      padding: 2px 8px;
      border-radius: 4px;
      width: fit-content;
      font-weight: 600;
      
      svg { font-size: 10px; }
    }
  }
}

.row-delete-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: #ef4444; color: white; border-color: #ef4444; }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;

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

  .empty-state__heading { font-size: 1.25rem; font-weight: 700; color: var(--header-text-color); margin: 0 0 0.5rem; }
  .empty-state__text { font-size: 0.95rem; color: var(--normal-text-color); max-width: 300px; line-height: 1.5; margin: 0; }
}

/* Skeleton */
.skeleton-row-fidelity {
  display: grid;
  grid-template-columns: 120px 1fr 280px 80px;
  gap: 1.5rem;
  padding: 1.25rem;
  align-items: center;
  border-bottom: 1px solid var(--border-color);

  .skel-title-stack {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
}

@media (max-width: 1024px) {
  .table-header, .table-row {
    grid-template-columns: 100px 1fr 220px 60px;
  }
}

@media (max-width: 768px) {
  .header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .add-btn-premium { width: 100%; justify-content: center; }
  .table-header { display: none; }
  .table-row { grid-template-columns: 1fr; gap: 15px; padding: 1.5rem; }
  .col { justify-content: space-between; &::before { content: attr(data-label); font-size: 0.7rem; font-weight: 700; color: var(--normal-text-color); text-transform: uppercase; } }
}
</style>

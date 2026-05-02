<template>
  <div class="notifications-container">
    <div class="header">
      <h1 class="title">{{ texts.title }}</h1>
      <div class="header-actions">
        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button :class="['filter-tab', { active: unreadOnly }]" @click="setFilter(true)">
            {{ texts.unread }}
          </button>
          <button :class="['filter-tab', { active: !unreadOnly }]" @click="setFilter(false)">
            {{ texts.all }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toolbar for Bulk Actions -->
    <div class="toolbar" v-if="notifications.length > 0">
      <div class="toolbar-left">
        <input
          type="checkbox"
          class="custom-checkbox"
          :checked="isAllSelected"
          :indeterminate="isIndeterminate"
          @change="toggleSelectAll"
        />
        <span class="selected-count" v-if="selectedIds.length > 0">
          {{ selectedIds.length }} {{ texts.selected }}
        </span>
      </div>
      <div class="toolbar-right" v-if="selectedIds.length > 0">
        <button class="action-btn" @click="markSelectedAsRead" :disabled="isActionLoading">
          <font-awesome-icon icon="envelope-open" /> {{ texts.markAsRead }}
        </button>
        <button class="action-btn danger" @click="deleteSelected" :disabled="isActionLoading">
          <font-awesome-icon icon="trash" /> {{ texts.delete }}
        </button>
      </div>
    </div>

    <!-- Table content -->
    <div class="table-wrap">
      <div v-if="isLoading" class="table" role="table">
        <div v-for="i in 5" :key="i" class="table-row skeleton-row">
          <div class="col col-checkbox"><div class="skeleton-box checkbox-skeleton"></div></div>
          <div class="col col-message"><div class="skeleton-box row-skeleton"></div></div>
          <div class="col col-date"><div class="skeleton-box date-skeleton"></div></div>
        </div>
      </div>
      <div v-else-if="notifications.length > 0" class="table" role="table">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="table-row notification-card"
          :class="{ 'is-read': notification.isRead }"
          role="row"
          @click="toggleSelection(notification.id)"
        >
          <div class="col col-checkbox" @click.stop>
            <input
              type="checkbox"
              class="custom-checkbox"
              :value="notification.id"
              v-model="selectedIds"
            />
          </div>
          <div class="col col-icon">
            <div class="icon-circle" :class="{ 'unread-icon': !notification.isRead }">
              <font-awesome-icon :icon="getNotificationIcon(notification.type)" />
            </div>
          </div>
          <div class="col col-message">
            <span class="message-text" :class="{ 'font-semibold': !notification.isRead }">
              {{ notification.message }}
            </span>
          </div>
          <div class="col col-date">
            <span class="date-text">{{ formatDate(notification.createdOn) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-state__icon-wrap">
          <font-awesome-icon icon="bell-slash" class="empty-state__icon" />
        </div>
        <h2 class="empty-state__heading">{{ texts.emptyTitle }}</h2>
        <p class="empty-state__text">{{ texts.emptyDesc }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { notificationService } from '@/services/api/notification/notification.service'
import type { UserNotification } from '@/services/api/notification/notification.models'
import { summaryService } from '@/services/api/summary/summary.service'

export default defineComponent({
  name: 'NotificationsView',
  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      default: 'English',
    },
  },
  setup(props) {
    const notifications = ref<UserNotification[]>([])
    const isLoading = ref(true)
    const isActionLoading = ref(false)
    const unreadOnly = ref(true)
    const selectedIds = ref<number[]>([])

    const texts = computed(() => {
      const isEn = props.selectedLanguage === 'English'
      return {
        title: isEn ? 'Notifications' : 'Bildirimler',
        unread: isEn ? 'Unread' : 'Okunmamış',
        all: isEn ? 'All' : 'Tümü',
        selected: isEn ? 'selected' : 'seçildi',
        markAsRead: isEn ? 'Mark as read' : 'Okundu işaretle',
        delete: isEn ? 'Delete' : 'Sil',
        emptyTitle: isEn ? 'All caught up!' : 'Her şey yolunda!',
        emptyDesc: isEn
          ? 'You have no notifications matching this filter.'
          : 'Bu filtreye uygun bildiriminiz bulunmuyor.',
      }
    })

    const fetchNotifications = async () => {
      isLoading.value = true
      selectedIds.value = []
      try {
        const langCode = props.selectedLanguage === 'Turkish' ? 'tr' : 'en'
        notifications.value = await notificationService.getNotifications(
          unreadOnly.value
        )
        updateUnreadCount()
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        isLoading.value = false
      }
    }

    const updateUnreadCount = () => {
      let unreadCount = 0
      if (unreadOnly.value) {
        unreadCount = notifications.value.length
      } else {
        unreadCount = notifications.value.filter(n => !n.isRead).length
      }
      window.dispatchEvent(new CustomEvent('unread-notifications-updated', { detail: unreadCount }))
    }

    const setFilter = (unread: boolean) => {
      unreadOnly.value = unread
      fetchNotifications()
    }

    const isAllSelected = computed(() => {
      return (
        notifications.value.length > 0 && selectedIds.value.length === notifications.value.length
      )
    })

    const isIndeterminate = computed(() => {
      return selectedIds.value.length > 0 && selectedIds.value.length < notifications.value.length
    })

    const toggleSelectAll = (event: Event) => {
      const target = event.target as HTMLInputElement
      if (target.checked) {
        selectedIds.value = notifications.value.map(n => n.id)
      } else {
        selectedIds.value = []
      }
    }

    const toggleSelection = (id: number) => {
      const index = selectedIds.value.indexOf(id)
      if (index === -1) {
        selectedIds.value.push(id)
      } else {
        selectedIds.value.splice(index, 1)
      }
    }

    const markSelectedAsRead = async () => {
      if (selectedIds.value.length === 0) return
      isActionLoading.value = true
      try {
        await notificationService.markNotificationsRead({
          notificationIds: selectedIds.value,
          markAll: false,
        })
        await fetchNotifications()
      } catch (error) {
        console.error('Failed to mark read:', error)
      } finally {
        isActionLoading.value = false
      }
    }

    const deleteSelected = async () => {
      if (selectedIds.value.length === 0) return
      isActionLoading.value = true
      try {
        await notificationService.deleteNotifications({
          notificationIds: selectedIds.value,
          clearAll: false,
        })
        await fetchNotifications()
      } catch (error) {
        console.error('Failed to delete:', error)
      } finally {
        isActionLoading.value = false
      }
    }

    const getNotificationIcon = (type: number) => {
      switch (type) {
        case 1:
          return 'triangle-exclamation'
        case 2:
          return 'circle-info'
        default:
          return 'bell'
      }
    }

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      const locale = props.selectedLanguage === 'Turkish' ? 'tr-TR' : 'en-US'

      if (diffDays === 0) {
        return (
          new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'day') +
          ' ' +
          date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
        )
      } else if (diffDays < 7) {
        return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-diffDays, 'day')
      } else {
        return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
      }
    }

    onMounted(() => {
      fetchNotifications()
      window.addEventListener('app:refetch', fetchNotifications)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('app:refetch', fetchNotifications)
    })

    return {
      notifications,
      isLoading,
      isActionLoading,
      unreadOnly,
      selectedIds,
      texts,
      setFilter,
      isAllSelected,
      isIndeterminate,
      toggleSelectAll,
      toggleSelection,
      markSelectedAsRead,
      deleteSelected,
      getNotificationIcon,
      formatDate,
    }
  },
})
</script>

<style scoped lang="scss">
.notifications-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: 1.25rem 1rem;
  font-family: var(--main-font);

  .header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    gap: 1rem;

    .title {
      font-size: 1.125rem;
      font-weight: 700;
      margin: 0;
      color: var(--header-text-color);
    }

    .filter-tabs {
      display: flex;
      background-color: var(--background-color-soft);
      border-radius: 8px;
      padding: 4px;
      gap: 4px;

      .filter-tab {
        padding: 6px 12px;
        border: none;
        background: transparent;
        color: var(--normal-text-color);
        font-size: 0.85rem;
        font-weight: 500;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;

        &.active {
          background-color: var(--background-color);
          color: var(--header-text-color);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        &:hover:not(.active) {
          color: var(--header-text-color);
        }
      }
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: var(--background-color-soft);
    border: 1px solid var(--border-color);
    border-bottom: none;
    border-radius: 8px 8px 0 0;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;

      .selected-count {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--header-text-color);
      }
    }

    .toolbar-right {
      display: flex;
      gap: 0.5rem;

      .action-btn {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.4rem 0.8rem;
        border: 1px solid var(--border-color);
        background-color: var(--background-color);
        color: var(--normal-text-color);
        border-radius: 6px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          border-color: var(--primary-green-color);
          color: var(--primary-green-color);
        }

        &.danger:hover:not(:disabled) {
          border-color: var(--primary-red-color);
          color: var(--primary-red-color);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }

  .table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
  }

  .header + .table-wrap {
    border-radius: 8px;
  }

  .toolbar + .table-wrap {
    border-radius: 0 0 8px 8px;
    border-top: none;
  }

  .table {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .table-row {
    display: grid;
    grid-template-columns: 3rem 3rem minmax(0, 1fr) auto;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background-color 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: var(--background-color-soft);
    }

    &.is-read {
      .col-message .message-text {
        color: var(--normal-text-color);
        font-weight: 400;
      }
      .col-icon .icon-circle {
        color: var(--normal-text-color);
        opacity: 0.5;
      }
    }
  }

  .col {
    padding: 0 0.5rem;
  }

  .col-checkbox {
    display: flex;
    justify-content: center;
  }

  .col-icon {
    display: flex;
    justify-content: center;

    .icon-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--background-color-soft);
      color: var(--primary-green-color);
      font-size: 0.9rem;

      &.unread-icon {
        background-color: rgba(92, 184, 92, 0.15);
      }
    }
  }

  .col-message {
    .message-text {
      font-size: 0.9rem;
      color: var(--header-text-color);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      &.font-semibold {
        font-weight: 600;
      }
    }
  }

  .col-date {
    text-align: right;
    padding-right: 1.5rem;
    white-space: nowrap;

    .date-text {
      font-size: 0.8rem;
      color: var(--normal-text-color);
    }
  }

  .custom-checkbox {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    appearance: none;
    background-color: var(--background-color);
    cursor: pointer;
    position: relative;

    &:checked {
      background-color: var(--primary-green-color);
      border-color: var(--primary-green-color);

      &::after {
        content: '';
        position: absolute;
        left: 4px;
        top: 1px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }

    &:indeterminate {
      background-color: var(--primary-green-color);
      border-color: var(--primary-green-color);

      &::after {
        content: '';
        position: absolute;
        left: 3px;
        top: 6px;
        width: 8px;
        height: 2px;
        background-color: white;
      }
    }
  }

  /* Skeletons */
  .skeleton-row {
    pointer-events: none;

    .checkbox-skeleton {
      width: 16px;
      height: 16px;
      border-radius: 4px;
    }
    .row-skeleton {
      height: 1rem;
      border-radius: 4px;
      width: 80%;
    }
    .date-skeleton {
      height: 1rem;
      border-radius: 4px;
      width: 80px;
      margin-left: auto;
    }
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4rem 2rem;
    text-align: center;

    &__icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background-color: rgba(92, 184, 92, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;

      .empty-state__icon {
        font-size: 1.5rem;
        color: var(--primary-green-color);
      }
    }

    &__heading {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--header-text-color);
      margin: 0 0 0.5rem 0;
    }

    &__text {
      font-size: 0.9rem;
      color: var(--normal-text-color);
      margin: 0;
    }
  }

  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      align-items: flex-start;
    }
    .toolbar {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    .table-row {
      grid-template-columns: 2.5rem 2.5rem minmax(0, 1fr);
      grid-template-areas:
        'checkbox icon message'
        '. . date';
      padding: 1rem 0;
      gap: 0.5rem 0;
    }
    .col-checkbox {
      grid-area: checkbox;
      justify-content: center;
    }
    .col-icon {
      grid-area: icon;
    }
    .col-message {
      grid-area: message;
      padding-right: 1rem;
    }
    .col-date {
      grid-area: date;
      text-align: left;
      padding-left: 0.5rem;
      padding-right: 1rem;
      margin-top: 0.25rem;
    }
  }
}
</style>

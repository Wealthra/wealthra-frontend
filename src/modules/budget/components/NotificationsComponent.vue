<template>
  <div class="notifications-component-c">
    <div class="notifications-component">
      <div v-if="loading" class="skeleton-box title-skeleton"></div>
      <div v-else class="notifications-component-title">
        {{ notificationsTitleText }}
      </div>
      <div
        class="notifications-component-list"
        :class="{ 'notifications-component-list--empty': !loading && processedNotifications.length === 0 }"
      >
        <template v-if="loading">
          <div v-for="i in 3" :key="i" class="notification-item skeleton-notification">
            <div class="notification-item-content">
              <div class="notification-item-header">
                <div class="skeleton-box indicator-skeleton"></div>
                <div class="skeleton-box type-skeleton"></div>
              </div>
              <div class="skeleton-box message-skeleton"></div>
              <div class="skeleton-box timestamp-skeleton"></div>
            </div>
          </div>
        </template>
        <template v-else-if="processedNotifications.length === 0">
          <div class="empty-state">
            <div class="empty-state__icon-wrap">
              <font-awesome-icon :icon="emptyStateIcon" class="empty-state__icon" aria-hidden="true" />
            </div>
            <h2 class="empty-state__heading">{{ noNotificationsHeading }}</h2>
            <p class="empty-state__text">{{ noNotificationsDescription }}</p>
          </div>
        </template>
        <template v-else>
          <div
            v-for="notification in processedNotifications"
            :key="notification.id"
            class="notification-item"
            :class="{
              'notification-item-warning': getNotificationType(notification.type) === 'Warning',
              'notification-item-info': getNotificationType(notification.type) === 'Info',
              'notification-item-alert': getNotificationType(notification.type) === 'Alert',
            }"
          >
            <div class="notification-item-content">
              <div class="notification-item-header">
                <div class="notification-item-indicator"></div>
                {{ getNotificationClass(notification.type) }}
              </div>
              <div class="notification-item-message">{{ notification.message }}</div>
              <div class="notification-item-timestamp">{{ formatDate(notification.createdOn ?? notification.created) }}</div>
            </div>
          </div>
        </template>
      </div>
      <button
        v-if="!loading && processedNotifications.length > 0"
        class="notifications-component-clear-button"
        @click="clearNotifications"
      >
        {{ clearNotificationsText }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { budgetTexts } from '@/data/budgetTexts'
import { faBell } from '@fortawesome/free-solid-svg-icons'

export default {
  name: 'NotificationsComponent',

  props: {
    selectedLanguage: {
      type: String,
      default: 'English',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    notifications: {
      type: Array as () => Array<{
        id: number
        message: string
        type: number
        created?: string
        createdOn?: string
        budgetId?: number
        categoryName?: string
      }>,
      default: () => [],
    },
  },

  data() {
    return {
      emptyStateIcon: faBell,
    }
  },

  computed: {
    processedNotifications() {
      if (!Array.isArray(this.notifications)) return []
      return this.notifications
    },
    notificationsTitleText(): string {
      return this.selectedLanguage === 'English' ? 'Notifications' : 'Bildirimler'
    },
    clearNotificationsText(): string {
      return this.selectedLanguage === 'English' ? 'Clear Notifications' : 'Bildirimleri Temizle'
    },
    noNotificationsHeading(): string {
      const texts = budgetTexts[this.selectedLanguage as 'English' | 'Turkish']
      return (texts as Record<string, string>).noNotificationsHeading ?? 'No notifications'
    },
    noNotificationsDescription(): string {
      const texts = budgetTexts[this.selectedLanguage as 'English' | 'Turkish']
      return (texts as Record<string, string>).noNotificationsDescription ?? 'Budget alerts and updates will appear here.'
    },
  },

  methods: {
    getNotificationClass(type: number | string): string {
      const parsedType = this.getNotificationType(type)
      if (parsedType === 'Info') return this.selectedLanguage === 'English' ? 'Info' : 'Bilgi'
      if (parsedType === 'Alert') return this.selectedLanguage === 'English' ? 'Alert' : 'Dikkat'
      return this.selectedLanguage === 'English' ? 'Warning' : 'Uyarı'
    },

    getNotificationType(type: number | string): string {
      if (typeof type === 'string') {
        const lower = type.toLowerCase()
        if (lower.includes('info')) return 'Info'
        if (lower.includes('warn')) return 'Warning'
        if (lower.includes('alert') || lower.includes('exceed')) return 'Alert'
      }
      switch (Number(type)) {
        case 0:
          return 'Info'
        case 1:
          return 'Warning'
        case 2:
          return 'Alert'
        default:
          return 'Warning'
      }
    },
    formatDate(date: string | undefined): string {
      if (!date) return '—'
      const d = new Date(date)

      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')

      return `${year}.${month}.${day} - ${hours}.${minutes}`
    },
    clearNotifications() {
      this.$emit('deleteNotifications')
    },
  },
}
</script>

<style scoped lang="scss">

.notifications-component-c {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: 1.5rem 1.25rem;
  box-sizing: border-box;
}

.notifications-component {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: 1rem;

  .title-skeleton {
    width: 150px;
    height: 1.5rem;
    margin-bottom: 0px;
  }

  .notifications-component-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--header-text-color);
    flex-shrink: 0;
  }

  .notifications-component-list {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    border-radius: var(--border-radius);
    background-color: transparent;
    gap: 0.75rem;

    &.notifications-component-list--empty {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--background-color);
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 12rem;
    padding: 2rem 1.5rem;
    text-align: center;
  }

  .empty-state__icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    border-radius: var(--border-radius);
    background-color: rgba(92, 184, 92, 0.12);
    color: var(--primary-green-color);
    margin-bottom: 1.25rem;
  }

  .empty-state__icon {
    font-size: 1.75rem;
  }

  .empty-state__heading {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--header-text-color);
  }

  .empty-state__text {
    margin: 0;
    font-size: 0.9375rem;
    color: var(--normal-text-color);
    line-height: 1.5;
    max-width: 18rem;
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    padding: 1rem 1.25rem;
    gap: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--background-color);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    &.skeleton-notification {
      pointer-events: none;
      .indicator-skeleton {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      .type-skeleton {
        width: 40px;
        height: 0.8125rem;
      }
      .message-skeleton {
        width: 100%;
        height: 0.8125rem;
        margin-top: 0.25rem;
      }
      .timestamp-skeleton {
        width: 100px;
        height: 0.75rem;
        margin-top: 0.25rem;
      }
    }

    &-warning {
      background-color: var(--notification-warning-color-soft);
      border-color: var(--notification-warning-color-soft);
      .notification-item-indicator {
        background-color: var(--notification-warning-color);
      }
      .notification-item-header {
        color: var(--notification-warning-color-header);
      }
      .notification-item-message,
      .notification-item-timestamp {
        color: var(--notification-warning-color-text);
      }
    }

    &-info {
      background-color: rgba(92, 184, 92, 0.08);
      border-color: rgba(92, 184, 92, 0.15);
      .notification-item-indicator {
        background-color: var(--primary-green-color);
      }
      .notification-item-header {
        color: var(--primary-green-color);
      }
      .notification-item-message,
      .notification-item-timestamp {
        color: var(--normal-text-color);
      }
    }

    &-alert {
      background-color: var(--notification-alert-color-soft);
      border-color: var(--notification-alert-color-soft);
      .notification-item-indicator {
        background-color: var(--notification-alert-color);
      }
      .notification-item-header {
        color: var(--notification-alert-color-header);
      }
      .notification-item-message,
      .notification-item-timestamp {
        color: var(--notification-alert-color-text);
      }
    }

    .notification-item-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex-grow: 1;
      min-width: 0;

      .notification-item-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        font-size: 0.8125rem;

        .notification-item-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
      }

      .notification-item-message {
        font-size: 0.8125rem;
        color: var(--normal-text-color);
        line-height: 1.35;
      }

      .notification-item-timestamp {
        font-size: 0.75rem;
        color: var(--normal-text-color);
      }
    }
  }

  .notifications-component-clear-button {
    padding: 0.4rem 0.75rem;
    border-radius: var(--border-radius);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    color: var(--header-text-color);
    align-self: center;
    margin-top: 0.25rem;
    flex-shrink: 0;

    &:hover {
      opacity: var(--hover-opacity, 0.9);
    }
  }
}
</style>

<template>
  <div class="notifications-component-c">
    <div class="notifications-component">
      <div class="notifications-component-title">
        {{ notificationsTitleText }}
      </div>
      <div class="notifications-component-list" :class="{ 'notifications-component-list--empty': processedNotifications.length === 0 }">
        <div v-if="processedNotifications.length === 0" class="empty-state">
          <div class="empty-state__icon-wrap">
            <font-awesome-icon :icon="emptyStateIcon" class="empty-state__icon" aria-hidden="true" />
          </div>
          <h2 class="empty-state__heading">{{ noNotificationsHeading }}</h2>
          <p class="empty-state__text">{{ noNotificationsDescription }}</p>
        </div>
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
      </div>
      <button
        v-if="processedNotifications.length > 0"
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
    getNotificationClass(type: number): string {
      switch (type) {
        case 0:
          return this.selectedLanguage === 'English' ? 'Info' : 'Bilgi'
        case 2:
          return this.selectedLanguage === 'English' ? 'Alert' : 'Dikkat'
        default:
          return this.selectedLanguage === 'English' ? 'Warning' : 'Uyarı'
      }
    },

    getNotificationType(type: number): string {
      switch (type) {
        case 0:
          return 'Info'
        case 1:
          return 'Warning'
        case 2:
          return 'Alert'
        default:
          return 'Unknown'
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
/* Styling aligned with UIBudgetTableComponent: same container, borders, empty state, button */
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
    background-color: var(--background-color);

    &.notifications-component-list--empty {
      display: flex;
      align-items: center;
      justify-content: center;
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
    padding: 0.7rem 1rem;
    gap: 0.5rem;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--background-color);

    &:last-child {
      border-bottom: none;
    }

    &-warning {
      background-color: var(--notification-warning-color-soft);
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
      background-color: var(--notification-info-color-soft);
      .notification-item-indicator {
        background-color: var(--notification-info-color);
      }
      .notification-item-header {
        color: var(--notification-info-color-header);
      }
      .notification-item-message,
      .notification-item-timestamp {
        color: var(--notification-info-color-text);
      }
    }

    &-alert {
      background-color: var(--notification-alert-color-soft);
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

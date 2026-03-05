<template>
  <div class="notifications-component-c">
    <div class="notifications-component">
      <div class="notifications-component-title">
        {{ notificationsTitleText }}
      </div>
      <div class="notifications-component-list">
        <div v-if="processedNotifications.length === 0" class="notifications-component-empty">
          {{ noNotificationsText }}
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
            <div class="notification-item-timestamp">{{ formatDate(notification.created) }}</div>
          </div>
        </div>
      </div>
      <button
        v-if="processedNotifications.length > 0"
        class="notifications-component-clear-button"
        @click="clearNotifications"
      >
        <div class="notifications-component-clear-notifications-text">
          {{ clearNotificationsText }}
        </div>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
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
        created: string
        budgetId: number
        categoryName: string
      }>,
      default: () => [],
    },
  },

  computed: {
    processedNotifications(): Array<{
      id: number
      message: string
      type: number
      created: string
      budgetId: number
      categoryName: string
    }> {
      if (Array.isArray(this.notifications)) {
        return this.notifications
      }

      return []
    },
    notificationsTitleText(): string {
      return this.selectedLanguage === 'English' ? 'Notifications' : 'Bildirimler'
    },
    clearNotificationsText(): string {
      return this.selectedLanguage === 'English' ? 'Clear Notifications' : 'Bildirimleri Temizle'
    },
    noNotificationsText(): string {
      return this.selectedLanguage === 'English'
        ? '🔔 No new notifications. 🔔'
        : '🔔 Yeni bildirim yok. 🔔'
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
    formatDate(date: string): string {
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
  height: 85%;
  background-color: var(--background-color-soft);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  box-sizing: border-box;
}

.notifications-component {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 1rem;

  .notifications-component-title {
    font-size: 1.75rem;
    font-weight: bold;
    color: var(--header-text-color);
  }

  .notifications-component-list {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    overflow-y: auto;
    height: 100%;

    .notifications-component-empty {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      font-size: 1.5rem;

      color: var(--normal-text-color);
      text-align: center;
      padding: 1rem;
    }
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    padding: 0.3rem 1rem;
    border-radius: var(--border-radius);
    gap: 0.2rem;

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
      gap: 0.2rem;
      flex-grow: 1;

      .notification-item-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: bold;
        font-size: 1rem;

        .notification-item-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }
      }

      .notification-item-message {
        font-size: 0.8rem;
        color: var(--normal-text-color);
      }

      .notification-item-timestamp {
        font-size: 0.6rem;
        color: var(--normal-text-color);
      }
    }
  }

  .notifications-component-clear-button {
    padding: 0.5rem 1rem;
    background-color: var(--background-color);
    color: var(--normal-text-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    align-self: center;
    margin-top: 0.5rem;

    &:hover {
      background-color: var(--background-color-reverse);
      color: var(--reverse-header-text-color);
      transition: background-color 0.3s ease;
    }
  }
}
</style>

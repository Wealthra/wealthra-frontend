<template>
  <div class="app-layout-container">
    <UIAnnouncementBanner v-if="!isUserAdmin" :selectedLanguage="selectedLanguage" />

    <!-- Left Sidebar -->
    <div
      class="navbar-c"
      :class="{
        'navbar-c--collapsed': isCollapsed,
        'navbar-c--expanded': !isCollapsed,
      }"
    >
      <!-- Collapsed State -->
      <div v-if="isCollapsed" class="navbar-collapsed">
        <div class="sidebar-top">
          <div class="logo-wrapper" @click="routeToPage('Dashboard', selectedLanguage)">
            <img src="../icons/icon-small.svg" alt="Logo" />
          </div>
        </div>

        <div class="navbar-divider"></div>

        <div class="sidebar-middle">
          <div class="middle-wrapper">
            <div
              v-for="(item, index) in sidebarItems"
              :key="'collapsed-' + index"
              class="icon-wrapper clickable"
              :class="{ active: selectedPage === item.label }"
              @click="routeToSidebarItem(item.englishLabel)"
              :title="item.label"
            >
              <div class="nav-icon">
                <font-awesome-icon :icon="leftSidebarIconMap[item.englishLabel]" />
              </div>
            </div>
          </div>
        </div>

        <div class="navbar-divider"></div>

        <div class="sidebar-bottom">
          <div class="toggle-wrapper" @click="toggleSidebar">
            <div class="toggle-icon-wrapper">
              <font-awesome-icon :icon="arrowIcons.right" class="toggle-icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Expanded State -->
      <div v-else class="navbar-expanded">
        <div class="sidebar-top">
          <div class="logo-wrapper" @click="routeToPage('Dashboard', selectedLanguage)">
            <img src="../icons/logo.svg" alt="Logo" />
          </div>
        </div>

        <div class="navbar-divider"></div>

        <div class="sidebar-middle">
          <div class="middle-wrapper">
            <div
              v-for="(item, index) in sidebarItems"
              :key="'expanded-' + index"
              class="menu-item-container"
            >
              <div
                class="icon-wrapper"
                :class="{ active: selectedPage === item.label }"
                @click="routeToSidebarItem(item.englishLabel)"
              >
                <div class="nav-icon">
                  <font-awesome-icon :icon="leftSidebarIconMap[item.englishLabel]" />
                </div>
                <span class="nav-label">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="navbar-divider" v-if="!isUserAdmin && usageData"></div>

        <div class="sidebar-usage-container" v-if="!isLoadingUser && !isUserAdmin && usageData">
          <div class="usage-item">
            <div class="usage-label">
              <span>OCR</span>
              <span class="usage-value"
                >{{ usageData.ocrRequestsThisMonth }} / {{ usageData.monthlyOcrLimit || '∞' }}</span
              >
            </div>
            <div class="usage-bar-bg">
              <div
                class="usage-bar-fill"
                :class="{
                  warning: usageData.ocrRequestsThisMonth / (usageData.monthlyOcrLimit || 1) > 0.8,
                }"
                :style="{
                  width:
                    getUsagePercentage(usageData.ocrRequestsThisMonth, usageData.monthlyOcrLimit) +
                    '%',
                }"
              ></div>
            </div>
          </div>
          <div class="usage-item">
            <div class="usage-label">
              <span>{{ normalizedLanguage === 'English' ? 'Voice' : 'Ses' }}</span>
              <span class="usage-value"
                >{{ usageData.sttRequestsThisMonth }} / {{ usageData.monthlySttLimit || '∞' }}</span
              >
            </div>
            <div class="usage-bar-bg">
              <div
                class="usage-bar-fill"
                :class="{
                  warning: usageData.sttRequestsThisMonth / (usageData.monthlySttLimit || 1) > 0.8,
                }"
                :style="{
                  width:
                    getUsagePercentage(usageData.sttRequestsThisMonth, usageData.monthlySttLimit) +
                    '%',
                }"
              ></div>
            </div>
          </div>
        </div>

        <div class="sidebar-bottom">
          <div class="toggle-wrapper" @click="toggleSidebar">
            <div class="toggle-icon-wrapper">
              <font-awesome-icon :icon="arrowIcons.left" class="toggle-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Wrapper -->
    <div class="app-layout-content">
      <!-- Topbar -->
      <div class="top-bar-c">
        <div class="top-bar-left">
          <div class="greeting-section" v-if="isDashboard">
            <span class="greeting-name">
              {{ greetingTitle }}
            </span>
            <span class="greeting-time">
              {{ greetingSubtitle }}
            </span>
          </div>
          <div class="page-title" v-else>{{ selectedPage }}</div>
        </div>

        <div class="top-bar-right">
          <button
            v-if="!isUserAdmin"
            class="refetch-btn notifications-btn-layout"
            :title="texts.notifications"
            @click="routeToPage('Notifications', selectedLanguage)"
          >
            <font-awesome-icon :icon="faBell" />
            <span v-if="unreadNotificationsCount > 0" class="notification-badge">
              {{ unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount }}
            </span>
          </button>

          <button
            v-if="!isUserAdmin"
            class="refetch-btn export-btn-layout"
            @click="isExportModalOpen = true"
            :title="texts.export"
          >
            <font-awesome-icon :icon="faDownload" />
          </button>

          <button class="refetch-btn" @click="handleRefetch" :title="texts.refetch">
            <font-awesome-icon :icon="faRotateRight" />
          </button>

          <!-- Privacy Mode Toggle -->
          <button
            class="refetch-btn privacy-btn-layout"
            @click="togglePrivacyMode"
            :title="texts.privacy"
          >
            <font-awesome-icon :icon="isPrivacyMode ? faEyeSlash : faEye" />
          </button>

          <UISelect
            :model-value="selectedLanguage"
            class="language-select-topbar"
            :options="[
              { label: 'English', value: 'English' },
              { label: 'Turkish', value: 'Turkish' },
            ]"
            compact
            @update:model-value="val => emitUpdateLanguage(val as string)"
          />
          <UISelect
            :model-value="currency"
            class="currency-select-topbar"
            :label="selectedLanguage === 'English' ? 'Currency' : 'Para Birimi'"
            compact
            :options="[
              { label: 'USD ($)', value: 'USD' },
              { label: 'EUR (€)', value: 'EUR' },
              { label: 'TRY (₺)', value: 'TRY' },
            ]"
            @update:model-value="val => setCurrency(val as any)"
          />
          <UIThemeButton />
          <!-- Profile Section -->
          <div class="profile-section-wrapper" ref="profileWrapperRef">
            <div class="profile-section" @click="toggleSettingsPanel">
              <div class="profile-avatar">
                <img v-if="userAvatarUrl" :src="userAvatarUrl" alt="User Avatar" />
                <div v-else class="avatar-initials">
                  {{ userInitials }}
                </div>
              </div>
            </div>

            <!-- Settings / Dropdown Panel -->
            <div class="settings-panel" v-if="isSettingsPanelOpen">
              <div class="settings-panel-items">
                <div class="settings-item" @click="routeToSettings">
                  <span class="settings-item-label">{{ texts.settings }}</span>
                </div>
                <div class="settings-item" @click="handleLogoutClick">
                  <span class="settings-item-label settings-item-label--danger">
                    {{ texts.logout }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        <slot />
      </div>
    </div>

    <!-- Custom Logout Confirmation Overlay -->
    <div v-if="showLogoutTooltip" class="logout-modal-overlay">
      <div class="logout-modal">
        <h3>{{ texts.logout }}</h3>
        <p>{{ texts.logoutConfirmation }}</p>
        <div class="modal-buttons">
          <button class="btn btn-cancel" @click="toggleLogoutTooltip">{{ texts.no }}</button>
          <button class="btn btn-confirm" @click="handleLogout">{{ texts.yes }}</button>
        </div>
      </div>
    </div>

    <!-- Copilot Chatbot -->
    <CopilotChat v-if="!isUserAdmin" :selectedLanguage="selectedLanguage" :usageData="usageData" />

    <UIExportModal
      v-if="isExportModalOpen"
      :selectedLanguage="selectedLanguage"
      @close="isExportModalOpen = false"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UIThemeButton from '@/components/UIThemeButton.vue'
import CopilotChat from '@/components/CopilotChat.vue'
import UIExportModal from '@/modules/dashboard/components/UIExportModal.vue'
import UISelect from '@/components/UISelect.vue'
import { clearAuth, getUserId, isAdmin, setAdminStatus } from '@/utils/auth'
import UIAnnouncementBanner from '@/components/UIAnnouncementBanner.vue'
import { arrowIcons, leftSidebarIconMap, profileIcon } from '@/icons/fontawesome-icons'
import {
  faBell,
  faDownload,
  faRotateRight,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons'
import { accountService } from '@/services/api/account/account.service'
import { useCurrency } from '@/composables/useCurrency'
import UISkeletonLoader from '@/components/UISkeletonLoader.vue'
import { notificationService } from '@/services/api/notification/notification.service'
import { notificationHub, type NotificationDto } from '@/services/api/notification/notification.hub'
import { adminHub } from '@/services/api/admin/admin.hub'
import type { AccountUserUsageResponse } from '@/services/api/account/account.models'
import notificationSound from '@/assets/notification.wav'

export default defineComponent({
  name: 'ModuleLayout',
  components: {
    UIThemeButton,
    CopilotChat,
    UIAnnouncementBanner,
    UISkeletonLoader,
    UIExportModal,
    UISelect,
  },
  props: {
    selectedLanguage: {
      type: String as () => 'English' | 'Turkish',
      required: true,
    },
    selectedPage: {
      type: String,
      required: true,
    },
  },
  emits: ['update-language'],
  setup(props, { emit }) {
    const router = useRouter()

    type Language = 'English' | 'Turkish'

    const isCollapsed = ref(localStorage.getItem('sidebarCollapsed') !== 'false')
    const isSettingsPanelOpen = ref(false)
    const showLogoutTooltip = ref(false)
    const isExportModalOpen = ref(false)
    const isLoadingUser = ref(true)
    const profileWrapperRef = ref<HTMLElement | null>(null)
    const unreadNotificationsCount = ref(0)
    const usageData = ref<AccountUserUsageResponse | null>(null)

    const { isPrivacyMode, togglePrivacyMode, currency, setCurrency } = useCurrency()

    const userFirstName = ref<string>('')
    const userLastName = ref<string>('')
    const userAvatarUrl = ref<string | null>(null)

    const leftBarContentEnglish = [
      'Dashboard',
      'Recommendations',
      'Income',
      'Expenses',
      'Budget',
      'Goals',
      'Tickets',
      'Settings',
    ] as const

    const leftBarContent: Record<Language, readonly string[]> = {
      English: leftBarContentEnglish as readonly string[],
      Turkish: [
        'Kontrol Paneli',
        'Öneriler',
        'Gelir',
        'Giderler',
        'Bütçe',
        'Hedefler',
        'Destek',
        'Ayarlar',
      ],
    }

    const route = useRoute()
    const isUserAdmin = computed(() => {
      // Check both the auth state and the current route as a fallback
      return (
        isAdmin() ||
        route.path.startsWith('/admin') ||
        (typeof route.name === 'string' && route.name.startsWith('admin-'))
      )
    })

    const settingsLabelEnglish = 'Settings'
    const settingsLabelTurkish = 'Ayarlar'

    const handleClickOutside = (event: MouseEvent) => {
      if (profileWrapperRef.value && !profileWrapperRef.value.contains(event.target as Node)) {
        isSettingsPanelOpen.value = false
      }
    }

    const handleUnreadUpdate = (event: any) => {
      if (event.detail !== undefined) {
        unreadNotificationsCount.value = event.detail
      }
    }

    const playNotificationSound = () => {
      const audio = new Audio(notificationSound)
      audio.volume = 0.4
      audio.play().catch(err => console.error('Failed to play notification sound:', err))
    }

    const onNotificationReceived = (notification: NotificationDto) => {
      unreadNotificationsCount.value++
      playNotificationSound()

      // Optional: Dispatch a custom event if other components need to know
      window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }))
    }

    const fetchInitialUnreadCount = async () => {
      try {
        const notifications = await notificationService.getNotifications(true)
        unreadNotificationsCount.value = notifications.length
      } catch (err) {
        console.error('Failed to fetch initial unread count', err)
      }
    }

    const fetchUsageData = async () => {
      if (isUserAdmin.value) return
      try {
        usageData.value = await accountService.getMeUsage()
      } catch (err) {
        console.error('Failed to fetch usage data', err)
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      window.addEventListener('unread-notifications-updated', handleUnreadUpdate)
      window.addEventListener('app:refetch', fetchUsageData)
      window.addEventListener('app:refetch-usage', fetchUsageData)
      loadCurrentUser()
      fetchInitialUnreadCount()
      fetchUsageData()

      notificationHub.onNotificationReceived(onNotificationReceived)
      notificationHub.start()

      if (isUserAdmin.value) {
        adminHub.start()
      }
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('unread-notifications-updated', handleUnreadUpdate)
      window.removeEventListener('app:refetch', fetchUsageData)
      window.removeEventListener('app:refetch-usage', fetchUsageData)

      notificationHub.offNotificationReceived(onNotificationReceived)
      notificationHub.stop()
      adminHub.stop()
    })

    const emitUpdateLanguage = (language: string) => {
      emit('update-language', language)
      localStorage.setItem('selectedLanguage', language)
    }

    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value
      localStorage.setItem('sidebarCollapsed', isCollapsed.value.toString())
    }

    const routeToPage = (page: string, language: string) => {
      if (language === 'Turkish') {
        const index = leftBarContent.Turkish.indexOf(
          page as (typeof leftBarContent)['Turkish'][number]
        )
        if (index >= 0) {
          page = leftBarContentEnglish[index]
        }
      }
      router.push({ name: page.toLowerCase() })
    }

    const routeToSidebarItem = (englishPage: string) => {
      if (isUserAdmin.value) {
        // Handle Admin tab switching
        const routeMap: Record<string, string> = {
          Overview: 'admin-overview',
          'Dashboard & Analytics': 'admin-analytics',
          'User Management': 'admin-users',
          'Plans & Subscriptions': 'admin-plans',
          'System & AI Config': 'admin-system',
          'Platform Operations': 'admin-operations',
          'Security & Monitoring': 'admin-security',
          Support: 'admin-support',
          'Admin Settings': 'admin-settings',
        }
        router.push({ name: routeMap[englishPage] || 'admin-analytics' })
      } else {
        routeToPage(englishPage, props.selectedLanguage)
      }
    }

    const routeToSettings = () => {
      router.push({ name: 'settings' })
      isSettingsPanelOpen.value = false
    }

    const loadCurrentUser = async () => {
      isLoadingUser.value = true
      try {
        const me = await accountService.getMe()
        userFirstName.value = me.firstName
        userLastName.value = me.lastName
        userAvatarUrl.value = me.avatarUrl || null
        setAdminStatus(me.isAdmin)
        // No need to manually update isUserAdmin anymore as it's computed
        if (me.preferredCurrency) {
          const { setCurrency } = useCurrency()
          setCurrency(me.preferredCurrency as any)
        }
      } catch (err: any) {
        if (err.status === 401) {
          handleLogout()
          return
        }
        const id = getUserId()
        if (!userFirstName.value && id) {
          userFirstName.value = 'User'
        }
      } finally {
        isLoadingUser.value = false
        if (typeof (window as any).removeInitialLoader === 'function') {
          ;(window as any).removeInitialLoader()
        }
      }
    }

    const toggleSettingsPanel = () => {
      isSettingsPanelOpen.value = !isSettingsPanelOpen.value
    }

    const handleLogoutClick = () => {
      isSettingsPanelOpen.value = false
      showLogoutTooltip.value = true
    }

    const toggleLogoutTooltip = () => {
      showLogoutTooltip.value = false
    }

    const handleLogout = async () => {
      const { logout } = await import('@/utils/auth')
      await logout()
      router.push('/login')
    }

    const normalizedLanguage = computed<Language>(() =>
      props.selectedLanguage === 'Turkish' ? 'Turkish' : 'English'
    )

    const isDashboard = computed(() => {
      return props.selectedPage === 'Dashboard' || props.selectedPage === 'Kontrol Paneli'
    })

    const sidebarItems = computed(() => {
      const admin = isUserAdmin.value
      const lang = normalizedLanguage.value

      if (admin) {
        const adminContentEnglish = [
          'Dashboard & Analytics',
          'User Management',
          'Plans & Subscriptions',
          'System & AI Config',
          'Platform Operations',
          'Security & Monitoring',
          'Support',
          'Admin Settings',
        ]
        const adminContentTurkish = [
          'Genel Bakış',
          'Kullanıcı Yönetimi',
          'Plan ve Abonelikler',
          'Sistem Ayarları ve Yapay Zeka',
          'Platform Operasyonları',
          'Güvenlik ve İzleme',
          'Destek',
          'Admin Ayarları',
        ]
        const content = lang === 'Turkish' ? adminContentTurkish : adminContentEnglish

        return adminContentEnglish.map((eng, idx) => ({
          englishLabel: eng,
          label: content[idx],
        }))
      }

      return leftBarContentEnglish.map((eng, idx) => {
        return {
          englishLabel: eng,
          label: leftBarContent[lang][idx],
        }
      })
    })

    const greetingTitle = computed(() => {
      const base = normalizedLanguage.value === 'English' ? 'Hello' : 'Merhaba'

      return `${base} ${userDisplayName.value}`
    })

    const greetingSubtitle = computed(() => {
      return normalizedLanguage.value === 'English' ? 'Welcome back' : 'Tekrar hoş geldin'
    })

    const texts = computed(() => ({
      logoutConfirmation:
        normalizedLanguage.value === 'English'
          ? 'Are you sure you want to log out of your account?'
          : 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      settings: normalizedLanguage.value === 'English' ? 'Settings' : 'Ayarlar',
      logout: normalizedLanguage.value === 'English' ? 'Logout' : 'Çıkış Yap',
      yes: normalizedLanguage.value === 'English' ? 'Yes, Logout' : 'Evet, Çıkış Yap',
      no: normalizedLanguage.value === 'English' ? 'Cancel' : 'İptal',
      refetch: normalizedLanguage.value === 'English' ? 'Refresh Data' : 'Verileri Yenile',
      privacy: normalizedLanguage.value === 'English' ? 'Privacy Mode' : 'Gizlilik Modu',
      export: normalizedLanguage.value === 'English' ? 'Export Data' : 'Verileri Dışa Aktar',
      notifications: normalizedLanguage.value === 'English' ? 'Notifications' : 'Bildirimler',
    }))

    const userInitials = computed(() => {
      const first = (userFirstName.value || '').trim()
      const last = (userLastName.value || '').trim()
      const firstInitial = first ? first[0] : ''
      const lastInitial = last ? last[0] : ''
      const initials = (firstInitial + lastInitial).toUpperCase()
      return initials || 'ET'
    })

    const userDisplayName = computed(() => {
      const name =
        `${(userFirstName.value || '').trim()} ${(userLastName.value || '').trim()}`.trim()
      return name || 'User'
    })

    return {
      isCollapsed,
      isSettingsPanelOpen,
      showLogoutTooltip,
      profileWrapperRef,
      userFirstName,
      userLastName,
      userAvatarUrl,
      leftBarContent,
      leftBarContentEnglish,
      normalizedLanguage,
      leftSidebarIconMap,
      arrowIcons,
      settingsLabelEnglish,
      settingsLabelTurkish,
      profileIcon,
      texts,
      userInitials,
      userDisplayName,
      isDashboard,
      sidebarItems,
      isLoadingUser,
      greetingTitle,
      greetingSubtitle,
      isPrivacyMode,
      isExportModalOpen,
      unreadNotificationsCount,
      usageData,
      togglePrivacyMode,
      emitUpdateLanguage,
      toggleSidebar,
      routeToPage,
      routeToSidebarItem,
      routeToSettings,
      toggleSettingsPanel,
      handleLogoutClick,
      toggleLogoutTooltip,
      handleLogout,
      handleRefetch: () => window.dispatchEvent(new CustomEvent('app:refetch')),
      isUserAdmin,
      faBell,
      faDownload,
      faRotateRight,
      faEye,
      faEyeSlash,
      currency,
      setCurrency,
      getUsagePercentage: (used: number, limit: number | null) => {
        if (!limit) return 0
        return Math.min(Math.round((used / limit) * 100), 100)
      },
    }
  },
})
</script>

<style scoped lang="scss">
.app-layout-container {
  --spacing-2xs: 4px;
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --border-radius-default: 8px;
  --navbar-vertical-width-collapsed: 68px;

  width: 100%;
  height: 100vh;
  display: flex;
  background-color: var(--background-color-soft);
  overflow: hidden;
  font-family: var(--main-font);
}

/* ============================
   Main Layout Wrapping
   ============================ */
.app-layout-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.content-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  margin: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md);
  overflow-y: auto;
  box-sizing: border-box;
}

.sidebar-usage-container {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: fadeIn 0.5s ease;

  .usage-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .usage-label {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 700;
      color: var(--normal-text-color);
      opacity: 0.8;
      letter-spacing: 0.02em;

      .usage-value {
        font-weight: 800;
        color: var(--header-text-color);
      }
    }

    .usage-bar-bg {
      height: 6px;
      background: var(--border-color);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .usage-bar-fill {
      height: 100%;
      background: var(--primary-green-color);
      border-radius: 10px;
      transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 12px rgba(34, 197, 94, 0.2);

      &.warning {
        background: #f59e0b;
        box-shadow: 0 0 12px rgba(245, 158, 11, 0.2);
      }
      &.danger {
        background: #ef4444;
        box-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.layout-loading-skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-top: 20px;

  .skeleton-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
  }

  .skeleton-content {
    flex: 1;
  }
}

/* ============================
   Top Bar Styles
   ============================ */
.top-bar-c {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm) var(--spacing-md);
  gap: var(--spacing-md);
  background-color: transparent;

  .top-bar-left {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    min-width: 0;
    white-space: nowrap;

    .greeting-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2xs);

      .greeting-name {
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        color: var(--normal-text-color);
      }

      .greeting-time {
        font-weight: 700;
        font-size: 20px;
        line-height: 28px;
        color: var(--header-text-color);
      }
    }

    .page-title {
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;
      color: var(--header-text-color);
    }
  }

  .top-bar-right {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .refetch-btn {
      background: rgba(119, 119, 119, 0.1);
      border: 1px solid rgba(119, 119, 119, 0.3);
      background: rgba(119, 119, 119, 0.1);
      border: 1px solid rgba(119, 119, 119, 0.3);
      color: var(--normal-text-color);
      font-size: 11px;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: none;

      &:hover {
        color: var(--header-text-color);
        border-color: rgba(119, 119, 119, 0.6);
        background-color: rgba(119, 119, 119, 0.25);
        transform: scale(0.9);
      }

      &:active {
        opacity: 0.8;
      }

      &.notifications-btn-layout {
        position: relative;
        .notification-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background-color: var(--notification-alert-color);
          color: white;
          font-size: 10px;
          font-weight: 800;
          min-width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--background-color);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 0 2px;
        }
      }

      &.export-btn-layout {
      }

      &.privacy-btn-layout {
      }
    }

    .currency-select-topbar,
    .language-select-topbar {
      min-width: 100px;
      :deep(.select-trigger) {
        height: 32px;
        padding: 0 10px;
        border-radius: 8px;
        background: rgba(119, 119, 119, 0.1);
        border: 1px solid rgba(119, 119, 119, 0.3);
        color: var(--normal-text-color);
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(119, 119, 119, 0.15);
          border-color: rgba(119, 119, 119, 0.5);
        }
      }
    }

    .profile-section-wrapper {
      position: relative;
    }

    .profile-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      border-radius: var(--border-radius-default);
      cursor: pointer;
      min-width: max-content;

      &:hover {
        background-color: var(--hover-color);
      }

      .profile-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        border: 1px solid rgba(92, 184, 92, 0.45);
        background-color: rgba(92, 184, 92, 0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.25s ease;
        backdrop-filter: blur(4px);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-green-color);
          font-weight: 700;
          font-size: 16px;
          text-transform: uppercase;
        }
      }
    }

    /* Settings Dropdown Overlay */
    .settings-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 180px;
      background: var(--background-color);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      z-index: 9999;
      overflow: hidden;

      .settings-panel-items {
        padding: var(--spacing-xs) 0;
      }

      .settings-item {
        display: flex;
        align-items: center;
        padding: 10px 16px;
        cursor: pointer;

        &:hover {
          background-color: var(--hover-color);
        }

        .settings-item-label {
          font-weight: 500;
          font-size: 14px;
          color: var(--header-text-color);
        }
      }
    }
  }
}

/* ============================
   Sidebar Module Styles
   ============================ */
.navbar-c {
  height: 100%;
  display: flex;
  background-color: var(--background-color);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.06);
  transition: width 0.25s ease;

  &.navbar-c--collapsed {
    width: var(--navbar-vertical-width-collapsed);
  }

  &.navbar-c--expanded {
    width: 280px;
  }

  .navbar-collapsed {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .navbar-expanded {
    height: 100%;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .sidebar-top {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;

    .logo-wrapper {
      width: 100%;
      height: 100%;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      img {
        max-width: 100%;
        max-height: 32px;
        object-fit: contain;
      }
    }
  }

  .navbar-expanded .sidebar-top .logo-wrapper {
    justify-content: flex-start;
    padding-left: 16px;
  }

  .navbar-divider {
    height: 1px;
    width: 100%;
    background-color: var(--border-color);
    margin: 0;
  }

  /* Icons Setup */
  .sidebar-middle {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    padding: var(--spacing-sm) 0;
    overflow-y: auto;
    overflow-x: hidden;

    .middle-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 4px;
      padding: 0 8px;
    }
  }

  .icon-wrapper {
    position: relative;
    width: 100%;
    height: 40px;
    padding: 0 10px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: var(--normal-text-color);
      width: 18px;
    }

    .nav-label {
      font-weight: 500;
      font-size: 14px;
      color: var(--normal-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    &:hover {
      background-color: var(--hover-color);
      .nav-icon,
      .nav-label {
        color: var(--primary-green-color);
      }
    }

    &.active {
      background-color: rgba(0, 128, 0, 0.1);
      .nav-icon,
      .nav-label {
        color: var(--primary-green-color);
      }
    }
  }

  .navbar-collapsed .icon-wrapper {
    width: 44px;
    height: 44px;
    justify-content: center;
    padding: 0;
    margin: 0 auto;
  }

  .sidebar-bottom {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 16px;

    .toggle-wrapper {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-color);

      &:hover {
        background-color: var(--hover-color);
      }

      .toggle-icon-wrapper {
        color: var(--normal-text-color);
      }
    }
  }

  .navbar-collapsed .sidebar-bottom {
    justify-content: center;
    padding: 0;
  }
}

/* ============================
   Logout Modal Overrides
   ============================ */
.logout-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.logout-modal {
  background: var(--background-color);
  width: 400px;
  max-width: 90%;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;

  h3 {
    margin-top: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--header-text-color);
  }

  p {
    font-size: 14px;
    color: var(--normal-text-color);
    margin: 16px 0 24px 0;
  }

  .modal-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;

    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      border: none;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;

      &.btn-cancel {
        background-color: var(--hover-color);
        color: var(--header-text-color);
        &:hover {
          background-color: var(--border-color);
        }
      }

      &.btn-confirm {
        background-color: var(--primary-green-color);
        color: #fff;
        &:hover {
          background-color: var(--reverse-primary-green-color);
        }
      }
    }
  }
}

/* ============================
   Media Queries
   ============================ */
@media (max-width: 768px) {
  .top-bar-c .top-bar-right .profile-section .profile-info {
    display: none;
  }

  .top-bar-c {
    flex-direction: column-reverse;
    align-items: flex-start;
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-md);

    .top-bar-left {
      width: 100%;
      justify-content: space-between;
      gap: var(--spacing-sm);

      .greeting-section {
        .greeting-name {
          display: block;
          font-size: 13px;
        }
        .greeting-time {
          font-size: 18px;
          line-height: 1.2;
        }
      }

      .page-title {
        font-size: 18px;
        line-height: 1.2;
      }
    }

    .top-bar-right {
      width: 100%;
      justify-content: flex-start;
      gap: var(--spacing-sm);
      flex-wrap: wrap;

      .profile-section-wrapper {
        margin-left: auto;
      }

      .refetch-btn {
        font-size: 11px;
        width: 32px;
        height: 32px;
      }

      .profile-section {
        .profile-avatar {
          width: 36px;
          height: 36px;
        }
      }

      /* Compact sub-components */
      :deep(.language-trigger),
      :deep(.theme-toggle) {
        padding: 6px 12px;
        font-size: 13px;
      }

      .currency-select-topbar,
      .language-select-topbar {
        width: auto;
        min-width: 100px;
        max-width: 130px;
        flex: 0 1 auto;
      }
    }
  }

  /* Optional Mobile specific handling */
  .app-layout-container {
    flex-direction: column;
  }

  .navbar-c {
    width: 100% !important;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-color);

    .navbar-collapsed,
    .navbar-expanded {
      width: 100%;
      height: 60px;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    .sidebar-top,
    .sidebar-bottom,
    .navbar-divider,
    .sidebar-usage-container {
      display: none;
    }

    .sidebar-middle {
      padding: 0 12px;
      flex: 1;
      justify-content: flex-start;
      overflow-x: auto;
      overflow-y: hidden;
      display: flex;
      align-items: center;
      -webkit-overflow-scrolling: touch;

      /* Hide Scrollbar */
      scrollbar-width: none;
      -ms-overflow-style: none;
      &::-webkit-scrollbar {
        display: none;
      }

      /* Premium Edge Fades (Gradients) */
      mask-image: linear-gradient(
        to right,
        transparent,
        black 15px,
        black calc(100% - 15px),
        transparent
      );
      -webkit-mask-image: linear-gradient(
        to right,
        transparent,
        black 15px,
        black calc(100% - 15px),
        transparent
      );

      .middle-wrapper {
        flex-direction: row;
        justify-content: flex-start;
        height: 100%;
        align-items: center;
        gap: 12px; /* Increased gap for better spacing */
        width: auto;
        padding: 0 4px; /* Slight internal padding for the mask */
      }

      .icon-wrapper {
        width: auto;
        padding: 8px 14px;
        margin: 0;
        flex-shrink: 0;
        min-width: max-content;

        .nav-label {
          display: block;
          font-size: 13px;
        }
      }

      .menu-item-container {
        flex-shrink: 0;
      }
    }
  }

  .content-area {
    margin: var(--spacing-sm);
  }
}
</style>

<template>
  <div class="app-layout-container">
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
              v-for="(item, index) in leftBarContent[normalizedLanguage].slice(0, 6)"
              :key="'collapsed-' + index"
              class="icon-wrapper clickable"
              :class="{ active: selectedPage === item }"
              @click="routeToSidebarItem(item, index)"
              :title="item"
            >
              <div class="nav-icon">
                <font-awesome-icon :icon="leftSidebarIconMap[leftBarContentEnglish[index]]" />
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
              v-for="(item, index) in leftBarContent[normalizedLanguage].slice(0, 6)"
              :key="'expanded-' + index"
              class="menu-item-container"
            >
              <div
                class="icon-wrapper"
                :class="{ active: selectedPage === item }"
                @click="routeToSidebarItem(item, index)"
              >
                <div class="nav-icon">
                  <font-awesome-icon :icon="leftSidebarIconMap[leftBarContentEnglish[index]]" />
                </div>
                <span class="nav-label">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="navbar-divider"></div>

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
          <UILanguageButton @updateLanguage="emitUpdateLanguage" />
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
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import UILanguageButton from '@/components/UILanguageButton.vue'
import UIThemeButton from '@/components/UIThemeButton.vue'
import { clearAuth, getUserId } from '@/utils/auth'
import { arrowIcons, leftSidebarIconMap, profileIcon } from '@/icons/fontawesome-icons'
import { accountService } from '@/services/api/account/account.service'

export default defineComponent({
  name: 'ModuleLayout',
  components: {
    UILanguageButton,
    UIThemeButton,
  },
  props: {
    selectedLanguage: {
      type: String,
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
    const profileWrapperRef = ref<HTMLElement | null>(null)

    const userFirstName = ref<string>('')
    const userLastName = ref<string>('')
    const userAvatarUrl = ref<string | null>(null)

    const leftBarContentEnglish = [
      'Dashboard',
      'Income',
      'Expenses',
      'Budget',
      'Goals',
      'Analytics',
      'Settings',
    ] as const

    const leftBarContent: Record<Language, readonly string[]> = {
      English: leftBarContentEnglish as readonly string[],
      Turkish: ['Kontrol Paneli', 'Gelir', 'Giderler', 'Bütçe', 'Hedefler', 'Analizler', 'Ayarlar'],
    }

    const settingsLabelEnglish = 'Settings'
    const settingsLabelTurkish = 'Ayarlar'

    const handleClickOutside = (event: MouseEvent) => {
      if (profileWrapperRef.value && !profileWrapperRef.value.contains(event.target as Node)) {
        isSettingsPanelOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      loadCurrentUser()
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
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
      router.push(page.toLowerCase())
    }

    const routeToSidebarItem = (item: string, index: number) => {
      const englishPage = leftBarContentEnglish[index]
      routeToPage(englishPage, props.selectedLanguage)
    }

    const routeToSettings = () => {
      router.push('settings')
      isSettingsPanelOpen.value = false
    }

    const loadCurrentUser = async () => {
      try {
        const me = await accountService.getMe()
        userFirstName.value = me.firstName
        userLastName.value = me.lastName
        userAvatarUrl.value = me.avatarUrl || null
      } catch {
        const id = getUserId()
        if (!userFirstName.value && id) {
          userFirstName.value = 'User'
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

    const handleLogout = () => {
      clearAuth()
      router.push('/')
    }

    const normalizedLanguage = computed<Language>(() =>
      props.selectedLanguage === 'Turkish' ? 'Turkish' : 'English'
    )

    const isDashboard = computed(() => {
      return props.selectedPage === 'Dashboard' || props.selectedPage === 'Kontrol Paneli'
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
      greetingTitle,
      greetingSubtitle,
      emitUpdateLanguage,
      toggleSidebar,
      routeToPage,
      routeToSidebarItem,
      routeToSettings,
      toggleSettingsPanel,
      handleLogoutClick,
      toggleLogoutTooltip,
      handleLogout,
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
  --navbar-vertical-width-collapsed: 72px;

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
  padding: var(--spacing-md);
  border-radius: 12px;
  background-color: var(--background-color);
  overflow-y: auto;
  box-sizing: border-box;
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
          background: var(--primary-green-color);
          color: var(--background-color);
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
  z-index: 1000;

  transition: width 0.25s ease;

  &.navbar-c--collapsed {
    width: var(--navbar-vertical-width-collapsed);
  }

  &.navbar-c--expanded {
    width: 250px;
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

    .middle-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 4px;
      padding: 0 12px;
    }
  }

  .icon-wrapper {
    position: relative;
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
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
    .navbar-divider {
      display: none;
    }

    .sidebar-middle {
      padding: 0;
      flex: 1;
      justify-content: center;
      .middle-wrapper {
        flex-direction: row;
        justify-content: space-evenly;
        height: 100%;
        align-items: center;
      }
      .icon-wrapper {
        width: auto;
        padding: 8px;
        margin: 0;
      }
    }
  }

  .content-area {
    margin: var(--spacing-sm);
  }
}
</style>

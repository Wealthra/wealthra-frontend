<template>
  <div class="top-bar">
    <div class="top-bar__icons">
      <UILanguageButton @updateLanguage="handleLanguageUpdate" />
      <UIThemeButton />
      <div class="profile-icon-wrapper">
        <font-awesome-icon :icon="profileIcon" class="profile-icon" @click="toggleLogoutTooltip" />
        <div class="logout-tooltip" v-if="showLogoutTooltip">
          <p>{{ texts.logoutConfirmation }}</p>
          <div class="tooltip-buttons">
            <button class="btn btn--yes" @click="handleLogout">
              {{ texts.yes }}
            </button>
            <button class="btn btn--no" @click="toggleLogoutTooltip">
              {{ texts.no }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import UILanguageButton from './UILanguageButton.vue'
import UIThemeButton from './UIThemeButton.vue'
import { clearAuth } from '../utils/auth'
import { profileIcon } from '../icons/fontawesome-icons'

export default {
  name: 'UITopBar',
  components: {
    UILanguageButton,
    UIThemeButton,
  },
  props: {
    selectedLanguage: {
      type: String,
      default: 'English',
    },
  },
  computed: {
    texts() {
      return {
        realData: this.selectedLanguage === 'English' ? 'Real Data' : 'Gerçek Veri',
        logoutConfirmation:
          this.selectedLanguage === 'English'
            ? 'Are you sure you want to logout?'
            : 'Çıkış yapmak istediğinize emin misiniz?',
        yes: this.selectedLanguage === 'English' ? 'Yes' : 'Evet',
        no: this.selectedLanguage === 'English' ? 'No' : 'Hayır',
      }
    },
  },
  data() {
    return {
      showLogoutTooltip: false,
      profileIcon,
    }
  },
  methods: {
    handleLanguageUpdate(language: string) {
      this.$emit('update-language', language)
    },
    toggleLogoutTooltip() {
      this.showLogoutTooltip = !this.showLogoutTooltip
    },
    handleLogout() {
      clearAuth()
      this.$router.push('/')
    },
  },
}
</script>

<style scoped lang="scss">
.top-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding: 0.5rem;

  &__icons {
    display: flex;
    gap: 0.5rem;
  }
}

.profile-icon-wrapper {
  width: 24px;
  height: 24px;
  img {
    width: 24px;
    height: 24px;
    cursor: pointer;
    opacity: var(--opacity);
  }

  .logout-tooltip {
    position: absolute;
    top: 50px;
    right: 0;
    width: 180px;
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;

    p {
      margin-bottom: 0.5rem;
      font-size: 0.8rem;
      color: var(--normal-text-color);
      text-align: center;
    }

    .tooltip-buttons {
      display: flex;
      justify-content: space-between;
      gap: 0.4rem;
    }
  }
}

.btn {
  padding: 0.3rem 0.6rem;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background-color 0.2s;

  &--yes {
    background-color: var(--primary-red-color);
    color: white;

    &:hover {
      background-color: var(--reverse-primary-red-color);
    }
  }

  &--no {
    background-color: var(--primary-blue-color);
    color: white;

    &:hover {
      background-color: var(--reverse-primary-blue-color);
    }
  }
}

.demo-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.6rem;
  border-radius: 3px;
  border: 1px solid var(--border-color);
  background-color: var(--background-color);
  color: var(--normal-text-color);
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--hover-color);
  }
}
</style>

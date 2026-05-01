<template>
  <div class="forgot-password-page">
    <div class="left-wrapper">
      <div class="topbar-icons">
        <UILanguageButton @updateLanguage="handleLanguageUpdate" />
        <UIThemeButton />
      </div>
      <div class="logo">
        <img src="../../../icons/logo.svg" alt="logo" class="logo-img" @click="goLandingPage()" />
      </div>

      <div class="text-content">
        <div class="forgot-header">{{ t.header }}</div>
        <div class="forgot-subtext">{{ subtext }}</div>
      </div>

      <div class="forgot-wrapper">
        <div v-if="status === 'loading'" class="verify-loading">
          <div class="spinner" />
          <span class="loading-label">{{ t.subtextVerifying }}</span>
        </div>

        <div v-else-if="status === 'success'" class="success-message">
          <div class="success-icon">
            <font-awesome-icon icon="circle-check" />
          </div>
          <button type="button" class="reset-button" @click="goLogin">
            <span class="reset-button-text">{{ t.goToLogin }}</span>
          </button>
        </div>

        <div v-else class="invalid-block">
          <div class="invalid-icon">
            <font-awesome-icon icon="circle-exclamation" />
          </div>
          <button type="button" class="reset-button" @click="goLogin">
            <span class="reset-button-text">{{ t.goToLogin }}</span>
          </button>
          <router-link v-if="status === 'invalid'" to="/sign-up" class="secondary-link">
            {{ t.trySignUp }}
          </router-link>
        </div>
      </div>

      <div class="back-to-login">
        <router-link to="/login" class="no-underline">
          <font-awesome-icon icon="arrow-left" class="back-icon" />
          <span class="back-text">{{ t.backToLogin }}</span>
        </router-link>
      </div>
    </div>

    <div class="right-wrapper">
      <img src="../../../icons/auth-page-photo.jpg" alt="" class="auth-page-photo" />
    </div>
  </div>
</template>

<script lang="ts">
import UILanguageButton from '../../../components/UILanguageButton.vue'
import UIThemeButton from '../../../components/UIThemeButton.vue'
import { confirmEmailTexts } from '@/data/confirmEmailTexts'
import { accountService } from '@/services/api/account/account.service'

type Status = 'loading' | 'success' | 'invalid' | 'error'

export default {
  name: 'ConfirmEmailView',
  components: {
    UILanguageButton,
    UIThemeButton,
  },
  data() {
    return {
      selectedLanguage: 'English' as 'English' | 'Turkish',
      status: 'loading' as Status,
    }
  },
  computed: {
    t() {
      return confirmEmailTexts[this.selectedLanguage]
    },
    subtext(): string {
      if (this.status === 'loading') return this.t.subtextVerifying
      if (this.status === 'success') return this.t.subtextSuccess
      if (this.status === 'invalid') return this.t.subtextInvalid
      return this.t.subtextError
    },
  },
  methods: {
    handleLanguageUpdate(language: string) {
      this.selectedLanguage = language as 'English' | 'Turkish'
      localStorage.setItem('selectedLanguage', this.selectedLanguage)
    },
    goLandingPage() {
      this.$router.push('/')
    },
    goLogin() {
      this.$router.push('/login')
    },
    getQueryIds(): { userId: string; code: string } | null {
      const q = this.$route.query
      const rawUser =
        (Array.isArray(q.userId) ? q.userId[0] : q.userId) ??
        (Array.isArray(q.userid) ? q.userid[0] : q.userid)
      const rawCode = Array.isArray(q.code) ? q.code[0] : q.code
      const userId = rawUser != null ? String(rawUser).trim() : ''
      const code = rawCode != null ? String(rawCode).trim() : ''
      if (!userId || !code) return null
      return { userId, code }
    },
    async runConfirm() {
      const ids = this.getQueryIds()
      if (!ids) {
        this.status = 'invalid'
        return
      }
      this.status = 'loading'
      try {
        await accountService.confirmEmail(ids.userId, ids.code)
        this.status = 'success'
      } catch {
        this.status = 'error'
      }
    },
  },
  mounted() {
    const saved = localStorage.getItem('selectedLanguage')
    if (saved === 'Turkish' || saved === 'English') {
      this.selectedLanguage = saved
    }
    this.runConfirm()
  },
}
</script>

<style scoped lang="scss">
@import '../../styles/auth-split-layout.scss';

.verify-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  width: 100%;

  .loading-label {
    font-size: 0.95rem;
    color: var(--normal-text-color);
    text-align: center;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid var(--border-color);
    border-radius: 50%;
    border-top-color: var(--primary-green-color);
    animation: confirm-spin 1s linear infinite;
  }

  @keyframes confirm-spin {
    to {
      transform: rotate(360deg);
    }
  }
}

.invalid-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.5rem;

  .invalid-icon {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    font-size: 2.5rem;
  }

  .secondary-link {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--primary-blue-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

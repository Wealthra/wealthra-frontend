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
        <div class="forgot-subtext">{{ t.subtext }}</div>
      </div>

      <div class="forgot-wrapper">
        <div class="success-message">
          <div class="success-icon">
            <font-awesome-icon icon="circle-check" />
          </div>
          <button type="button" class="reset-button" @click="goLogin">
            <span class="reset-button-text">{{ t.goToLogin }}</span>
          </button>
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
import { passwordResetSuccessTexts } from '@/data/passwordResetSuccessTexts'

export default {
  name: 'PasswordResetSuccessView',
  components: {
    UILanguageButton,
    UIThemeButton,
  },
  data() {
    return {
      selectedLanguage: 'English' as 'English' | 'Turkish',
    }
  },
  computed: {
    t() {
      return passwordResetSuccessTexts[this.selectedLanguage]
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
  },
  mounted() {
    const saved = localStorage.getItem('selectedLanguage')
    if (saved === 'Turkish' || saved === 'English') {
      this.selectedLanguage = saved
    }
  },
}
</script>

<style scoped lang="scss">
@use '../../styles/auth-split-layout.scss';
</style>

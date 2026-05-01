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
        <div class="forgot-header">
          {{
            currentStep === 'email'
              ? forgotTexts[selectedLanguage].header
              : currentStep === 'verify'
                ? forgotTexts[selectedLanguage].verifyHeader
                : forgotTexts[selectedLanguage].newPasswordHeader
          }}
        </div>
        <div class="forgot-subtext">
          {{
            currentStep === 'email'
              ? forgotTexts[selectedLanguage].subtext
              : currentStep === 'verify'
                ? forgotTexts[selectedLanguage].verifySubtext
                : forgotTexts[selectedLanguage].newPasswordSubtext
          }}
        </div>
      </div>

      <div class="forgot-wrapper">
        <!-- Step 1: Email -->
        <form v-if="currentStep === 'email'" @submit.prevent="handleSendCode" class="step-form">
          <div class="forgot-text">{{ forgotTexts[selectedLanguage].forgotText }}</div>

          <UIFormSection
            title="Email"
            :description="forgotTexts[selectedLanguage].emailPlaceholder"
            icon="email"
            field-type="email"
            required
            @update-user-data="(val: string) => (userData.email = val)"
          />

          <button type="submit" class="reset-button" :disabled="isSubmitting">
            <div v-if="isSubmitting" class="spinner"></div>
            <span v-else class="reset-button-text">{{
              forgotTexts[selectedLanguage].resetButton
            }}</span>
          </button>
        </form>

        <!-- Step 2: Verify Code -->
        <form v-else-if="currentStep === 'verify'" @submit.prevent="handleVerifyCode" class="step-form">
          <div class="email-display">{{ userData.email }}</div>

          <UIFormSection
            title="Verification Code"
            :description="forgotTexts[selectedLanguage].codePlaceholder"
            icon="password"
            field-type="text"
            required
            @update-user-data="(val: string) => (userData.code = val)"
          />

          <button type="submit" class="reset-button" :disabled="isSubmitting">
            <div v-if="isSubmitting" class="spinner"></div>
            <span v-else class="reset-button-text">{{
              forgotTexts[selectedLanguage].verifyButton
            }}</span>
          </button>

          <div class="resend-wrapper">
            <div class="resend-text">{{ forgotTexts[selectedLanguage].noEmailText }}</div>
            <div class="resend-link" @click="currentStep = 'email'">
              {{ forgotTexts[selectedLanguage].tryAgain }}
            </div>
          </div>
        </form>

        <!-- Step 3: Reset Password -->
        <form v-else-if="currentStep === 'reset'" @submit.prevent="handleResetPassword" class="step-form">
          <UIFormSection
            title="New Password"
            :description="forgotTexts[selectedLanguage].newPasswordPlaceholder"
            icon="password"
            field-type="password"
            required
            @update-user-data="(val: string) => (userData.newPassword = val)"
          />

          <UIFormSection
            title="Confirm Password"
            :description="forgotTexts[selectedLanguage].confirmPasswordPlaceholder"
            icon="password"
            field-type="password"
            required
            @update-user-data="(val: string) => (userData.confirmPassword = val)"
          />

          <button type="submit" class="reset-button" :disabled="isSubmitting">
            <div v-if="isSubmitting" class="spinner"></div>
            <span v-else class="reset-button-text">{{
              forgotTexts[selectedLanguage].completeButton
            }}</span>
          </button>
        </form>
      </div>

      <div class="back-to-login">
        <router-link to="/login" class="no-underline">
          <font-awesome-icon icon="arrow-left" class="back-icon" />
          <span class="back-text">{{ forgotTexts[selectedLanguage].backToLogin }}</span>
        </router-link>
      </div>
    </div>

    <div class="right-wrapper">
      <img
        src="../../../icons/auth-page-photo.jpg"
        alt="forgot-password-photo"
        class="auth-page-photo"
      />
    </div>
    <UIAlertComponent
      :show="errorMessage.show"
      :message="errorMessage.text"
      :title="errorMessage.title"
      :type="errorMessage.type"
      @update:show="updateErrorMessageShow"
    />
  </div>
</template>

<script lang="ts">
import UILanguageButton from '../../../components/UILanguageButton.vue'
import UIThemeButton from '../../../components/UIThemeButton.vue'
import UIFormSection from '../../../shared/UIFormSection.vue'
import UIAlertComponent from '../../../shared/UIAlertComponent.vue'
import { forgotTexts } from '@/data/forgotTexts'
import { accountService } from '@/services/api/account/account.service'

export default {
  name: 'ForgotPasswordView',
  components: {
    UILanguageButton,
    UIThemeButton,
    UIFormSection,
    UIAlertComponent,
  },
  data() {
    return {
      selectedLanguage: 'English' as 'English' | 'Turkish',
      currentStep: 'email' as 'email' | 'verify' | 'reset',
      userData: {
        email: '',
        code: '',
        newPassword: '',
        confirmPassword: '',
      },
      errorMessage: {
        show: false,
        text: '',
        title: '',
        type: 'error',
      },
      isSubmitting: false,
      forgotTexts: forgotTexts,
    }
  },
  methods: {
    handleLanguageUpdate(language: string) {
      this.selectedLanguage = language as 'English' | 'Turkish'
      localStorage.setItem('selectedLanguage', this.selectedLanguage)
    },

    showError(message: string, title = 'Error', type = 'error') {
      this.errorMessage = {
        show: true,
        text: message,
        title: title,
        type: type,
      }
    },

    updateErrorMessageShow(value: boolean) {
      this.errorMessage.show = value
    },

    async handleSendCode() {
      const email = this.userData.email
      if (!email) {
        this.showError(
          this.selectedLanguage === 'English'
            ? 'Please enter your email address'
            : 'Lütfen e-posta adresinizi girin'
        )
        return
      }

      try {
        this.isSubmitting = true
        await accountService.forgotPassword(email)
        this.currentStep = 'verify'
      } catch (error) {
        console.error('Error:', error)
        this.showError(
          this.selectedLanguage === 'English'
            ? 'Failed to send verification code. Please try again.'
            : 'Doğrulama kodu gönderilirken hata oluştu. Lütfen tekrar deneyin.'
        )
      } finally {
        this.isSubmitting = false
      }
    },

    async handleVerifyCode() {
      const { email, code } = this.userData
      if (!code) {
        this.showError(
          this.selectedLanguage === 'English'
            ? 'Please enter the verification code'
            : 'Lütfen doğrulama kodunu girin'
        )
        return
      }

      try {
        this.isSubmitting = true
        await accountService.verifyResetCode(email, code)
        this.currentStep = 'reset'
      } catch (error) {
        console.error('Error:', error)
        this.showError(
          this.selectedLanguage === 'English'
            ? 'Invalid verification code'
            : 'Geçersiz doğrulama kodu'
        )
      } finally {
        this.isSubmitting = false
      }
    },

    async handleResetPassword() {
      const { email, code, newPassword, confirmPassword } = this.userData

      if (!newPassword || !confirmPassword) {
        this.showError(
          this.selectedLanguage === 'English' ? 'Please fill all fields' : 'Lütfen tüm alanları doldurun'
        )
        return
      }

      if (newPassword !== confirmPassword) {
        this.showError(
          this.selectedLanguage === 'English' ? 'Passwords do not match' : 'Şifreler eşleşmiyor'
        )
        return
      }

      try {
        this.isSubmitting = true
        await accountService.resetPassword({ email, code, newPassword })
        await this.$router.replace({ name: 'passwordResetSuccess' })
      } catch (error) {
        console.error('Error:', error)
        this.showError(
          this.selectedLanguage === 'English'
            ? 'Failed to update password'
            : 'Şifre güncellenirken hata oluştu'
        )
      } finally {
        this.isSubmitting = false
      }
    },

    goLandingPage() {
      this.$router.push('/')
    },
  },
  mounted() {
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      this.selectedLanguage = savedLanguage as 'English' | 'Turkish'
    }
  },
}
</script>

<style scoped lang="scss">
@import '../../styles/auth-split-layout.scss';
</style>

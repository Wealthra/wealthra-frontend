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
                : currentStep === 'reset'
                  ? forgotTexts[selectedLanguage].newPasswordHeader
                  : forgotTexts[selectedLanguage].successHeader
          }}
        </div>
        <div class="forgot-subtext">
          {{
            currentStep === 'email'
              ? forgotTexts[selectedLanguage].subtext
              : currentStep === 'verify'
                ? forgotTexts[selectedLanguage].verifySubtext
                : currentStep === 'reset'
                  ? forgotTexts[selectedLanguage].newPasswordSubtext
                  : forgotTexts[selectedLanguage].successText
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

        <!-- Step 4: Success -->
        <div v-else-if="currentStep === 'success'" class="success-message">
          <div class="success-icon">
            <font-awesome-icon icon="check-circle" />
          </div>
          <button @click="goLogin" class="reset-button">
            <span class="reset-button-text">{{ forgotTexts[selectedLanguage].goToLogin }}</span>
          </button>
        </div>
      </div>

      <div class="back-to-login" v-if="currentStep !== 'success'">
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
      currentStep: 'email' as 'email' | 'verify' | 'reset' | 'success',
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

    showSuccess(message: string, title = 'Success') {
      this.errorMessage = {
        show: true,
        text: message,
        title: title,
        type: 'success',
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
        this.currentStep = 'success'
        this.showSuccess(
          this.selectedLanguage === 'English'
            ? 'Password updated successfully'
            : 'Şifreniz başarıyla güncellendi'
        )
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

    goLogin() {
      this.$router.push('/login')
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
.forgot-password-page {
  width: 100%;
  display: flex;
  align-items: stretch;
  font-family: var(--main-font);
  user-select: none;

  @media (max-width: 1024px) {
    flex-direction: column;
    height: auto;
    overflow-y: auto;
  }

  .left-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 40%;
    height: 100vh;
    overflow-y: auto;
    padding: 2rem;
    gap: 3rem;

    @media (max-width: 1024px) {
      width: 100%;
      padding: 1rem;
      height: auto;
    }

    .topbar-icons {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      width: 100%;
    }

    .logo {
      display: flex;
      align-items: center;
      width: 100%;

      .logo-img {
        height: auto;
        width: 275px;

        @media (max-width: 768px) {
          width: 180px;
        }

        &:hover {
          cursor: pointer;
        }
      }
    }

    .text-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 100%;

      .forgot-header {
        width: 100%;
        font-size: 1.8rem;
        color: var(--header-text-color);
        margin-bottom: 0.3rem;

        @media (max-width: 768px) {
          font-size: 1.5rem;
        }

        @media (max-width: 480px) {
          font-size: 1.5rem;
        }
      }

      .forgot-subtext {
        width: 100%;
        max-width: 500px;
        font-size: 0.9rem;
        line-height: 1.4;
        color: var(--normal-text-color);

        @media (max-width: 480px) {
          font-size: 0.8rem;
        }
      }
    }

    .forgot-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      width: 100%;
      height: auto;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.2rem;

      @media (max-width: 768px) {
        padding: 1.2rem;
      }

      .step-form {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 0.8rem;
      }

      .email-display {
        font-size: 1rem;
        font-weight: 600;
        color: var(--primary-blue-color);
        margin-bottom: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: rgba(var(--primary-blue-rgb), 0.1);
        border-radius: var(--border-radius);
        text-align: center;
        width: 100%;
      }

      .forgot-text {
        font-size: 1.3rem;
        color: var(--header-text-color);
        font-weight: 600;
        width: 100%;
        margin-bottom: 0.3rem;

        @media (max-width: 480px) {
          font-size: 1.1rem;
        }
      }

      .reset-button {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 2.2rem;
        border-radius: 10px;
        background-color: var(--primary-green-color);
        width: 100%;
        cursor: pointer;
        margin-top: 0.8rem;
        border: none;
        transition: all 0.2s ease;
        position: relative;

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .reset-button-text {
          font-size: 1rem;
          color: white;
          font-weight: 600;
        }

        &:hover:not(:disabled) {
          background-color: var(--reverse-primary-green-color);
        }
      }

      .spinner {
        width: 1.3rem;
        height: 1.3rem;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .success-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        width: 100%;
        padding: 0.8rem;

        .success-icon {
          width: 80px;
          height: 80px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: rgba(var(--primary-green-rgb), 0.1);
          color: var(--primary-green-color);
          font-size: 3rem;
        }

        .success-text {
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--header-text-color);
          margin-bottom: 0.8rem;
        }

        .success-subtext {
          font-size: 0.9rem;
          color: var(--normal-text-color);
          margin-bottom: 0.3rem;
        }

        .email-highlight {
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary-blue-color);
          margin-bottom: 1.2rem;
          padding: 0.4rem 0.8rem;
          background-color: rgba(var(--primary-blue-rgb), 0.1);
          border-radius: var(--border-radius);
        }

        .resend-wrapper {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.8rem;
          flex-wrap: wrap;
          justify-content: center;

          .resend-text {
            color: var(--normal-text-color);
            font-size: 0.9rem;
          }

          .resend-link {
            color: var(--primary-blue-color);
            font-weight: 600;
            cursor: pointer;
            font-size: 0.9rem;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }

    .resend-wrapper {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-top: 0.8rem;
      flex-wrap: wrap;
      justify-content: center;

      .resend-text {
        color: var(--normal-text-color);
        font-size: 0.9rem;
      }

      .resend-link {
        color: var(--primary-blue-color);
        font-weight: 500;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.2s ease;

        &:hover {
          opacity: 0.8;
          text-decoration: none;
        }
      }
    }

    .back-to-login {
      display: flex;
      align-items: center;
      width: 100%;
      margin-top: 1rem;

      .no-underline {
        display: flex;
        align-items: center;
        text-decoration: none;
        gap: 0.6rem;
        color: var(--normal-text-color);
        transition: all 0.3s ease;
        padding: 0.4rem 0.6rem;
        border-radius: 8px;
        margin-left: -0.6rem;

        &:hover {
          background-color: var(--input-background-color);
          color: var(--primary-blue-color);
          
          .back-icon {
            transform: translateX(-3px);
          }
        }

        .back-icon {
          font-size: 0.85rem;
          transition: transform 0.3s ease;
        }

        .back-text {
          font-weight: 500;
          font-size: 0.85rem;
        }
      }
    }
  }

  .right-wrapper {
    display: flex;
    justify-content: center;
    width: 60%;
    max-height: 100vh;
    overflow: hidden;

    @media (max-width: 1024px) {
      width: 100%;
      height: 250px;
      order: -1;
    }

    @media (max-width: 768px) {
      height: 180px;
    }

    .auth-page-photo {
      width: 100%;
      object-fit: cover;
      opacity: var(--opacity);

      @media (max-width: 1024px) {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>

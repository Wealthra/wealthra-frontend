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
        <div class="forgot-header">{{ forgotTexts[selectedLanguage].header }}</div>
        <div class="forgot-subtext">
          {{ forgotTexts[selectedLanguage].subtext }}
        </div>
      </div>

      <form class="forgot-wrapper" @submit.prevent="handleResetPassword">
        <div v-if="!emailSent">
          <div class="forgot-text">{{ forgotTexts[selectedLanguage].forgotText }}</div>

          <UIFormSection
            title="Email"
            :description="forgotTexts[selectedLanguage].emailPlaceholder"
            icon="email"
            field-type="email"
            required
            @update-user-data="handleUserDataUpdate"
          />

          <button type="submit" class="reset-button" :disabled="isSubmitting">
            <div v-if="isSubmitting" class="spinner"></div>
            <span v-else class="reset-button-text">{{
              forgotTexts[selectedLanguage].resetButton
            }}</span>
          </button>
        </div>

        <div v-else class="success-message">
          <div class="success-icon">
            <font-awesome-icon icon="envelope" />
          </div>
          <div class="success-text">{{ forgotTexts[selectedLanguage].emailSentHeader }}</div>
          <div class="success-subtext">{{ forgotTexts[selectedLanguage].emailSentText }}</div>
          <div class="email-highlight">{{ userData.email }}</div>
          <div class="resend-wrapper">
            <div class="resend-text">{{ forgotTexts[selectedLanguage].noEmailText }}</div>
            <div class="resend-link" @click="resetForm">
              {{ forgotTexts[selectedLanguage].tryAgain }}
            </div>
          </div>
        </div>
      </form>

      <div class="back-to-login">
        <router-link to="/login" class="no-underline">
          <div class="back-icon">
            <font-awesome-icon icon="arrow-left" />
          </div>
          <div class="back-text">{{ forgotTexts[selectedLanguage].backToLogin }}</div>
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
      userData: {
        email: '',
      },
      errorMessage: {
        show: false,
        text: '',
        title: '',
        type: 'error',
      },
      isSubmitting: false,
      emailSent: false,
      forgotTexts: forgotTexts,
    }
  },
  methods: {
    handleLanguageUpdate(language: string) {
      this.selectedLanguage = language as 'English' | 'Turkish'
      localStorage.setItem('selectedLanguage', this.selectedLanguage)
    },
    handleUserDataUpdate(value: string, fieldType: string) {
      if (fieldType === 'email') {
        this.userData.email = value
      }
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

    async handleResetPassword() {
      const email = this.userData.email
      if (!email) {
        this.showError(
          this.selectedLanguage === 'English'
            ? 'Please enter your email address'
            : 'Lütfen e-posta adresinizi girin',
          this.selectedLanguage === 'English' ? 'Missing Email' : 'Eksik E-posta'
        )
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        this.showError(
          this.selectedLanguage === 'English'
            ? 'Please enter a valid email address'
            : 'Lütfen geçerli bir e-posta adresi girin',
          this.selectedLanguage === 'English' ? 'Invalid Email' : 'Geçersiz E-posta'
        )
        return
      }

      try {
        this.isSubmitting = true
        await accountService.forgotPassword(email)

        this.showSuccess(
          this.selectedLanguage === 'English'
            ? 'Password reset link sent successfully'
            : 'Şifre sıfırlama bağlantısı başarıyla gönderildi',
          this.selectedLanguage === 'English' ? 'Email Sent' : 'E-posta Gönderildi'
        )
        this.emailSent = true
      } catch (error) {
        console.error('Error:', error)
        this.showError(
          this.selectedLanguage === 'English'
            ? 'Failed to send reset link. Please try again.'
            : 'Sıfırlama bağlantısı gönderilirken hata oluştu. Lütfen tekrar deneyin.',
          this.selectedLanguage === 'English' ? 'Request Failed' : 'İstek Başarısız'
        )
      } finally {
        this.isSubmitting = false
      }
    },

    resetForm() {
      this.emailSent = false
      this.userData.email = ''
    },
    goLandingPage() {
      this.$router.push('/')
    },
  },
  mounted() {
    // Check for saved language preference
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
      gap: 1.2rem;
      width: 100%;
      height: auto;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      padding: 1.5rem;

      @media (max-width: 768px) {
        padding: 1.2rem;
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
        height: 2.7rem;
        border-radius: var(--border-radius);
        background-color: var(--primary-green-color);
        width: 100%;
        cursor: pointer;
        margin-top: 1.2rem;
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
          width: 70px;
          height: 70px;
          margin-bottom: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: rgba(var(--primary-blue-rgb), 0.1);
          color: var(--primary-blue-color);
          font-size: 2rem;
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

    .back-to-login {
      display: flex;
      align-items: center;
      width: 100%;
      margin-top: 0.8rem;

      .no-underline {
        display: flex;
        align-items: center;
        text-decoration: none;
        gap: 0.4rem;
        transition: transform 0.2s ease;

        &:hover {
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }

        .back-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(var(--primary-blue-rgb), 0.1);
          transform: rotate(180deg);
        }

        .back-text {
          color: var(--primary-blue-color);
          font-weight: 600;
          font-size: 0.9rem;
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

<template>
  <div class="login-page-c">
    <div class="left-wrapper">
      <div class="topbar-icons">
        <UILanguageButton @updateLanguage="handleLanguageUpdate" />
        <UIThemeButton />
      </div>
      <div class="logo">
        <img src="../icons/logo.svg" alt="logo" class="logo-img" @click="goLandingPage()" />
      </div>
      <div class="text-content">
        <div class="login-header">{{ loginTexts[selectedLanguage].header }}</div>
        <div class="login-subtext">
          {{ loginTexts[selectedLanguage].subtext }}
        </div>
      </div>

      <form class="login-wrapper" @submit.prevent="handleLogin">
        <div class="login-text">{{ loginTexts[selectedLanguage].loginText }}</div>
        <UIFormSection
          title="Email"
          :description="loginTexts[selectedLanguage].emailPlaceholder"
          v-model="userData.email"
          icon="email"
          fieldType="email"
          required
          @update-user-data="handleUserDataUpdate"
        />
        <UIFormSection
          title="Password"
          :description="loginTexts[selectedLanguage].passwordPlaceholder"
          v-model="userData.password"
          icon="password"
          @update-user-data="handleUserDataUpdate"
        />

        <div class="bottom-icons">
          <div class="remember-me-wrapper">
            <div
              class="remember-me-icon"
              @click="toggleRememberMe"
              v-if="!userData.rememberMe"
            ></div>
            <div
              class="remember-me-icon-check"
              @click="toggleRememberMe"
              v-if="userData.rememberMe"
            >
              <img src="../icons/check.svg" alt="check-icon" />
            </div>
            <div class="remember-me-text">
              {{ loginTexts[selectedLanguage].rememberMe }}
            </div>
          </div>
          <div class="forgot-password-text">
            <router-link to="/forgetpassword">
              {{ loginTexts[selectedLanguage].forgotPassword }}
            </router-link>
          </div>
        </div>
        <button type="submit" class="login-button">
          <span class="login-button-text">{{ loginTexts[selectedLanguage].loginButton }}</span>
        </button>
      </form>
      <div class="no-account-wrapper">
        <div class="no-account-text">{{ loginTexts[selectedLanguage].noAccount }}</div>
        <router-link to="/signup" class="no-underline">
          <div class="register-text">{{ loginTexts[selectedLanguage].signUp }}</div>
        </router-link>
      </div>
    </div>
    <div class="right-wrapper">
      <img src="../icons/auth-page-photo.jpg" alt="auth-page-photo" class="auth-page-photo" />
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
import UILanguageButton from '../components/UILanguageButton.vue'
import UIThemeButton from '../components/UIThemeButton.vue'
import UIFormSection from '../components/FormComponents/UIFormSection.vue'
import UIAlertComponent from '../components/FormComponents/UIAlertComponent.vue'
import { loginTexts } from '../data/loginTexts'
import { accountService } from '../services/account/account.service'

export default {
  name: 'LoginView',
  components: {
    UILanguageButton,
    UIThemeButton,
    UIFormSection,
    UIAlertComponent,
  },
  data() {
    return {
      showPassword: false as boolean,
      selectedLanguage: 'English' as 'English' | 'Turkish',
      errorMessage: {
        show: false,
        text: '',
        title: '',
        type: 'error',
      },
      userData: {
        email: '' as string,
        password: '' as string,
        rememberMe: false as boolean,
      } as {
        email: string
        password: string
        rememberMe: boolean
      },
      loginTexts,
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    toggleRememberMe() {
      this.userData.rememberMe = !this.userData.rememberMe
    },
    handleLanguageUpdate(language: string) {
      this.selectedLanguage = language as 'English' | 'Turkish'
      localStorage.setItem('selectedLanguage', this.selectedLanguage)
    },
    async handleLogin() {
      const { email, password, rememberMe } = this.userData

      if (!email || !password) {
        this.showError(
          this.selectedLanguage === 'English'
            ? 'Please enter both email and password'
            : 'Lütfen e-posta ve şifrenizi girin',
          this.selectedLanguage === 'English' ? 'Missing Information' : 'Eksik Bilgi'
        )
        return
      }

      try {
        const data = await accountService.authenticate(email, password)

        if (data.jwToken) {
          import('../utils/auth').then(({ setAuth }) => {
            // Pass user ID to setAuth function
            setAuth(data.jwToken, rememberMe, data.id, data.roles)
            if (data.roles.includes('Admin')) {
              this.$router.push('/admin')
            } else {
              this.$router.push('/dashboard')
            }
          })
        } else {
          throw new Error('No token received from server')
        }
      } catch {
        this.showError(
          this.selectedLanguage === 'English'
            ? 'Login failed. Please check your credentials and try again.'
            : 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin ve tekrar deneyin.'
        )
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
    goLandingPage() {
      this.$router.push('/')
    },
    handleUserDataUpdate(data: string, type: string) {
      if (type === 'email') {
        this.userData.email = data
      } else if (type === 'password') {
        this.userData.password = data
      }
    },
    updateErrorMessageShow(value: boolean) {
      this.errorMessage.show = value
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
.login-page-c {
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

      .login-header {
        width: 100%;
        font-size: 1.7rem;
        color: var(--header-text-color);

        @media (max-width: 768px) {
          font-size: 1.3rem;
        }

        @media (max-width: 480px) {
          font-size: 1.3rem;
        }
      }

      .login-subtext {
        width: 100%;
        max-width: 500px;
        font-size: 0.9rem;
        color: var(--normal-text-color);

        @media (max-width: 480px) {
          font-size: 0.65rem;
        }
      }
    }

    .login-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      gap: 0.8rem;
      width: 100%;
      height: auto;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      padding: 1.2rem 1.5rem;

      @media (max-width: 768px) {
        padding: 1rem;
        gap: 0.8rem;
      }

      .login-text {
        font-size: 1.3rem;
        color: var(--header-text-color);
        font-weight: 600;
        width: 100%;

        @media (max-width: 480px) {
          font-size: 1.2rem;
        }
      }

      .bottom-icons {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        flex-wrap: wrap;
        gap: 0.8rem;

        @media (max-width: 480px) {
          flex-direction: column;
          align-items: flex-start;
        }

        .remember-me-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;

          .remember-me-icon {
            min-width: 1.2rem;
            min-height: 1.2rem;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            &:hover {
              cursor: pointer;
              border-color: var(--primary-blue-color);
            }
          }

          .remember-me-icon-check {
            min-width: 1.2rem;
            min-height: 1.2rem;
            border-radius: 6px;
            background-color: var(--primary-blue-color);
            display: flex;
            justify-content: center;
            align-items: center;
            &:hover {
              cursor: pointer;
            }

            img {
              width: 0.8rem;
              height: 0.8rem;
              color: var(--button-text-color);
            }
          }

          .remember-me-text {
            font-size: 0.8rem;
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--header-text-color);
            white-space: nowrap;

            @media (max-width: 480px) {
              font-size: 0.8rem;
            }
          }
        }

        .forgot-password-text {
          font-size: 0.9rem;
          color: var(--header-text-color);
          text-decoration: underline;

          a {
            color: inherit;
            text-decoration: none;

            &:hover {
              text-decoration: underline;
              color: var(--primary-blue-color);
              transition: color 0.3s ease;
            }
          }

          @media (max-width: 480px) {
            font-size: 0.8rem;
          }
        }
      }

      .login-button {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 2.5rem;
        border-radius: var(--border-radius);
        background-color: var(--primary-green-color);
        width: 100%;
        max-width: 200px;
        cursor: pointer;
        margin-top: 0.3rem;
        border: none;

        .login-button-text {
          font-size: 1rem;
          color: white;
          font-weight: 600;
        }

        &:hover {
          background-color: var(--reverse-primary-green-color);
          transition: background-color 0.3s ease;
        }
      }
    }

    .no-account-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--header-text-color);
      width: 100%;

      @media (max-width: 480px) {
        font-size: 0.8rem;
      }

      .no-account-text {
        color: var(--header-text-color);
      }

      .no-underline {
        text-decoration: none;

        .register-text {
          color: var(--primary-blue-color);
          font-weight: bold;
          cursor: pointer;

          &:hover {
            text-decoration: underline;
            transition: text-decoration 0.3s ease;
          }
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

  .remember-me-icon,
  .remember-me-icon-check {
    &:hover {
      border-color: var(--primary-blue-color);
      transition: border-color 0.3s ease;
    }
  }
}
</style>

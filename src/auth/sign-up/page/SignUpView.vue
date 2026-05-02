<template>
  <div class="signup-page-c">
    <div class="left-wrapper">
      <div class="topbar-icons">
        <UILanguageButton @updateLanguage="handleLanguageUpdate" />
        <UIThemeButton />
      </div>
      <div class="logo">
        <img
          src="../../../icons/logo.svg"
          alt="logo"
          class="logo-img"
          @click="goLandingPage()"
        />
      </div>
      <div class="text-content">
        <div class="signup-header">{{ signupTexts[selectedLanguage].header }}</div>
        <div class="signup-subtext">
          {{ signupTexts[selectedLanguage].subtext }}
        </div>
      </div>

      <form class="signup-wrapper" @submit.prevent="handleSignup">
        <div class="signup-text">{{ signupTexts[selectedLanguage].signupText }}</div>
        <div class="name-wrapper">
          <UIFormSection
            title="First Name"
            :description="signupTexts[selectedLanguage].firstNamePlaceholder"
            icon="person"
            field-type="firstName"
            required
            v-model="userData.firstName"
            @update-user-data="handleUserDataUpdate"
          />
          <UIFormSection
            title="Last Name"
            :description="signupTexts[selectedLanguage].lastNamePlaceholder"
            icon="person"
            field-type="lastName"
            required
            v-model="userData.lastName"
            @update-user-data="handleUserDataUpdate"
          />
        </div>

        <UIFormSection
          title="Email"
          :description="signupTexts[selectedLanguage].emailPlaceholder"
          icon="email"
          field-type="email"
          required
          v-model="userData.email"
          @update-user-data="handleUserDataUpdate"
        />
        <UIFormSection
          title="Password"
          :description="signupTexts[selectedLanguage].passwordPlaceholder"
          icon="password"
          field-type="password"
          required
          v-model="userData.password"
          @update-user-data="handleUserDataUpdate"
        />
        <UIFormSection
          title="Confirm Password"
          :description="signupTexts[selectedLanguage].confirmPasswordPlaceholder"
          icon="password"
          field-type="confirmPassword"
          required
          v-model="userData.confirmPassword"
          @update-user-data="handleUserDataUpdate"
        />

        <div class="bottom-icons">
          <div class="agree-terms-wrapper">
            <div
              class="agree-terms-icon"
              @click="toggleAgreeTerms"
              v-if="!userData.agreeTerms"
            ></div>
            <div
              class="agree-terms-icon-check"
              @click="toggleAgreeTerms"
              v-if="userData.agreeTerms"
            >
              <font-awesome-icon icon="circle-check" />
            </div>
            <div class="agree-terms-text">
              {{ signupTexts[selectedLanguage].agreeTerms }}
              <span class="terms-link" @click="goToTerms()">{{
                signupTexts[selectedLanguage].termsLink
              }}</span>
            </div>
          </div>
        </div>
        <button type="submit" class="signup-button">
          <span class="signup-button-text">{{ signupTexts[selectedLanguage].signupButton }}</span>
        </button>
      </form>
      <div class="have-account-wrapper">
        <div class="have-account-text">{{ signupTexts[selectedLanguage].haveAccount }}</div>
        <router-link to="/login" class="no-underline">
          <div class="login-text">{{ signupTexts[selectedLanguage].login }}</div>
        </router-link>
      </div>
    </div>
    <div class="right-wrapper">
      <img
        src="../../../icons/auth-page-photo.jpg"
        alt="auth-page-photo"
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
import { accountService } from '@/services/api/account/account.service'
export default {
  name: 'SignupView',
  components: {
    UIFormSection,
    UIThemeButton,
    UILanguageButton,
    UIAlertComponent,
  },
  data() {
    return {
      selectedLanguage: 'English' as 'English' | 'Turkish',
      errorMessage: {
        show: false,
        text: '',
        title: '',
        type: 'error',
      },
      userData: {
        firstName: '' as string,
        lastName: '' as string,
        email: '' as string,
        password: '' as string,
        confirmPassword: '' as string,
        agreeTerms: false,
      },
      signupTexts: {
        English: {
          header: 'Create Your Wealthra Account',
          subtext: 'Join Wealthra and discover the perfect financial solutions tailored for you!',
          signupText: 'Sign Up',
          firstNamePlaceholder: 'First name',
          lastNamePlaceholder: 'Last name',
          emailPlaceholder: 'Enter your email',
          passwordPlaceholder: 'Create a password',
          confirmPasswordPlaceholder: 'Confirm your password',
          agreeTerms: 'I agree to the',
          termsLink: 'Terms and Conditions',
          signupButton: 'Create Account',
          haveAccount: 'Already have an account?',
          login: 'Log In',
        },
        Turkish: {
          header: 'Wealthra Hesabınızı Oluşturun',
          subtext: "Wealthra'ya katılın ve size özel finansal çözümleri keşfedin!",
          signupText: 'Kaydol',
          firstNamePlaceholder: 'Adınız',
          lastNamePlaceholder: 'Soyadınız',
          emailPlaceholder: 'E-postanızı girin',
          passwordPlaceholder: 'Bir şifre oluşturun',
          confirmPasswordPlaceholder: 'Şifrenizi onaylayın',
          agreeTerms: 'Şartları ve koşulları',
          termsLink: 'kabul ediyorum',
          signupButton: 'Hesap Oluştur',
          haveAccount: 'Zaten bir hesabınız var mı?',
          login: 'Giriş Yap',
        },
      },
    }
  },
  methods: {
    toggleAgreeTerms() {
      this.userData.agreeTerms = !this.userData.agreeTerms
    },
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

    handleSignup() {
      // Get all form data
      const { firstName, lastName, email, password, confirmPassword, agreeTerms } = this.userData

      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        this.showError(
          this.selectedLanguage === 'English'
            ? 'Please fill in all fields'
            : 'Lütfen tüm alanları doldurun',
          this.selectedLanguage === 'English' ? 'Missing Information' : 'Eksik Bilgi'
        )
        return
      }

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

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\[\]{};:'"\\|,.<>\/?_\-+=])[A-Za-z\d!@#$%^&*()\[\]{};:'"\\|,.<>\/?_\-+=]{8,}$/

      if (!passwordRegex.test(password)) {
        this.showError(
          this.selectedLanguage === 'English'
            ? 'Password must be at least 8 characters and include at least one number, one uppercase character, one lowercase character and one special character'
            : 'Şifre en az 8 karakter olmalı ve en az bir sayı, bir büyük harf, bir küçük harf ve bir özel karakter içermelidir',
          this.selectedLanguage === 'English' ? 'Invalid Password' : 'Geçersiz Şifre'
        )
        return
      }

      if (password !== confirmPassword) {
        this.showError(
          this.selectedLanguage === 'English' ? 'Passwords do not match' : 'Şifreler eşleşmiyor',
          this.selectedLanguage === 'English' ? 'Password Mismatch' : 'Şifre Uyuşmazlığı'
        )
        return
      }

      if (!agreeTerms) {
        this.showError(
          this.selectedLanguage === 'English'
            ? 'You must agree to the Terms and Conditions'
            : 'Şartlar ve Koşulları kabul etmelisiniz',
          this.selectedLanguage === 'English' ? 'Terms Required' : 'Şartlar Gerekli'
        )
        return
      }

      this.registerUser(firstName, lastName, email, password, confirmPassword)
    },

    async registerUser(
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      confirmPassword: string
    ) {
      try {
        await accountService.register({
          firstName,
          lastName,
          email,
          password,
        })

        this.showSuccess(
          this.selectedLanguage === 'English'
            ? 'Account created successfully! Please log in.'
            : 'Hesap başarıyla oluşturuldu! Lütfen giriş yapın.',
          this.selectedLanguage === 'English' ? 'Success' : 'Başarılı'
        )

        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
      } catch (error) {
        let errorMessage =
          this.selectedLanguage === 'English'
            ? 'Registration failed. Please try again.'
            : 'Kayıt başarısız oldu. Lütfen tekrar deneyin.'

        let errorTitle =
          this.selectedLanguage === 'English' ? 'Registration Failed' : 'Kayıt Başarısız'

        // Check if the error is a string (from error.message) or an Error object
        const errorText = error instanceof Error ? error.message : String(error)

        // Check for specific error conditions
        if (errorText.includes('400') || errorText.toLowerCase().includes('duplicate')) {
          errorMessage =
            this.selectedLanguage === 'English'
              ? 'This email is already registered. Please use a different email address or try to log in.'
              : 'Bu e-posta zaten kayıtlı. Lütfen farklı bir e-posta adresi kullanın veya giriş yapmayı deneyin.'

          errorTitle =
            this.selectedLanguage === 'English' ? 'Email Already Exists' : 'E-posta Zaten Mevcut'
        }

        this.showError(errorMessage, errorTitle)

        console.error('Registration error:', errorText)
      }
    },
    goToTerms() {
      if (this.selectedLanguage === 'English') {
        window.open(
          'https://docs.google.com/document/d/1TWblrTvbPJPvH9z0xImWCu3GUdAG8Etcd_M-78H4V0o/edit?usp=drive_link'
        )
      } else {
        window.open(
          'https://docs.google.com/document/d/18zD0QIGq7lqnMAbXZxz5xWOJVsV0-Nj-LhpeSo9l9-M/edit?usp=drive_link',
          '_blank'
        )
      }
    },
    goLandingPage() {
      this.$router.push('/')
    },
    handleUserDataUpdate(value: string, fieldType: string) {
      if (fieldType === 'firstName') {
        this.userData.firstName = value
      } else if (fieldType === 'lastName') {
        this.userData.lastName = value
      } else if (fieldType === 'email') {
        this.userData.email = value
      } else if (fieldType === 'password') {
        this.userData.password = value
      } else if (fieldType === 'confirmPassword') {
        this.userData.confirmPassword = value
      }
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
.signup-page-c {
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

      .signup-header {
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

      .signup-subtext {
        width: 100%;
        max-width: 500px;
        font-size: 0.9rem;
        color: var(--normal-text-color);

        @media (max-width: 480px) {
          font-size: 0.65rem;
        }
      }
    }

    .signup-wrapper {
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

      .signup-text {
        font-size: 1.3rem;
        color: var(--header-text-color);
        font-weight: 600;
        width: 100%;

        @media (max-width: 480px) {
          font-size: 1.2rem;
        }
      }

      .name-wrapper {
        display: flex;
        flex-direction: row;
        width: 100%;
        gap: 0.7rem;
      }
      .bottom-icons {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        flex-wrap: wrap;
        gap: 1rem;
        margin: 0.3rem 0;

        .agree-terms-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;

          .agree-terms-icon {
            min-width: 1.2rem;
            min-height: 1.2rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            &:hover {
              cursor: pointer;
            }
          }

          .agree-terms-icon-check {
            min-width: 1.2rem;
            min-height: 1.2rem;
            border-radius: 8px;
            background-color: var(--primary-blue-color);
            display: flex;
            justify-content: center;
            align-items: center;
            &:hover {
              cursor: pointer;
            }

            svg {
              width: 0.8rem;
              height: 0.8rem;
              color: white;
            }
          }

          .agree-terms-text {
            font-size: 0.9rem;
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--header-text-color);
            white-space: nowrap;

            @media (max-width: 480px) {
              font-size: 0.8rem;
            }

            .terms-link {
              color: var(--primary-blue-color);
              margin-left: 0.3rem;
              cursor: pointer;

              &:hover {
                text-decoration: underline;
              }
            }
          }
        }
      }

      .signup-button {
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

        .signup-button-text {
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

    .have-account-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--header-text-color);
      width: 100%;

      @media (max-width: 480px) {
        font-size: 0.8rem;
      }

      .have-account-text {
        color: var(--header-text-color);
      }

      .no-underline {
        text-decoration: none;

        .login-text {
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

  .agree-terms-icon,
  .agree-terms-icon-check {
    &:hover {
      border-color: var(--primary-blue-color);
      transition: border-color 0.3s ease;
    }
  }
}
</style>

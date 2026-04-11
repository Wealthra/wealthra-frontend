<template>
  <div class="landing-view-c">
    <div class="navbar-wrapper animate-fade-in" :class="{ 'navbar-scrolled': isScrolled }">
      <img src="../icons/logo.svg" alt="logo" class="logo" />
      <div class="options">
        <div class="theme-language-wrapper">
          <UIThemeButton @updateTheme="handleThemeUpdate" />
          <UILanguageBUtton @updateLanguage="handleLanguageUpdate" />
        </div>
        <div class="navbar-links">
          <router-link to="/login" class="login">
            <span>{{ buttonTexts[selectedLanguage].loginButtonText }}</span>
          </router-link>
          <router-link to="/signup" class="sign-up">
            <span>{{ buttonTexts[selectedLanguage].signUpButtonText }}</span>
          </router-link>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <div
        v-for="(content, index) in contentData[selectedLanguage]"
        :key="index"
        class="content-section"
        :class="{ 'animate-reveal': true }"
        :style="{ '--animation-delay': `${index * 0.2 + 0.3}s` }"
      >
        <UILandingViewContentSection
          :header="content.header"
          :coloredHeader="content.coloredHeader"
          :subtext="content.subtext"
          :icon="content.icon"
          :coloredHeaderColor="content.coloredHeaderColor"
          :reverse="content.reverse"
        />
      </div>
    </div>

    <!-- Pricing Section -->
    <div class="pricing-section animate-reveal">
      <UILandingPricing :selectedLanguage="selectedLanguage" />
    </div>

    <div class="ending-text-wrapper animate-reveal">
      <div class="ending-text-header-wrapper">
        {{ endingText[selectedLanguage].header }}
        <span class="gradient-text">{{ endingText[selectedLanguage].coloredHeader }}</span>
        {{ endingText[selectedLanguage].headerResume }}
      </div>
      <div class="ending-text-subtext">
        <span>{{ streamedText }}</span
        ><span class="typing-cursor"></span>
      </div>
      <router-link to="/signup" class="end-chapter-sign-up">
        {{ bottomSignUpText[selectedLanguage] }}
      </router-link>
    </div>

    <div class="footer-wrapper animate-fade-in">
      © {{ currentYear }}
      {{ footerText[selectedLanguage] }}
    </div>
  </div>
</template>
<script lang="ts">
import UIThemeButton from '../components/UIThemeButton.vue'
import UILanguageBUtton from '../components/UILanguageButton.vue'
import UILandingViewContentSection from '../components/LandingViewComponents/UILandingViewSection.vue'
import UILandingPricing from '../components/LandingViewComponents/UILandingPricing.vue'
import {
  buttonTexts,
  footerText,
  contentData,
  endingText,
  bottomSignUpText,
} from '@/data/landingTexts'

export default {
  name: 'LandingView',

  components: {
    UIThemeButton,
    UILanguageBUtton,
    UILandingViewContentSection,
    UILandingPricing,
  },

  data() {
    return {
      isScrolled: false,
      scrollThreshold: 50,
      selectedLanguage: 'English' as 'English' | 'Turkish',
      buttonTexts,
      footerText,
      contentData,
      endingText,
      bottomSignUpText,
      animateOnScroll: true,
      scrollObserver: null as IntersectionObserver | null,
      isStreaming: false,
      streamingSpeed: 30,
      streamedText: '',
      typingInterval: null as number | null,
    }
  },

  mounted() {
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      this.selectedLanguage = savedLanguage as 'English' | 'Turkish'
    }
    window.addEventListener('scroll', this.handleScroll)
    this.setupScrollReveal()
  },

  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
    if (this.scrollObserver) {
      this.scrollObserver.disconnect()
    }
    if (this.typingInterval) {
      clearInterval(this.typingInterval)
    }
  },

  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > this.scrollThreshold
    },

    handleThemeUpdate(theme: string) {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme-preference', theme)
      this.$emit('theme-updated', theme)
    },

    setupScrollReveal() {
      if ('IntersectionObserver' in window) {
        this.scrollObserver = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('in-view')

                if (entry.target.classList.contains('ending-text-wrapper') && !this.isStreaming) {
                  this.startTextStreaming()
                }

                if (this.scrollObserver) {
                  this.scrollObserver.unobserve(entry.target)
                }
              }
            })
          },
          { threshold: 0.15 }
        )

        setTimeout(() => {
          document.querySelectorAll('.animate-reveal').forEach(element => {
            if (this.scrollObserver) {
              this.scrollObserver.observe(element)
            }
          })
        }, 100)
      } else {
        document.querySelectorAll('.animate-reveal').forEach(element => {
          element.classList.add('in-view')
        })
        this.startTextStreaming()
      }
    },

    startTextStreaming() {
      if (this.typingInterval) {
        clearInterval(this.typingInterval)
        this.typingInterval = null
      }
      this.isStreaming = true
      this.streamedText = ''
      const fullText = this.endingText[this.selectedLanguage].subtext
      let charIndex = 0

      this.typingInterval = setInterval(() => {
        if (charIndex < fullText.length) {
          this.streamedText += fullText.charAt(charIndex)
          charIndex++
        } else {
          if (this.typingInterval) {
            clearInterval(this.typingInterval)
            this.typingInterval = null
          }
          this.isStreaming = false
        }
      }, this.streamingSpeed)
    },

    handleLanguageUpdate(language: string) {
      this.selectedLanguage = language as 'English' | 'Turkish'
      localStorage.setItem('selectedLanguage', this.selectedLanguage)
      this.$emit('language-updated', this.selectedLanguage)

      const endingTextElement = document.querySelector('.ending-text-wrapper')
      if (endingTextElement && endingTextElement.classList.contains('in-view')) {
        this.startTextStreaming()
      } else {
        this.streamedText = ''
        if (this.typingInterval) {
          clearInterval(this.typingInterval)
          this.typingInterval = null
        }
        this.isStreaming = false
      }
    },
  },

  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/base.css';

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease both;
}

.animate-slide-up {
  animation: slideUp 0.8s ease both;
}

.animate-scale-in {
  animation: scaleIn 0.8s ease both;
}

.animate-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
  animation-delay: var(--animation-delay, 0s);
  animation-fill-mode: both;
}

.animate-reveal.in-view {
  opacity: 1;
  transform: translateY(0);
}

.landing-view-c {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  font-family: var(--main-font);
  padding: 1.5rem 0.8rem 0.3rem 0.8rem;
  gap: 2rem;
  overflow-x: hidden;

  @media (min-width: 768px) {
    padding: 1.5rem 1.5rem 0.3rem 2rem;
    gap: 3.5rem;
  }

    .navbar-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: 0.75rem;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    padding: 0.9rem 0.9rem 1rem 0.9rem;
    transition:
      padding 0.3s ease,
      box-shadow 0.3s ease,
      backdrop-filter 0.3s ease;
    background-color: transparent;

    &.navbar-scrolled {
      background-color: var(--background-color);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
      backdrop-filter: blur(10px);
    }

    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      padding: 1.1rem 2.5rem;

      &.navbar-scrolled {
        padding: 0.9rem 2.5rem;
      }
    }

    .logo {
      max-width: 130px;
      transition: transform 0.3s ease;

      @media (min-width: 768px) {
        max-width: 180px;
      }

      @media (min-width: 1024px) {
        max-width: 200px;
      }
    }

    .options {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.25rem;
      width: 100%;
      justify-content: center;
      flex-wrap: wrap;
      row-gap: 0.5rem;

      @media (min-width: 768px) {
        width: auto;
        margin-top: 0;
        margin-left: auto;
        flex-wrap: nowrap;
        gap: 1.5rem;
      }

      .theme-language-wrapper {
        display: flex;
        gap: 0.7rem;

        @media (min-width: 768px) {
          gap: 1.1rem;
        }
      }

      .navbar-links {
        display: flex;
        gap: 8px;
        flex-shrink: 0;

        @media (min-width: 768px) {
          gap: 14px;
        }
      }
    }
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 2rem;
    padding-top: 7.5rem;

    @media (min-width: 768px) {
      gap: 3.5rem;
      padding-top: 5.5rem;
    }
  }

  .login {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--normal-text-color);
    font-size: 13px;
    font-weight: 500;
    border: 1px solid var(--border-color);
    padding: 0.45rem 1.1rem;
    border-radius: 999px;
    text-decoration: none;
    width: max-content;
    transition:
      transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
      box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      background: var(--background-color-reverse);
      color: var(--reverse-header-text-color);
      border-color: var(--reverse-header-text-color);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
    }

    &:active {
      transform: translateY(1px);
    }
  }

  .sign-up {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    padding: 0.45rem 1.2rem;
    border-radius: 999px;
    background: var(--primary-green-color);
    width: auto;
    transition:
      transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
      box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    @media (min-width: 768px) {
      font-size: 14px;
    }

    &:hover {
      background: var(--reverse-primary-green-color);
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.16);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px);
    }
  }

  .ending-text-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 0.8rem;

    .ending-text-header-wrapper {
      font-size: 28px;
      font-weight: lighter;
      color: var(--header-text-color);

      @media (min-width: 768px) {
        font-size: 40px;
      }

      .gradient-text {
        background: linear-gradient(45deg, var(--gradient-start-color), var(--gradient-end-color));
        background-size: 300% 300%;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
        animation: gradientAnimation 2s linear infinite;
      }
    }

    .ending-text-subtext {
      font-size: 16px;
      font-weight: 400;
      color: var(--normal-text-color);
      min-height: 1.5em;

      @media (min-width: 768px) {
        font-size: 20px;
      }

      .typing-cursor {
        display: inline-block;
        width: 2px;
        height: 1em;
        background-color: var(--normal-text-color);
        margin-left: 2px;
        vertical-align: text-top;
        animation: blink 0.7s infinite;
      }
    }

    .end-chapter-sign-up {
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      font-size: 16px;
      font-weight: 500;
      text-decoration: none;
      padding: 0.6rem 1.2rem;
      border-radius: 15px;
      background: var(--primary-green-color);
      margin-top: 1.5rem;
      width: 80%;
      max-width: 250px;
      transition:
        transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
        box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

      @media (min-width: 768px) {
        font-size: 20px;
        padding: 0.8rem 1.6rem;
        margin-top: 3rem;
        width: auto;
        max-width: none;
      }

      &:hover {
        background: var(--reverse-primary-green-color);
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      }

      &:active {
        transform: translateY(2px);
      }
    }
  }

  .footer-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    color: var(--normal-text-color);
    font-size: 9px;
    padding: 0.4rem;
    text-align: center;
    user-select: none;

    @media (min-width: 768px) {
      font-size: 11px;
    }
  }

  .scroll-to-top-button {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 1000;
    padding: 1.2rem;
    position: fixed;
    bottom: 25px;
    right: 25px;
    width: 8px;
    height: 8px;
    border-radius: 15px;
    background-color: var(--primary-green-color);
    color: var(--reverse-header-text-color);
    border: none;
    transition:
      opacity 0.3s ease,
      transform 0.3s ease,
      box-shadow 0.3s ease;
    opacity: 0;
    transform: translateY(20px);

    .scroll-icon-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      rotate: -90deg;
      transition: transform 0.3s ease;

      .arrow-up-icon {
        width: 25px;
        height: 25px;
        filter: brightness(0) invert(1);

        @media (min-width: 768px) {
          width: 40px;
          height: 40px;
        }
      }
    }

    &.scroll-to-top-button-active {
      opacity: 0.8;
      transform: translateY(0);
    }

    &:hover {
      background-color: var(--reverse-primary-green-color);
      transform: translateY(-5px) scale(1.1);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

      .scroll-icon-wrapper {
        transform: scale(1.1);
      }
    }

    @media (min-width: 768px) {
      width: 25px;
      height: 25px;
      padding: 1.6rem;
    }
  }
}
</style>

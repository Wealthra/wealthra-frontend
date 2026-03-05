<template>
  <div class="language-toggle" @click.stop="toggleDropdown">
    <button class="language-trigger" type="button" :aria-expanded="isOpen">
      <span class="language-label">{{ currentLanguage }}</span>
    </button>
    <transition name="fade">
      <ul v-if="isOpen" class="language-dropdown">
        <li
          v-for="option in languageOptions"
          :key="option"
          class="language-option"
          :class="{ 'is-active': option === currentLanguage }"
          @click.stop="selectLanguage(option)"
        >
          {{ option }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const LANGUAGE_KEY = 'selectedLanguage'

type SupportedLanguage = 'English' | 'Turkish'

export default defineComponent({
  name: 'UILanguageButton',
  emits: ['updateLanguage'],
  data() {
    const stored = localStorage.getItem(LANGUAGE_KEY) as SupportedLanguage | null
    const initial: SupportedLanguage = stored === 'Turkish' ? 'Turkish' : 'English'

    return {
      currentLanguage: initial,
      isOpen: false,
      languageOptions: ['English', 'Turkish'] as SupportedLanguage[],
    }
  },
  computed: {},
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },
    selectLanguage(language: SupportedLanguage) {
      this.currentLanguage = language
      localStorage.setItem(LANGUAGE_KEY, language)
      document.documentElement.setAttribute('lang', language === 'English' ? 'en' : 'tr')
      this.$emit('updateLanguage', language)
      this.isOpen = false
    },
  },
})
</script>

<style scoped lang="scss">
.language-toggle {
  position: relative;
  display: inline-block;
}

.language-trigger {
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
  background-color: transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    background-color: var(--color-background-hover);
    border-color: var(--border-color);
  }

  &:active {
    transform: scale(0.97);
  }

  .language-icon {
    font-size: 14px;
  }

  .language-label {
    font-weight: 500;
  }
}

.language-dropdown {
  position: absolute;
  right: 0;
  margin-top: 0.35rem;
  padding: 0.25rem 0;
  min-width: 120px;
  background-color: var(--background-color);
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  list-style: none;
  z-index: 20;
}

.language-option {
  padding: 0.35rem 0.75rem;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--normal-text-color);

  &:hover {
    background-color: var(--color-background-hover);
  }

  &.is-active {
    font-weight: 600;
    color: var(--primary-green-color);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

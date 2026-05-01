<template>
  <button class="theme-toggle" type="button" @click="updateTheme" :aria-label="ariaLabel">
    <i class="theme-icon" :class="themeIconClass"></i>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

const THEME_KEY = 'theme-preference'

export default defineComponent({
  name: 'UIThemeButton',
  emits: ['updateTheme'],
  data() {
    return {
      isLightTheme: localStorage.getItem(THEME_KEY) !== 'dark',
    }
  },
  computed: {
    themeIconClass(): string {
      return this.isLightTheme ? 'fa-solid fa-sun' : 'fa-solid fa-moon'
    },
    ariaLabel(): string {
      return this.isLightTheme ? 'Switch to dark theme' : 'Switch to light theme'
    },
  },
  methods: {
    updateTheme() {
      document.body.classList.add('theme-transitioning')
      this.isLightTheme = !this.isLightTheme
      const theme = this.isLightTheme ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, theme)
      document.documentElement.setAttribute('data-theme', theme)
      this.$emit('updateTheme', theme)
      
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning')
      }, 50)
    },
  },
})
</script>

<style scoped lang="scss">
.theme-toggle {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--normal-text-color);
  font-size: 13px;
  border: 1px solid rgba(119, 119, 119, 0.3);
  background-color: rgba(119, 119, 119, 0.08);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background-color: rgba(119, 119, 119, 0.25);
    border-color: rgba(119, 119, 119, 0.6);
    color: var(--header-text-color);
  }

  &:active {
    opacity: 0.8;
  }

  .theme-icon {
    font-size: 13px;
  }
}
</style>

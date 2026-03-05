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
      this.isLightTheme = !this.isLightTheme
      const theme = this.isLightTheme ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, theme)
      document.documentElement.setAttribute('data-theme', theme)
      this.$emit('updateTheme', theme)
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
  border: 1px solid var(--border-color);
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
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

  .theme-icon {
    font-size: 16px;
  }
}
</style>

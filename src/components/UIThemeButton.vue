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
  font-size: 16px;
  border: 1px solid rgba(119, 119, 119, 0.2);
  background-color: rgba(119, 119, 119, 0.05);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background-color: rgba(119, 119, 119, 0.1);
    border-color: rgba(119, 119, 119, 0.4);
    color: var(--header-text-color);
  }

  &:active {
    opacity: 0.8;
  }

  .theme-icon {
    font-size: 16px;
  }
}
</style>

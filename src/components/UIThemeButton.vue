<template>
  <div class="theme-toggle" @click="updateTheme">
    <span class="toggle-icon">
      <img
        src="../icons/light-mode-icon.svg"
        alt="Light Theme"
        class="theme-icon"
        v-if="isLightTheme"
      />
      <img src="../icons/dark-mode-icon.svg" alt="Dark Theme" class="theme-icon" v-else />
    </span>
  </div>
</template>

<script lang="ts">
const THEME_KEY = 'theme-preference'

export default {
  name: 'UIThemeButton',
  data() {
    return {
      isLightTheme: localStorage.getItem(THEME_KEY) !== 'dark',
    }
  },
  emits: ['updateTheme'],
  methods: {
    updateTheme() {
      this.isLightTheme = !this.isLightTheme
      const theme = this.isLightTheme ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, theme)
      document.documentElement.setAttribute('data-theme', theme)
      this.$emit('updateTheme', theme)
    },
  },
}
</script>

<style scoped lang="scss">
.theme-toggle {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-background);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--color-background-hover);
  }

  .toggle-icon {
    width: 24px;
    height: 24px;

    .theme-icon {
      width: 100%;
      height: auto;
    }
  }
}
</style>

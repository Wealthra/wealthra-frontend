<template>
  <div class="language-toggle" @click="updateLanguage">
    <span class="toggle-icon">
      <img src="../icons/english.svg" alt="English" class="language-icon" v-if="isEnglish" />
      <img src="../icons/turkey.svg" alt="Turkish" class="language-icon" v-else />
    </span>
  </div>
</template>

<script lang="ts">
const LANGUAGE_KEY = 'selectedLanguage'

export default {
  name: 'UILanguageButton',
  data() {
    return {
      isEnglish: localStorage.getItem(LANGUAGE_KEY) !== 'Turkish',
    }
  },
  emits: ['updateLanguage'],
  methods: {
    updateLanguage() {
      this.isEnglish = !this.isEnglish
      const language = this.isEnglish ? 'English' : 'Turkish'
      localStorage.setItem(LANGUAGE_KEY, language)
      document.documentElement.setAttribute('lang', language)
      this.$emit('updateLanguage', language)
    },
  },
}
</script>

<style scoped lang="scss">
.language-toggle {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-background);
  transition: background-color 0.3s ease;

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: var(--opacity);
    }
  }

  &:hover {
    background-color: var(--color-background-hover);
  }

  .toggle-icon {
    width: 24px;
    height: 24px;
    opacity: var(--opacity);

    .language-icon {
      width: 100%;
      height: auto;
      animation: fadeIn 0.1s ease-in-out;
    }
  }
}
</style>

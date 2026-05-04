<template>
  <div id="app">
    <RouterView />
    <UIToast />
    <UIConfirmModal />
    <UIPromptModal />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import UIToast from './components/UIToast.vue'
import UIConfirmModal from './components/UIConfirmModal.vue'
import UIPromptModal from './components/UIPromptModal.vue'
</script>

<style scoped lang="scss">
#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--main-font);
}
</style>

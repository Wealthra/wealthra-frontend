<template>
  <div id="app">
    <RouterView />
    <UIToast />
    <UIConfirmModal />
    <UIPromptModal />
  </div>
</template>

<script lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isAuthenticated } from './utils/auth'
import UIToast from './components/UIToast.vue'
import UIConfirmModal from './components/UIConfirmModal.vue'
import UIPromptModal from './components/UIPromptModal.vue'

export default {
  name: 'App',
  components: {
    UIToast,
    UIConfirmModal,
    UIPromptModal
  },
  setup() {
    const router = useRouter()

    onMounted(() => {
      // Check if user is authenticated on app start
      if (isAuthenticated() && router.currentRoute.value.path === '/') {
        // Redirect to dashboard if authenticated and on landing page
        router.push('/dashboard')
      }
    })
  },
}
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

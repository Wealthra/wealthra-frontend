<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isAuthenticated } from './utils/auth'

export default {
  name: 'App',
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

<template>
  <div class="ui-loader">
    <div v-if="!hasError" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">{{ loadingText }}</div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'UILoading',
  props: {
    isLoading: {
      type: Boolean,
      default: true,
    },
    hasError: {
      type: Boolean,
      default: false,
    },
    loadingText: {
      type: String,
      default: 'Loading...',
    },
    errorMessage: {
      type: String,
      default: 'An error occurred while loading data.',
    },
    retryText: {
      type: String,
      default: 'Retry',
    },
    showRetryButton: {
      type: Boolean,
      default: true,
    },
  },
}
</script>

<style scoped lang="scss">
.ui-loader {
  width: 100%;
  .loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 1.5rem;
    gap: 0.5rem;

    .loading-spinner {
      width: 30px;
      height: 30px;
      border: 3px solid var(--border-color);
      border-top: 3px solid var(--primary-blue-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      font-size: 0.875rem;
      color: var(--normal-text-color);
    }
  }
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

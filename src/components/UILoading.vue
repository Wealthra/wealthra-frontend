<template>
  <div class="ui-loader skeleton-shiver">
    <div v-if="!hasError" class="skeleton-container">
      <!-- Title row equivalent skeleton -->
      <div class="skeleton-row header-row">
        <div class="skeleton-box title-box"></div>
      </div>
      
      <!-- Top info boxes equivalent skeleton -->
      <div class="skeleton-row info-row">
        <div class="skeleton-box card-box"></div>
        <div class="skeleton-box card-box"></div>
        <div class="skeleton-box card-box"></div>
        <div class="skeleton-box card-box"></div>
      </div>
      
      <!-- Main content sections equivalent skeleton -->
      <div class="skeleton-row main-row">
        <div class="skeleton-box large-box"></div>
        <div class="skeleton-box large-box"></div>
      </div>
    </div>
    <div v-else class="error-container">
       <div class="error-text">{{ errorMessage }}</div>
       <button v-if="showRetryButton" class="btn-retry">{{ retryText }}</button>
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
  height: 100%;
  display: flex;
  flex-direction: column;
}

.skeleton-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0;
  gap: 1.5rem;
}

.skeleton-row {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.header-row {
  margin-bottom: 0.5rem;
}

.title-box {
  width: 250px;
  height: 32px;
}

.info-row {
  justify-content: space-between;
  flex-wrap: wrap;
}

.card-box {
  flex: 1;
  min-width: 200px;
  height: 100px;
}

.main-row {
  flex-wrap: wrap;
  flex: 1;
}

.large-box {
  flex: 1;
  min-width: 300px;
  height: 300px;
}


.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  gap: 1rem;

  .error-text {
    color: var(--notification-alert-color-text);
  }

  .btn-retry {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    background: var(--primary-blue-color);
    color: #fff;
    border: none;
    cursor: pointer;
  }
}
</style>

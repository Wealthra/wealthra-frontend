<template>
  <transition name="error-fade">
    <div v-if="show" class="error-message" :class="{ 'error-success': type === 'success' }">
      <div class="error-icon">
        <font-awesome-icon :icon="icon" :alt="type === 'error' ? 'error-icon' : 'success-icon'" />
      </div>
      <div class="error-content">
        <div class="error-title">{{ title }}</div>
        <div class="error-description">{{ message }}</div>
      </div>
      <div class="error-close" @click="closeError">
        <span>&times;</span>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { alertTypeIconMap } from '../icons/fontawesome-icons'

export default defineComponent({
  name: 'UIErrorMessage',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'Error',
    },
    type: {
      type: String,
      default: 'error',
      validator: (value: string) => ['error', 'success', 'warning', 'info'].includes(value),
    },
    duration: {
      type: Number,
      default: 5000,
    },
  },
  computed: {
    icon() {
      const key = this.type as keyof typeof alertTypeIconMap
      return alertTypeIconMap[key]
    },
  },
  watch: {
    show(newVal) {
      if (newVal && this.duration > 0) {
        this.startAutoCloseTimer()
      }
    },
  },
  methods: {
    closeError() {
      this.$emit('update:show', false)
    },
    startAutoCloseTimer() {
      setTimeout(() => {
        this.closeError()
      }, this.duration)
    },
  },
  mounted() {
    if (this.show && this.duration > 0) {
      this.startAutoCloseTimer()
    }
  },
})
</script>

<style scoped lang="scss">
.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  min-width: 300px;
  max-width: 450px;
  background-color: var(--primary-red-color);
  border-radius: var(--border-radius);
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &.error-success {
    background-color: var(--primary-green-color);
  }

  .error-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .error-content {
    flex: 1;

    .error-title {
      font-weight: 600;
      font-size: 1rem;
      color: var(--header-text-color);
      margin-bottom: 0.25rem;
    }

    .error-description {
      font-size: 0.9rem;
      color: var(--header-text-color);
    }
  }

  .error-close {
    cursor: pointer;
    font-size: 1.25rem;
    color: var(--header-text-color);
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
}

.error-fade-enter-active,
.error-fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>

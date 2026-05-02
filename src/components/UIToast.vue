<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :class="`toast-item--${toast.type}`"
          @click="remove(toast.id)"
        >
          <div class="toast-icon">
            <font-awesome-icon :icon="getIcon(toast.type)" />
          </div>
          <div class="toast-content">
            {{ toast.message }}
          </div>
          <button class="toast-close">
            <font-awesome-icon icon="xmark" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/stores/useToast'
import { storeToRefs } from 'pinia'

const toastStore = useToast()
const { toasts } = storeToRefs(toastStore)
const { remove } = toastStore

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'circle-check'
    case 'error':
      return 'circle-xmark'
    case 'warning':
      return 'triangle-exclamation'
    default:
      return 'circle-info'
  }
}
</script>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  min-width: 300px;
  max-width: 450px;
  padding: 16px;
  border-radius: 12px;
  background: var(--background-color-soft);
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);

  &--success {
    border-left: 4px solid #10b981;
    .toast-icon { color: #10b981; }
  }
  &--error {
    border-left: 4px solid #ef4444;
    .toast-icon { color: #ef4444; }
  }
  &--warning {
    border-left: 4px solid #f59e0b;
    .toast-icon { color: #f59e0b; }
  }
  &--info {
    border-left: 4px solid #3b82f6;
    .toast-icon { color: #3b82f6; }
  }
}

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--header-text-color);
  line-height: 1.4;
}

.toast-close {
  background: transparent;
  border: none;
  color: var(--normal-text-color);
  opacity: 0.5;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
}

/* Animations */
.toast-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}
.toast-leave-active {
  position: absolute;
}
</style>

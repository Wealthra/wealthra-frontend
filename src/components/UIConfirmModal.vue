<template>
  <UIModal :is-open="isOpen" :title="options.title" max-width="400px" @close="cancel">
    <div class="confirm-body">
      <div class="confirm-icon" :class="`confirm-icon--${options.type}`">
        <font-awesome-icon :icon="getIcon(options.type)" />
      </div>
      <p class="confirm-message">{{ options.message }}</p>
    </div>
    <template #footer>
      <button class="btn btn-secondary" @click="cancel">{{ options.cancelText }}</button>
      <button class="btn" :class="`btn-${options.type || 'primary'}`" @click="confirm">
        {{ options.confirmText }}
      </button>
    </template>
  </UIModal>
</template>

<script setup lang="ts">
import UIModal from './UIModal.vue'
import { useConfirm } from '@/stores/useConfirm'
import { storeToRefs } from 'pinia'

const confirmStore = useConfirm()
const { isOpen, options } = storeToRefs(confirmStore)
const { confirm, cancel } = confirmStore

const getIcon = (type?: string) => {
  switch (type) {
    case 'danger':
      return 'triangle-exclamation'
    case 'warning':
      return 'circle-exclamation'
    default:
      return 'circle-question'
  }
}
</script>

<style scoped lang="scss">
.confirm-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 10px 0;
}

.confirm-icon {
  font-size: 48px;
  margin-bottom: 20px;
  
  &--danger { color: #ef4444; }
  &--warning { color: #f59e0b; }
  &--primary { color: var(--accent-color); }
}

.confirm-message {
  font-size: 16px;
  color: var(--normal-text-color);
  line-height: 1.5;
  margin: 0;
}

.btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &-secondary {
    background: var(--background-color-soft);
    color: var(--normal-text-color);
    border: 1px solid var(--border-color);
    &:hover { background: var(--border-color); }
  }

  &-primary {
    background: var(--accent-color);
    color: white;
    &:hover { filter: brightness(1.1); }
  }

  &-danger {
    background: #ef4444;
    color: white;
    &:hover { background: #dc2626; }
  }

  &-warning {
    background: #f59e0b;
    color: white;
    &:hover { background: #d97706; }
  }
}
</style>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-shell glass-card" :style="{ maxWidth: maxWidth }">
          <header class="modal-header">
            <div class="modal-header__title">
              <slot name="header">
                <h3>{{ title }}</h3>
              </slot>
            </div>
            <button
              type="button"
              class="modal-close-btn"
              @click="close"
              aria-label="Close"
            >
              <font-awesome-icon icon="xmark" />
            </button>
          </header>

          <div class="modal-body">
            <slot></slot>
          </div>

          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  isOpen: boolean
  title?: string
  maxWidth?: string
}>()

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-shell {
  width: 100%;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--background-color-soft);

  &__title {
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--header-text-color);
    }
  }
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: var(--normal-text-color);
  font-size: 20px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: var(--border-color);
    color: var(--header-text-color);
  }
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--background-color-soft);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
  
  .modal-shell {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  
  .modal-shell {
    transform: scale(0.9) translateY(20px);
  }
}
</style>

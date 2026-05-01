<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="sidebar-overlay"
        aria-hidden="true"
        @click="$emit('close')"
      />
    </Transition>
    <Transition name="slide-right">
      <aside
        v-if="isOpen"
        class="side-panel-sidebar glass-panel"
        role="dialog"
        aria-modal="true"
        :aria-label="ariaLabel || title || 'Panel'"
      >
        <div class="sidebar-header">
          <div class="sidebar-header-main">
            <slot name="header">
              <div class="header-title">
                <h2>{{ title }}</h2>
              </div>
            </slot>
          </div>
          <button type="button" class="close-btn" aria-label="Close" @click="$emit('close')">
            <font-awesome-icon icon="xmark" />
          </button>
        </div>
        <div class="sidebar-content custom-scrollbar">
          <slot />
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default defineComponent({
  name: 'UISidePanelShell',
  components: { FontAwesomeIcon },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    ariaLabel: {
      type: String,
      default: '',
    },
  },
  emits: ['close'],
})
</script>

<style scoped lang="scss">
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 10001;
}

.side-panel-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 450px;
  background: var(--background-color);
  border-left: 1px solid var(--border-color);
  z-index: 10002;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;

  .sidebar-header-main {
    flex: 1;
    min-width: 0;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    h2 {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--header-text-color);
      margin: 0;
      letter-spacing: -0.02em;
    }
  }

  .close-btn {
    background: var(--background-color-soft);
    border: none;
    color: var(--normal-text-color);
    width: 36px;
    height: 36px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      background: var(--border-color);
      color: var(--header-text-color);
    }
  }
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .side-panel-sidebar {
    max-width: 100%;
  }
}
</style>

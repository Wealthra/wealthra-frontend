<template>
  <UIModal :is-open="isOpen" :title="options.title" max-width="450px" @close="cancel">
    <div class="prompt-body">
      <p class="prompt-message" v-if="options.message">{{ options.message }}</p>
      <div class="prompt-input-wrapper">
        <input
          v-model="inputValue"
          :type="options.inputType"
          :placeholder="options.placeholder"
          class="prompt-input"
          @keyup.enter="submit"
          ref="inputRef"
        />
      </div>
    </div>
    <template #footer>
      <button class="btn btn-secondary" @click="cancel">{{ options.cancelText }}</button>
      <button class="btn btn-primary" @click="submit" :disabled="!inputValue && options.inputType !== 'text'">
        {{ options.confirmText }}
      </button>
    </template>
  </UIModal>
</template>

<script setup lang="ts">
import UIModal from './UIModal.vue'
import { usePrompt } from '@/stores/usePrompt'
import { storeToRefs } from 'pinia'
import { ref, watch, nextTick } from 'vue'

const promptStore = usePrompt()
const { isOpen, options, inputValue } = storeToRefs(promptStore)
const { submit, cancel } = promptStore

const inputRef = ref<HTMLInputElement | null>(null)

watch(isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})
</script>

<style scoped lang="scss">
.prompt-body {
  padding: 10px 0;
}

.prompt-message {
  font-size: 14px;
  color: var(--normal-text-color);
  margin-bottom: 16px;
  opacity: 0.8;
}

.prompt-input-wrapper {
  width: 100%;
}

.prompt-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--background-color-soft);
  border: 1px solid var(--border-color);
  color: var(--header-text-color);
  font-size: 15px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 4px rgba(var(--accent-color-rgb), 0.1);
  }
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
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
}
</style>

<template>
  <div class="ui-datepicker" :class="{ 'ui-datepicker--compact': compact }">
    <Datepicker
      v-model:value="internalValue"
      :type="type"
      :value-type="valueType"
      :format="format"
      :placeholder="placeholder"
      :disabled="disabled"
      class="datepicker-custom"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Datepicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'

const props = defineProps<{
  modelValue: any
  type?: 'date' | 'datetime' | 'year' | 'month' | 'time' | 'week'
  valueType?: string
  format?: string
  placeholder?: string
  disabled?: boolean
  compact?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<style lang="scss">
/* Global styles for the datepicker popup to ensure it matches the theme */
.mx-datepicker-main {
  background-color: var(--background-color) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 38px -10px rgba(0, 0, 0, 0.2) !important;
  color: var(--header-text-color) !important;
  font-family: var(--main-font) !important;
}

.mx-calendar-content .cell.active {
  background-color: var(--primary-green-color) !important;
}

.mx-calendar-content .cell:hover {
  background-color: var(--background-color-soft) !important;
  color: var(--primary-green-color) !important;
}

.mx-datepicker-footer {
  border-top: 1px solid var(--border-color) !important;
}

.mx-btn-text:hover {
  color: var(--primary-green-color) !important;
}

.mx-table-date .today {
  color: var(--primary-green-color) !important;
}
</style>

<style scoped lang="scss">
.ui-datepicker {
  width: 100%;

  :deep(.mx-datepicker) {
    width: 100%;
  }

  :deep(.mx-input) {
    height: 38px;
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--header-text-color);
    font-size: 0.9rem;
    font-family: var(--main-font);
    box-shadow: none;
    padding-left: 1rem;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      border-color: var(--primary-green-color);
      background-color: var(--background-color-soft);
    }

    &:focus {
      border-color: var(--primary-green-color);
      box-shadow: 0 0 0 2px rgba(92, 184, 92, 0.1);
    }

    &:disabled {
      background-color: var(--background-color-soft);
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &--compact {
    :deep(.mx-input) {
      height: 32px;
      font-size: 0.8125rem;
      border-radius: 8px;
    }
  }
}
</style>

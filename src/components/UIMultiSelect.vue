<template>
  <div class="ui-multi-select" :class="{ 'ui-multi-select--compact': compact }" v-bind="$attrs">
    <DropdownMenuRoot v-model:open="isOpen">
      <DropdownMenuTrigger class="multi-select-trigger" :disabled="disabled">
        <div class="trigger-content">
          <span v-if="selectedLabels.length === 0" class="placeholder">{{ placeholder }}</span>
          <div v-else class="selected-tags">
            <span v-for="label in displayLabels" :key="label" class="tag">
              {{ label }}
            </span>
            <span v-if="selectedLabels.length > maxDisplay" class="tag more">
              +{{ selectedLabels.length - maxDisplay }}
            </span>
          </div>
        </div>
        <font-awesome-icon icon="chevron-down" class="select-icon" />
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          class="multi-select-content"
          :side-offset="5"
          align="start"
          position="popper"
        >
          <div v-if="searchable" class="select-search-wrap" @click.stop>
            <font-awesome-icon icon="magnifying-glass" class="search-icon" />
            <input
              v-model="searchTerm"
              class="select-search-input"
              :placeholder="searchPlaceholder"
              @keydown.stop
            />
          </div>

          <div class="options-viewport">
            <DropdownMenuCheckboxItem
              v-for="option in filteredOptions"
              :key="getOptionValue(option)"
              class="multi-select-item"
              :checked="isSelected(getOptionValue(option))"
              @select.prevent="toggleOption(getOptionValue(option))"
              :disabled="isOptionDisabled(option)"
            >
              <div class="checkbox-box" :class="{ checked: isSelected(getOptionValue(option)) }">
                <font-awesome-icon v-if="isSelected(getOptionValue(option))" icon="check" />
              </div>
              <span class="item-label">{{ getOptionLabel(option) }}</span>
            </DropdownMenuCheckboxItem>

            <div v-if="filteredOptions.length === 0" class="select-no-results">
              No results found
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from 'radix-vue'

interface Option {
  label: string
  value: string | number
  disabled?: boolean
}

const props = defineProps<{
  modelValue: (string | number)[]
  options: (Option | string | number)[]
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  compact?: boolean
  maxDisplay?: number
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchTerm = ref('')
const maxDisplay = props.maxDisplay || 2

const getOptionValue = (option: Option | string | number) => {
  return typeof option === 'object' ? (option as Option).value : (option as string | number)
}

const getOptionLabel = (option: Option | string | number) => {
  return typeof option === 'object' ? (option as Option).label : (option as string | number)
}

const isOptionDisabled = (option: Option | string | number) => {
  return typeof option === 'object' ? (option as Option).disabled : false
}

const isSelected = (value: string | number) => {
  return props.modelValue.includes(value)
}

const toggleOption = (value: string | number) => {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(value)
  if (index > -1) {
    newValue.splice(index, 1)
  } else {
    newValue.push(value)
  }
  emit('update:modelValue', newValue)
}

const filteredOptions = computed(() => {
  if (!searchTerm.value) return props.options
  const term = searchTerm.value.toLowerCase()
  return props.options.filter(option => {
    const label = getOptionLabel(option).toString().toLowerCase()
    return label.includes(term)
  })
})

const selectedLabels = computed(() => {
  return props.modelValue.map(val => {
    const option = props.options.find(opt => getOptionValue(opt) === val)
    return option ? getOptionLabel(option) : val.toString()
  })
})

const displayLabels = computed(() => {
  return selectedLabels.value.slice(0, maxDisplay)
})
</script>

<style lang="scss">
.multi-select-content {
  min-width: var(--radix-dropdown-menu-trigger-width);
  max-height: 300px;
  background-color: var(--background-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 38px -10px rgba(0, 0, 0, 0.2);
  z-index: 10050;
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.options-viewport {
  padding: 5px;
  overflow-y: auto;
  max-height: 240px;
}

.multi-select-item {
  font-size: 0.8125rem;
  line-height: 1;
  color: var(--header-text-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 10px;
  position: relative;
  user-select: none;
  cursor: pointer;
  gap: 8px;
  outline: none;

  &[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }

  &[data-highlighted] {
    background-color: var(--background-color-soft);
    color: var(--primary-green-color);
  }

  .checkbox-box {
    width: 16px;
    height: 16px;
    border: 1.5px solid var(--border-color);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 0.6rem;
    color: white;

    &.checked {
      background-color: var(--primary-green-color);
      border-color: var(--primary-green-color);
    }
  }
}
</style>

<style scoped lang="scss">
.ui-multi-select {
  width: 100%;
}

.multi-select-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px;
  padding: 0 1rem;
  font-size: 0.9rem;
  height: 38px;
  gap: 8px;
  background-color: var(--background-color);
  color: var(--header-text-color);
  border: 1px solid var(--border-color);
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: var(--primary-green-color);
    background-color: var(--background-color-soft);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.trigger-content {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.placeholder {
  color: var(--normal-text-color);
  opacity: 0.5;
  font-size: 0.8125rem;
}

.selected-tags {
  display: flex;
  gap: 4px;
  align-items: center;
  overflow: hidden;

  .tag {
    background-color: var(--background-color-soft);
    color: var(--primary-green-color);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;

    &.more {
      background-color: var(--border-color);
      color: var(--header-text-color);
    }
  }
}

.select-icon {
  font-size: 0.75rem;
  color: var(--normal-text-color);
  transition: transform 0.2s ease;
}

.multi-select-trigger[data-state='open'] .select-icon {
  transform: rotate(180deg);
}

.ui-multi-select--compact {
  .multi-select-trigger {
    height: 32px;
    padding: 0 0.75rem;
    font-size: 0.8125rem;
  }
}
</style>

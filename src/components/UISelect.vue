<template>
  <div class="ui-select" :class="{ 'ui-select--compact': compact }">
    <SelectRoot v-model="internalValue" :disabled="disabled" :required="required">
      <SelectTrigger class="select-trigger" :aria-label="label">
        <SelectValue :placeholder="placeholder" />
        <SelectIcon class="select-icon">
          <font-awesome-icon icon="fas fa-chevron-down" />
        </SelectIcon>
      </SelectTrigger>

      <SelectPortal>
        <SelectContent 
          class="select-content" 
          position="popper" 
          :side-offset="5"
          :collision-padding="20"
        >
          <!-- Search Input -->
          <div v-if="searchable" class="select-search-wrap">
            <font-awesome-icon icon="fas fa-search" class="search-icon" />
            <input 
              v-model="searchTerm" 
              class="select-search-input" 
              :placeholder="searchPlaceholder"
              @keydown.stop
            />
          </div>

          <SelectScrollUpButton class="scroll-button">
            <font-awesome-icon icon="fas fa-chevron-up" />
          </SelectScrollUpButton>

          <SelectViewport class="select-viewport">
            <SelectGroup>
              <SelectItem
                v-for="option in filteredOptions"
                :key="getOptionValue(option)"
                :value="getOptionValue(option).toString()"
                class="select-item"
              >
                <SelectItemText>{{ getOptionLabel(option) }}</SelectItemText>
                <SelectItemIndicator class="item-indicator">
                  <font-awesome-icon icon="fas fa-check" />
                </SelectItemIndicator>
              </SelectItem>
              
              <div v-if="filteredOptions.length === 0" class="select-no-results">
                No results found
              </div>
            </SelectGroup>
          </SelectViewport>

          <SelectScrollDownButton class="scroll-button">
            <font-awesome-icon icon="fas fa-chevron-down" />
          </SelectScrollDownButton>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectGroup,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from 'radix-vue'

interface Option {
  label: string
  value: string | number
}

const props = defineProps<{
  modelValue: string | number | undefined
  options: (Option | string | number)[]
  placeholder?: string
  label?: string
  disabled?: boolean
  required?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  compact?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const searchTerm = ref('')

// Reset search when dropdown closes or value changes
watch(() => props.modelValue, () => {
  searchTerm.value = ''
})

const internalValue = computed({
  get: () => props.modelValue?.toString(),
  set: (val) => {
    const originalOption = props.options.find(opt => getOptionValue(opt).toString() === val)
    const originalValue = originalOption ? getOptionValue(originalOption) : val
    emit('update:modelValue', originalValue)
  }
})

const getOptionValue = (option: Option | string | number) => {
  return typeof option === 'object' ? (option as Option).value : (option as string | number)
}

const getOptionLabel = (option: Option | string | number) => {
  return typeof option === 'object' ? (option as Option).label : (option as string | number)
}

const filteredOptions = computed(() => {
  if (!searchTerm.value) return props.options
  const term = searchTerm.value.toLowerCase()
  return props.options.filter(option => {
    const label = getOptionLabel(option).toString().toLowerCase()
    return label.includes(term)
  })
})
</script>

<style lang="scss">
.select-content {
  overflow: hidden;
  background-color: var(--background-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 38px -10px rgba(0, 0, 0, 0.2), 0 10px 20px -15px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: var(--radix-select-trigger-width);
  max-height: 300px;
  backdrop-filter: blur(8px);
  background: var(--background-color);
}

.select-search-wrap {
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--background-color-soft);

  .search-icon {
    font-size: 0.75rem;
    color: var(--normal-text-color);
    opacity: 0.5;
  }

  .select-search-input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    font-size: 0.8125rem;
    color: var(--header-text-color);
    font-family: var(--main-font);

    &::placeholder {
      color: var(--normal-text-color);
      opacity: 0.5;
    }
  }
}

.select-viewport {
  padding: 5px;
}

.select-item {
  font-size: 0.8125rem;
  line-height: 1;
  color: var(--header-text-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 35px 0 25px;
  position: relative;
  user-select: none;
  cursor: pointer;
  font-family: var(--main-font);

  &[data-disabled] {
    color: var(--normal-text-color);
    pointer-events: none;
    opacity: 0.5;
  }

  &[data-highlighted] {
    outline: none;
    background-color: var(--background-color-soft);
    color: var(--primary-green-color);
  }
}

.select-no-results {
  padding: 10px;
  font-size: 0.75rem;
  color: var(--normal-text-color);
  text-align: center;
}

.item-indicator {
  position: absolute;
  left: 0;
  width: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-green-color);
  font-size: 0.75rem;
}

.scroll-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  background-color: var(--background-color);
  color: var(--normal-text-color);
  cursor: default;
}
</style>

<style scoped lang="scss">
.ui-select {
  width: 100%;

  &--compact {
    .select-trigger {
      height: 32px;
      padding: 0 0.75rem;
      font-size: 0.8125rem;
      border-radius: 8px;
    }
  }
}

.select-trigger {
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
  min-width: 70px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--main-font);

  &:hover:not(:disabled) {
    border-color: var(--primary-green-color);
    background-color: var(--background-color-soft);
  }

  &:focus {
    outline: none;
    border-color: var(--primary-green-color);
    box-shadow: 0 0 0 2px rgba(92, 184, 92, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background-color: var(--background-color-soft);
  }
}

.select-icon {
  font-size: 0.75rem;
  color: var(--normal-text-color);
  transition: transform 0.2s ease;
}

.select-trigger[data-state='open'] .select-icon {
  transform: rotate(180deg);
}
</style>


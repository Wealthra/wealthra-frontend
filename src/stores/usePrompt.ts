import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface PromptOptions {
  title: string
  message: string
  placeholder?: string
  initialValue?: string
  confirmText?: string
  cancelText?: string
  inputType?: string
}

export const usePrompt = defineStore('prompt', () => {
  const isOpen = ref(false)
  const inputValue = ref('')
  const options = ref<PromptOptions>({
    title: '',
    message: '',
    placeholder: '',
    initialValue: '',
    confirmText: 'Submit',
    cancelText: 'Cancel',
    inputType: 'text'
  })

  let resolveCallback: (value: string | null) => void

  const ask = (opts: Partial<PromptOptions> | string): Promise<string | null> => {
    if (typeof opts === 'string') {
      options.value = {
        title: 'Input Required',
        message: opts,
        placeholder: '',
        initialValue: '',
        confirmText: 'Submit',
        cancelText: 'Cancel',
        inputType: 'text'
      }
    } else {
      options.value = {
        title: opts.title || 'Input Required',
        message: opts.message || '',
        placeholder: opts.placeholder || '',
        initialValue: opts.initialValue || '',
        confirmText: opts.confirmText || 'Submit',
        cancelText: opts.cancelText || 'Cancel',
        inputType: opts.inputType || 'text'
      }
    }

    inputValue.value = options.value.initialValue || ''
    isOpen.value = true
    return new Promise((resolve) => {
      resolveCallback = resolve
    })
  }

  const submit = () => {
    isOpen.value = false
    resolveCallback(inputValue.value)
  }

  const cancel = () => {
    isOpen.value = false
    resolveCallback(null)
  }

  return {
    isOpen,
    inputValue,
    options,
    ask,
    submit,
    cancel
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'primary' | 'warning'
}

export const useConfirm = defineStore('confirm', () => {
  const isOpen = ref(false)
  const options = ref<ConfirmOptions>({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'primary'
  })

  let resolveCallback: (value: boolean) => void

  const ask = (opts: Partial<ConfirmOptions> | string): Promise<boolean> => {
    if (typeof opts === 'string') {
      options.value = {
        title: 'Confirm',
        message: opts,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'primary'
      }
    } else {
      options.value = {
        title: opts.title || 'Confirm',
        message: opts.message || '',
        confirmText: opts.confirmText || 'Confirm',
        cancelText: opts.cancelText || 'Cancel',
        type: opts.type || 'primary'
      }
    }

    isOpen.value = true
    return new Promise((resolve) => {
      resolveCallback = resolve
    })
  }

  const confirm = () => {
    isOpen.value = false
    resolveCallback(true)
  }

  const cancel = () => {
    isOpen.value = false
    resolveCallback(false)
  }

  return {
    isOpen,
    options,
    ask,
    confirm,
    cancel
  }
})

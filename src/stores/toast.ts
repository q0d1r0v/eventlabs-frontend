import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ToastMessage, ToastTone } from '@/types'

let counter = 0

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastMessage[]>([])

  const dismiss = (id: string) => {
    items.value = items.value.filter((t) => t.id !== id)
  }

  const push = (
    tone: ToastTone,
    message: string,
    options: { title?: string; duration?: number } = {},
  ) => {
    const id = `toast-${++counter}`
    const duration = options.duration ?? 4000
    const toast: ToastMessage = {
      id,
      tone,
      message,
      title: options.title,
      duration,
    }
    items.value.push(toast)
    if (duration > 0) {
      window.setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  return {
    items,
    push,
    dismiss,
    success: (message: string, opts?: { title?: string; duration?: number }) =>
      push('success', message, opts),
    error: (message: string, opts?: { title?: string; duration?: number }) =>
      push('error', message, opts),
    info: (message: string, opts?: { title?: string; duration?: number }) =>
      push('info', message, opts),
    warning: (message: string, opts?: { title?: string; duration?: number }) =>
      push('warning', message, opts),
  }
})

import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void
}

export const useConfirmStore = defineStore('confirm', () => {
  const pending = ref<PendingConfirm | null>(null)

  const ask = (options: ConfirmOptions): Promise<boolean> => {
    // Agar avvalgi confirm dialogi ochiq bo'lsa, uni rad etamiz
    if (pending.value) {
      pending.value.resolve(false)
    }
    return new Promise<boolean>((resolve) => {
      pending.value = { ...options, resolve }
    })
  }

  const accept = () => {
    pending.value?.resolve(true)
    pending.value = null
  }

  const decline = () => {
    pending.value?.resolve(false)
    pending.value = null
  }

  return { pending, ask, accept, decline }
})

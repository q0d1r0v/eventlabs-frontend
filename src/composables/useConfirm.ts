import { useConfirmStore, type ConfirmOptions } from '@/stores/confirm'

/**
 * Native `confirm()` o'rniga go'zal modal dialog. Promise<boolean> qaytaradi:
 * - true → tasdiqlandi
 * - false → bekor qilindi yoki Esc bosildi
 */
export function useConfirm() {
  const store = useConfirmStore()
  return (options: ConfirmOptions) => store.ask(options)
}

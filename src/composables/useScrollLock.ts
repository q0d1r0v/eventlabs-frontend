import { onBeforeUnmount, watch, type Ref } from 'vue'

export function useScrollLock(active: Ref<boolean>) {
  const apply = (locked: boolean) => {
    document.body.style.overflow = locked ? 'hidden' : ''
  }

  watch(active, apply, { immediate: true })

  onBeforeUnmount(() => apply(false))
}

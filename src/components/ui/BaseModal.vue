<script setup lang="ts">
import { ref, watch } from 'vue'
import { useScrollLock } from '@/composables/useScrollLock'
import IconBase from './IconBase.vue'

const props = defineProps<{
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
  close: []
}>()

const isOpen = ref(props.open)

watch(
  () => props.open,
  (val) => {
    isOpen.value = val
  },
)

useScrollLock(isOpen)

const onBackdrop = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <transition name="modal">
    <div
      v-if="open"
      class="modal"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      tabindex="-1"
      @click="onBackdrop"
      @keydown="onKey"
    >
      <div class="modal__panel" :class="`modal__panel--${size ?? 'md'}`">
        <header v-if="title || $slots.header" class="modal__head">
          <h2 v-if="title" class="modal__title">{{ title }}</h2>
          <slot name="header" />
          <button
            type="button"
            class="modal__close"
            aria-label="Yopish"
            @click="emit('close')"
          >
            <IconBase :size="16">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </IconBase>
          </button>
        </header>

        <div class="modal__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="modal__foot">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(13, 13, 13, 0.4);
  backdrop-filter: blur(4px);
}

.modal__panel {
  width: 100%;
  background: var(--color-bg);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  max-height: calc(100svh - 32px);
}

.modal__panel--sm {
  max-width: 420px;
}

.modal__panel--md {
  max-width: 640px;
}

.modal__panel--lg {
  max-width: 880px;
}

@media (max-width: 640px) {
  .modal {
    padding: 0;
    align-items: flex-end;
  }
  .modal__panel {
    max-width: 100%;
    max-height: 92svh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }
  .modal__head {
    padding: 16px 20px;
  }
  .modal__body {
    padding: 16px 20px;
  }
  .modal__foot {
    padding: 12px 20px;
    flex-wrap: wrap;
  }
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.modal__title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-text);
}

.modal__close {
  background: transparent;
  border: 0;
  padding: 6px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
}

.modal__close:hover {
  color: var(--color-text);
  background: var(--color-bg-muted);
}

.modal__body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal__foot {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s var(--ease-out-soft);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal__panel,
.modal-leave-active .modal__panel {
  transition: transform 0.25s var(--ease-out-soft);
}

.modal-enter-from .modal__panel,
.modal-leave-to .modal__panel {
  transform: translateY(8px) scale(0.98);
}
</style>

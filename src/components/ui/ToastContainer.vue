<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import IconBase from './IconBase.vue'

const toast = useToastStore()
</script>

<template>
  <div class="toasts" role="region" aria-label="Bildirishnomalar">
    <transition-group name="toast">
      <div
        v-for="t in toast.items"
        :key="t.id"
        class="toast"
        :class="`toast--${t.tone}`"
        role="status"
      >
        <span class="toast__icon" aria-hidden="true">
          <IconBase :size="16">
            <polyline v-if="t.tone === 'success'" points="5 12 10 17 19 8" />
            <template v-else-if="t.tone === 'error'">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </template>
            <template v-else-if="t.tone === 'warning'">
              <path d="M12 2L2 22h20z" />
              <line x1="12" y1="10" x2="12" y2="14" />
              <line x1="12" y1="18" x2="12" y2="18" />
            </template>
            <template v-else>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="13" />
              <line x1="12" y1="16" x2="12" y2="16" />
            </template>
          </IconBase>
        </span>
        <div class="toast__body">
          <strong v-if="t.title" class="toast__title">{{ t.title }}</strong>
          <p class="toast__msg">{{ t.message }}</p>
        </div>
        <button
          type="button"
          class="toast__close"
          aria-label="Yopish"
          @click="toast.dismiss(t.id)"
        >
          <IconBase :size="14">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </IconBase>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: calc(100vw - 48px);
  width: 360px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  background: var(--color-bg);
  border: 1px solid var(--color-border-medium);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.toast__icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.toast--success .toast__icon {
  background: var(--color-brand-light);
  color: var(--color-brand-deep);
}

.toast--error .toast__icon {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.toast--warning .toast__icon {
  background: var(--color-warn-bg);
  color: var(--color-warn);
}

.toast--info .toast__icon {
  background: var(--color-info-bg);
  color: var(--color-info);
}

.toast__body {
  flex: 1;
  min-width: 0;
}

.toast__title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 2px;
}

.toast__msg {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.45;
  word-break: break-word;
}

.toast__close {
  background: transparent;
  border: 0;
  padding: 4px;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.toast__close:hover {
  color: var(--color-text);
  background: var(--color-bg-muted);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s var(--ease-out-soft),
    transform 0.25s var(--ease-out-soft);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>

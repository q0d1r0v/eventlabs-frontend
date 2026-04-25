<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { ButtonSize, ButtonVariant } from '@/types'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    href?: string
    to?: RouteLocationRaw
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    fullWidth?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
  },
)

const tag = computed(() => {
  if (props.to) return 'router-link'
  if (props.href) return 'a'
  return 'button'
})

const classes = computed(() => [
  'btn',
  `btn--${props.variant}`,
  `btn--${props.size}`,
  props.fullWidth && 'btn--full',
])
</script>

<template>
  <component
    :is="tag"
    :to="to"
    :href="href"
    :type="tag === 'button' ? type : undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    :aria-disabled="disabled || undefined"
    class="btn"
    :class="classes"
  >
    <slot name="leading" />
    <span class="btn__label"><slot /></span>
    <slot name="trailing" />
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-sans);
  font-weight: 500;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition:
    opacity 0.2s var(--ease-out-soft),
    transform 0.2s var(--ease-out-soft),
    background 0.2s var(--ease-out-soft),
    border-color 0.2s var(--ease-out-soft),
    color 0.2s var(--ease-out-soft);
  user-select: none;
}

.btn:hover {
  opacity: 0.9;
}

.btn:active {
  transform: translateY(0.5px);
}

.btn:disabled,
.btn[aria-disabled='true'] {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

.btn--full {
  width: 100%;
}

.btn--sm {
  font-size: 14px;
  padding: 5px 14px;
}

.btn--md {
  font-size: 15px;
  padding: 8px 24px;
}

.btn--lg {
  font-size: 16px;
  padding: 12px 28px;
}

.btn--primary {
  background: var(--color-text);
  color: #ffffff;
  box-shadow: var(--shadow-button);
}

.btn--secondary {
  background: var(--color-bg);
  color: var(--color-text);
  border-color: var(--color-border-medium);
}

.btn--secondary:hover {
  border-color: var(--color-border-strong);
  opacity: 1;
}

.btn--ghost {
  background: transparent;
  color: var(--color-text);
  border-radius: var(--radius-md);
  padding: 5px 10px;
}

.btn--ghost:hover {
  background: var(--color-bg-muted);
  opacity: 1;
}

.btn--accent {
  background: var(--color-brand);
  color: var(--color-text);
}

.btn--accent:hover {
  background: var(--color-brand-deep);
  color: #ffffff;
  opacity: 1;
}

.btn--danger {
  background: var(--color-error);
  color: #ffffff;
  box-shadow: var(--shadow-button);
}

.btn--danger:hover {
  background: #b94545;
  opacity: 1;
}

.btn__label {
  display: inline-flex;
  align-items: center;
}
</style>

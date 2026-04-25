<script setup lang="ts">
import type { BadgeTone } from '@/types'

withDefaults(
  defineProps<{
    tone?: BadgeTone
    mono?: boolean
  }>(),
  {
    tone: 'brand',
    mono: false,
  },
)
</script>

<template>
  <span class="badge" :class="[`badge--${tone}`, mono && 'badge--mono']">
    <slot name="leading" />
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.2px;
  white-space: nowrap;
}

.badge--mono {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.badge--brand {
  background: var(--color-brand-light);
  color: var(--color-brand-deep);
}

.badge--info {
  background: var(--color-info-bg);
  color: var(--color-info);
}

.badge--warn {
  background: var(--color-warn-bg);
  color: var(--color-warn);
}

.badge--error {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.badge--neutral {
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
}
</style>

<script setup lang="ts">
withDefaults(
  defineProps<{
    align?: 'left' | 'center' | 'right'
    mono?: boolean
  }>(),
  {
    align: 'left',
    mono: true,
  },
)
</script>

<template>
  <span
    class="section-label"
    :class="[`section-label--${align}`, mono && 'section-label--mono']"
  >
    <slot />
  </span>
</template>

<style scoped>
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.section-label--mono {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
}

.section-label:not(.section-label--mono) {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.65px;
}

.section-label--center {
  justify-self: center;
}

.section-label--right {
  justify-self: end;
}

.section-label::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-brand);
}
</style>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'standard' | 'featured' | 'logo'
    interactive?: boolean
    as?: keyof HTMLElementTagNameMap
  }>(),
  {
    variant: 'standard',
    interactive: false,
  },
)
</script>

<template>
  <component
    :is="as ?? 'div'"
    class="card"
    :class="[`card--${variant}`, interactive && 'card--interactive']"
  >
    <slot />
  </component>
</template>

<style scoped>
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-card);
  transition:
    border-color 0.2s var(--ease-out-soft),
    transform 0.2s var(--ease-out-soft),
    box-shadow 0.2s var(--ease-out-soft);
}

.card--standard {
  border-radius: var(--radius-lg);
  padding: 24px;
}

.card--featured {
  border-radius: var(--radius-xl);
  padding: 32px;
}

.card--logo {
  background: var(--color-bg-subtle);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card--interactive {
  cursor: pointer;
}

.card--interactive:hover {
  border-color: var(--color-border-medium);
  box-shadow: var(--shadow-elevated);
  transform: translateY(-1px);
}
</style>

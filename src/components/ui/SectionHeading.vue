<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    align?: 'left' | 'center'
    as?: 'h1' | 'h2' | 'h3'
  }>(),
  {
    align: 'center',
    as: 'h2',
  },
)
</script>

<template>
  <header class="heading" :class="`heading--${align}`">
    <span v-if="eyebrow" class="heading__eyebrow">{{ eyebrow }}</span>
    <component :is="as" class="heading__title">{{ title }}</component>
    <p v-if="description" class="heading__desc">{{ description }}</p>
    <slot />
  </header>
</template>

<style scoped>
.heading {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
}

.heading--center {
  align-items: center;
  text-align: center;
  margin-inline: auto;
}

.heading--left {
  align-items: flex-start;
  text-align: left;
}

.heading__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
}

.heading__eyebrow::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-brand);
}

.heading__title {
  font-size: clamp(28px, 4.5vw, 40px);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.8px;
  color: var(--color-text);
}

.heading__desc {
  font-size: 18px;
  line-height: 1.5;
  color: var(--color-text-muted);
  max-width: 640px;
}
</style>

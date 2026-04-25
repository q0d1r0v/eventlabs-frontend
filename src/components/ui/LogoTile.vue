<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <div class="logo-tile" :title="name">
    <div class="logo-tile__inner">
      <slot />
      <span v-if="!$slots.default" class="logo-tile__text">{{ name }}</span>
    </div>
  </div>
</template>

<style scoped>
.logo-tile {
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  transition:
    border-color 0.2s var(--ease-out-soft),
    transform 0.2s var(--ease-out-soft);
}

.logo-tile:hover {
  border-color: var(--color-border-medium);
  transform: translateY(-1px);
}

.logo-tile__inner {
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 16px;
  letter-spacing: -0.2px;
}

.logo-tile__text {
  display: inline-block;
}
</style>

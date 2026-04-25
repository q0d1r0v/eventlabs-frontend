<script setup lang="ts">
defineProps<{
  value: string
  label: string
  description?: string
}>()
</script>

<template>
  <div class="stat">
    <div class="stat__value">{{ value }}</div>
    <div class="stat__label">{{ label }}</div>
    <p v-if="description" class="stat__desc">{{ description }}</p>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat__value {
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -1px;
  color: var(--color-text);
}

.stat__label {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-brand-deep);
  margin-top: 8px;
}

.stat__desc {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-muted);
  margin-top: 4px;
}
</style>

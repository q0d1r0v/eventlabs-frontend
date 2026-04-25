<script setup lang="ts">
import BaseCard from './BaseCard.vue'

defineProps<{
  title: string
  description: string
  variant?: 'standard' | 'featured'
}>()
</script>

<template>
  <BaseCard :variant="variant ?? 'standard'" interactive class="feature">
    <div v-if="$slots.icon" class="feature__icon">
      <slot name="icon" />
    </div>
    <h3 class="feature__title">{{ title }}</h3>
    <p class="feature__desc">{{ description }}</p>
    <div v-if="$slots.footer" class="feature__footer">
      <slot name="footer" />
    </div>
  </BaseCard>
</template>

<style scoped>
.feature {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.feature__icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-brand-light);
  color: var(--color-brand-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.feature__title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.2px;
  color: var(--color-text);
}

.feature__desc {
  font-size: 15px;
  line-height: 1.5;
  color: var(--color-text-muted);
}

.feature__footer {
  margin-top: auto;
  padding-top: 16px;
}
</style>

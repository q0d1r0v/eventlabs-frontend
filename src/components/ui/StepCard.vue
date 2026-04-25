<script setup lang="ts">
defineProps<{
  step: number | string
  title: string
  description: string
}>()
</script>

<template>
  <div class="step">
    <div class="step__num" aria-hidden="true">
      <span>{{ step }}</span>
    </div>
    <div class="step__body">
      <h3 class="step__title">{{ title }}</h3>
      <p class="step__desc">{{ description }}</p>
    </div>
  </div>
</template>

<style scoped>
.step {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.step__num {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--color-text);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.6px;
}

.step__title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-text);
  margin-bottom: 6px;
}

.step__desc {
  font-size: 15px;
  line-height: 1.55;
  color: var(--color-text-muted);
}
</style>

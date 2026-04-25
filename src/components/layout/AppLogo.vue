<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    showText?: boolean
    tone?: 'dark' | 'light'
  }>(),
  {
    size: 28,
    showText: true,
    tone: 'dark',
  },
)
</script>

<template>
  <span class="logo" :class="`logo--${tone}`">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="14" :fill="tone === 'light' ? '#ffffff' : '#0d0d0d'" />
      <path
        d="M20 16h26v8H28v6h16v8H28v6h18v8H20V16z"
        :fill="tone === 'light' ? '#0d0d0d' : '#18E299'"
      />
    </svg>
    <span v-if="showText" class="logo__text">EventLab</span>
  </span>
</template>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-sans);
}

.logo__text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.4px;
  color: var(--color-text);
}

.logo--light .logo__text {
  color: #ffffff;
}
</style>

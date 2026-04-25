<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number | string
    stroke?: number
  }>(),
  {
    size: 20,
    stroke: 1.75,
  },
)
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke-width="stroke"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <slot />
  </svg>
</template>

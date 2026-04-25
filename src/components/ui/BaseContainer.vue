<script setup lang="ts">
defineProps<{
  as?: keyof HTMLElementTagNameMap
}>()
</script>

<template>
  <component :is="as ?? 'div'" class="container-base">
    <slot />
  </component>
</template>

<style scoped>
.container-base {
  width: 100%;
  max-width: var(--container-content);
  margin-inline: auto;
  padding-inline: 24px;
}

@media (min-width: 1024px) {
  .container-base {
    padding-inline: 32px;
  }
}
</style>

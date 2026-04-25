<script setup lang="ts">
import BaseContainer from './BaseContainer.vue'

withDefaults(
  defineProps<{
    id?: string
    bordered?: boolean
    contained?: boolean
    tone?: 'default' | 'subtle' | 'dark'
  }>(),
  {
    bordered: true,
    contained: true,
    tone: 'default',
  },
)
</script>

<template>
  <section
    :id="id"
    class="base-section"
    :class="[
      bordered && 'base-section--bordered',
      tone === 'subtle' && 'base-section--subtle',
      tone === 'dark' && 'base-section--dark',
    ]"
  >
    <BaseContainer v-if="contained">
      <slot />
    </BaseContainer>
    <slot v-else />
  </section>
</template>

<style scoped>
.base-section {
  padding-block: 64px;
}

@media (min-width: 1024px) {
  .base-section {
    padding-block: 96px;
  }
}

.base-section--bordered {
  border-top: 1px solid var(--color-border-subtle);
}

.base-section--subtle {
  background: var(--color-bg-subtle);
}

.base-section--dark {
  background: var(--color-text);
  color: #ededed;
}
</style>

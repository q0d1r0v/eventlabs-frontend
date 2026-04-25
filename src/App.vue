<script setup lang="ts">
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="app">
    <AppNavbar />
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
    <AppFooter />
  </div>
</template>

<style>
.app {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

.app > main {
  flex: 1;
}
</style>

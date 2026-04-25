<script setup lang="ts">
import AppLogo from './AppLogo.vue'
</script>

<template>
  <div class="auth-layout">
    <header class="auth-layout__head">
      <router-link to="/" aria-label="EventLab — bosh sahifa">
        <AppLogo />
      </router-link>
    </header>

    <main class="auth-layout__main">
      <slot />
    </main>

    <footer class="auth-layout__foot">
      © {{ new Date().getFullYear() }} EventLab — Toshkent, O'zbekiston
    </footer>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(
      ellipse 70% 50% at 50% 0%,
      rgba(24, 226, 153, 0.14) 0%,
      rgba(255, 255, 255, 0) 70%
    ),
    var(--color-bg);
}

.auth-layout__head {
  padding: 24px 32px;
}

.auth-layout__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-layout__foot {
  padding: 16px 32px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>

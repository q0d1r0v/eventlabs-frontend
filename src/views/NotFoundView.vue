<script setup lang="ts">
import BaseContainer from '@/components/ui/BaseContainer.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <main class="nf">
    <BaseContainer>
      <div class="nf__inner">
        <span class="nf__code">404</span>
        <h1 class="nf__title">Sahifa topilmadi</h1>
        <p class="nf__desc">
          Siz qidirayotgan sahifa mavjud emas yoki o'chirilgan.
        </p>
        <BaseButton variant="primary" size="md" to="/">Bosh sahifaga qaytish</BaseButton>
      </div>
    </BaseContainer>
  </main>
</template>

<style scoped>
.nf {
  min-height: calc(100svh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding-block: 96px;
}

.nf__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  max-width: 480px;
  margin-inline: auto;
}

.nf__code {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.6px;
  color: var(--color-brand-deep);
  text-transform: uppercase;
}

.nf__title {
  font-size: clamp(36px, 5vw, 48px);
  font-weight: 600;
  letter-spacing: -1px;
  color: var(--color-text);
}

.nf__desc {
  font-size: 16px;
  color: var(--color-text-muted);
}
</style>

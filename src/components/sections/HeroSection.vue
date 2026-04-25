<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseContainer from '@/components/ui/BaseContainer.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import IconBase from '@/components/ui/IconBase.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const onPrimary = () => {
  if (auth.isAuthenticated) {
    router.push({ name: 'dashboard' })
  } else {
    router.push({ name: 'register' })
  }
}

const onSecondary = () => {
  router.push({ name: 'conferences' })
}
</script>

<template>
  <section class="hero hero-gradient">
    <BaseContainer>
      <div class="hero__content">
        <BaseBadge tone="brand" mono>
          <span class="hero__pulse" aria-hidden="true" />
          Real-time Q&amp;A · QR-chipta · Sertifikat
        </BaseBadge>

        <h1 class="hero__title">
          Konferensiyani boshlashdan<br />
          <span class="hero__title-accent">sertifikatgacha — bir joyda</span>
        </h1>

        <p class="hero__subtitle">
          Konferensiya yarating, sessiyalar tuzing va ma'ruzachilar tayinlang.
          Qatnashchilar bir bosishda yoziladi va QR-chipta oladi. Tadbir kuni
          jonli savol-javob, materiallar va bildirishnomalar — hammasi
          real vaqtda ishlaydi.
        </p>

        <div class="hero__actions">
          <BaseButton variant="primary" size="lg" @click="onPrimary">
            {{ auth.isAuthenticated ? 'Boshqaruv paneli' : 'Bepul boshlash' }}
            <template #trailing>
              <IconBase :size="16">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </IconBase>
            </template>
          </BaseButton>
          <BaseButton variant="secondary" size="lg" @click="onSecondary">
            Konferensiyalarni ko'rish
          </BaseButton>
        </div>

        <div class="hero__meta">
          <div class="hero__meta-item">
            <IconBase :size="16">
              <polyline points="20 6 9 17 4 12" />
            </IconBase>
            QR-chipta avtomatik PDF
          </div>
          <div class="hero__meta-item">
            <IconBase :size="16">
              <polyline points="20 6 9 17 4 12" />
            </IconBase>
            Sertifikat avtomatik
          </div>
          <div class="hero__meta-item">
            <IconBase :size="16">
              <polyline points="20 6 9 17 4 12" />
            </IconBase>
            Real-time yangilanish
          </div>
        </div>
      </div>

      <div class="hero__preview" aria-hidden="true">
        <div class="hero__preview-card hero__preview-card--lg">
          <div class="hero__preview-head">
            <span class="hero__preview-dot" />
            <span class="hero__preview-dot" />
            <span class="hero__preview-dot" />
          </div>
          <div class="hero__preview-body">
            <div class="hero__preview-row hero__preview-row--big">
              <span>Konferensiya jadvali</span>
              <span class="hero__preview-pill hero__preview-pill--green">JONLI</span>
            </div>
            <div class="hero__preview-row">
              <span>Ochilish ma'ruzasi</span>
              <span class="hero__preview-mono">savol-javob</span>
            </div>
            <div class="hero__preview-row">
              <span>Asosiy sessiya</span>
              <span class="hero__preview-mono">materiallar</span>
            </div>
            <div class="hero__preview-row">
              <span>Yakuniy panel</span>
              <span class="hero__preview-mono">sertifikat</span>
            </div>
          </div>
        </div>

        <div class="hero__preview-card hero__preview-card--sm">
          <div class="hero__preview-stat">
            <span class="hero__preview-stat-label">Real-time Q&amp;A</span>
            <span class="hero__preview-stat-value">●</span>
            <span class="hero__preview-stat-trend">Socket asosida bir zumda</span>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding-block: 96px 64px;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .hero {
    padding-block: 128px 96px;
  }
}

.hero__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 24px;
  max-width: 800px;
  margin-inline: auto;
}

.hero__pulse {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-brand);
  box-shadow: 0 0 0 4px rgba(24, 226, 153, 0.25);
  animation: pulse 1.6s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(24, 226, 153, 0.5);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(24, 226, 153, 0);
  }
}

.hero__title {
  font-size: clamp(40px, 7vw, 64px);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -1.28px;
  color: var(--color-text);
}

.hero__title-accent {
  color: var(--color-brand-deep);
}

.hero__subtitle {
  font-size: clamp(16px, 1.6vw, 18px);
  line-height: 1.5;
  color: var(--color-text-muted);
  max-width: 640px;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.hero__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 8px;
}

.hero__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.hero__meta-item :deep(svg) {
  color: var(--color-brand-deep);
}

.hero__preview {
  position: relative;
  margin-top: 64px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.hero__preview-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  text-align: left;
}

.hero__preview-card--lg {
  flex: 1;
  max-width: 560px;
}

.hero__preview-card--sm {
  display: none;
  width: 220px;
  align-self: flex-start;
  margin-top: 48px;
  padding: 20px;
}

@media (min-width: 768px) {
  .hero__preview-card--sm {
    display: block;
  }
}

.hero__preview-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.hero__preview-dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: var(--color-border-medium);
}

.hero__preview-body {
  padding: 8px;
}

.hero__preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: background 0.2s var(--ease-out-soft);
}

.hero__preview-row + .hero__preview-row {
  border-top: 1px solid var(--color-border-subtle);
}

.hero__preview-row--big {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.hero__preview-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.6px;
}

.hero__preview-pill--green {
  background: var(--color-brand-light);
  color: var(--color-brand-deep);
}

.hero__preview-mono {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.4px;
  color: var(--color-text-muted);
}

.hero__preview-stat-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.hero__preview-stat-value {
  display: block;
  font-size: 36px;
  font-weight: 600;
  letter-spacing: -1px;
  color: var(--color-text);
  margin-top: 6px;
}

.hero__preview-stat-trend {
  display: inline-flex;
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-brand-deep);
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import BaseContainer from '@/components/ui/BaseContainer.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconBase from '@/components/ui/IconBase.vue'

const email = ref('')

const onSubmit = (e: Event) => {
  e.preventDefault()
  if (!email.value) return
  email.value = ''
}
</script>

<template>
  <section class="cta cta-gradient">
    <BaseContainer>
      <div class="cta__inner">
        <span class="cta__eyebrow">
          <span class="cta__pulse" aria-hidden="true" />
          Bugun boshlash uchun bepul
        </span>

        <h2 class="cta__title">
          Konferensiyangizni xotirada qoldiring
        </h2>
        <p class="cta__desc">
          Bir necha daqiqada ro'yxatdan o'ting va birinchi tadbiringizni
          bepul tashkil qiling. Karta talab qilinmaydi.
        </p>

        <form class="cta__form" @submit="onSubmit">
          <input
            v-model="email"
            type="email"
            class="cta__input"
            placeholder="email@example.uz"
            aria-label="Email manzilingiz"
            required
          />
          <BaseButton variant="accent" size="lg" type="submit">
            Bepul kirish
            <template #trailing>
              <IconBase :size="16">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </IconBase>
            </template>
          </BaseButton>
        </form>

        <p class="cta__fine">
          Allaqachon hisobingiz bormi?
          <button type="button" class="cta__link">Kirish</button>
        </p>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.cta {
  padding-block: 96px;
  color: #ffffff;
  text-align: center;
}

.cta__inner {
  max-width: 720px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.cta__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
}

.cta__pulse {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-brand);
  animation: pulse-cta 1.6s ease-in-out infinite;
}

@keyframes pulse-cta {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(24, 226, 153, 0.5);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(24, 226, 153, 0);
  }
}

.cta__title {
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -1.28px;
  color: #ffffff;
}

.cta__desc {
  font-size: 18px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
}

.cta__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 480px;
  margin-top: 16px;
}

.cta__input {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  padding: 14px 24px;
  font-size: 15px;
  color: #ffffff;
  outline: none;
  transition:
    border-color 0.2s var(--ease-out-soft),
    background 0.2s var(--ease-out-soft);
}

.cta__input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.cta__input:focus {
  border-color: var(--color-brand);
  background: rgba(255, 255, 255, 0.12);
}

.cta__fine {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
}

.cta__link {
  background: transparent;
  border: 0;
  padding: 0;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-brand);
  cursor: pointer;
  transition: color 0.2s var(--ease-out-soft);
}

.cta__link:hover {
  color: #ffffff;
  text-decoration: underline;
}

@media (min-width: 640px) {
  .cta__form {
    flex-direction: row;
  }
}
</style>

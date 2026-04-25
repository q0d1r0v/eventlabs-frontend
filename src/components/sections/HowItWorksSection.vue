<script setup lang="ts">
import BaseSection from '@/components/ui/BaseSection.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import StepCard from '@/components/ui/StepCard.vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const steps = [
  {
    step: '01',
    title: 'Konferensiya yarating',
    description:
      "5 daqiqada nom, sana, joy va banner kiriting — sahifa avtomatik tayyor.",
  },
  {
    step: '02',
    title: 'Dastur tuzing',
    description:
      "Sessiyalarni qo'shing, ma'ruzachilarni biriktiring va vaqt jadvalini drag-and-drop bilan tartibga soling.",
  },
  {
    step: '03',
    title: 'Qatnashchilarni chaqiring',
    description:
      'Havolani ulashing — har bir kishi bir bosish bilan yoziladi va QR-chiptasini oladi.',
  },
  {
    step: '04',
    title: 'Jonli boshqaring',
    description:
      "Kun davomida real vaqtda savollarga javob bering, yangiliklar yuboring, statistikani kuzating.",
  },
]
</script>

<template>
  <BaseSection id="how-it-works" tone="subtle" :bordered="false">
    <SectionHeading
      eyebrow="Jarayon"
      title="To'rt qadamda kuchli konferensiya"
      description="Murakkab sozlamalar yo'q. Hisobni ochishdan birinchi qatnashchigacha — bir necha daqiqa."
    />

    <div class="how__layout">
      <ol class="how__list">
        <li v-for="s in steps" :key="s.step">
          <StepCard :step="s.step" :title="s.title" :description="s.description" />
        </li>
      </ol>

      <BaseCard variant="featured" class="how__demo">
        <div class="how__demo-head">
          <span class="how__demo-label">JONLI Q&amp;A</span>
          <span class="how__demo-pulse" aria-hidden="true" />
        </div>
        <div class="how__demo-q">
          <span class="how__demo-author">Qatnashchi</span>
          <p>Konferensiyaga onlayn qatnashish mumkinmi yoki faqat zalda?</p>
          <span class="how__demo-up">▲ Yoqdi</span>
        </div>
        <div class="how__demo-q">
          <span class="how__demo-author">Qatnashchi</span>
          <p>Kechikkanlar uchun ma'ruza yozuvi keyinroq mavjud bo'ladimi?</p>
          <span class="how__demo-up">▲ Yoqdi</span>
        </div>
        <div class="how__demo-q how__demo-q--answered">
          <span class="how__demo-author">Qatnashchi</span>
          <p>Sertifikat qachon va qanday yetkazib beriladi?</p>
          <span class="how__demo-up how__demo-up--answered">Javob berildi</span>
        </div>
      </BaseCard>
    </div>
  </BaseSection>
</template>

<style scoped>
.how__layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin-top: 48px;
  align-items: start;
}

@media (min-width: 1024px) {
  .how__layout {
    grid-template-columns: 1fr 1fr;
    gap: 64px;
  }
}

.how__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.how__demo {
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.how__demo-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.how__demo-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
}

.how__demo-pulse {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-brand);
  animation: heartbeat 1.6s ease-in-out infinite;
}

@keyframes heartbeat {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(24, 226, 153, 0.5);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(24, 226, 153, 0);
  }
}

.how__demo-q {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 16px;
  padding: 16px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
}

.how__demo-q--answered {
  background: var(--color-brand-light);
  border-color: rgba(15, 167, 110, 0.2);
}

.how__demo-author {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  grid-column: 1;
}

.how__demo-q p {
  grid-column: 1 / 2;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.how__demo-up {
  grid-column: 2;
  grid-row: 1 / 3;
  align-self: center;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.how__demo-up--answered {
  color: var(--color-brand-deep);
  font-weight: 600;
}
</style>

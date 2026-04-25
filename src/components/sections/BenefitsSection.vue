<script setup lang="ts">
import { h } from 'vue'
import BaseSection from '@/components/ui/BaseSection.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import IconBase from '@/components/ui/IconBase.vue'

const rows = [
  {
    label: "Qatnashchilar ro'yxati",
    before:
      "Excel jadvalda qo'lda, dublikatlar va xato yozuvlar yig'iladi",
    after:
      "Onlayn forma — har kim noyob ticketCode oladi va PDF chiptasi tushadi",
  },
  {
    label: "Tadbirning yangilanishi",
    before:
      "Qayta-qayta email yuborish, hamma o'qimaydi",
    after:
      "Sana yoki joy o'zgarsa, bekor qilinsa — yozilganlarga real-time bildirishnoma",
  },
  {
    label: "Savol-javob",
    before:
      "Mikrofonda navbat, qog'oz kartochkalar, eng yaxshi savollar yo'qoladi",
    after:
      "Real vaqtli Q&A: yoqtirilganlari yuqorida, javob ham hammaga ko'rinadi",
  },
  {
    label: "Materiallar",
    before:
      "Speaker o'z faylini email orqali yuboradi, qatnashchi keyin so'raydi",
    after:
      "Speaker sessiyaga PDF/PPT/DOC yuklaydi, hamma yuklab olishi mumkin",
  },
  {
    label: "Sertifikat",
    before:
      "Wordda terib, ism qo'yib, har biriga alohida tayyorlanadi",
    after:
      "Konferensiya tugaydi → bir bosishda PDF + QR kod, online tekshirish",
  },
]

const pillars = [
  {
    title: 'Vaqtni tejaydi',
    description:
      "Avtomatlashtirilgan oqim — chipta, materiallar va sertifikat o'zi yetkaziladi.",
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('circle', { cx: '12', cy: '12', r: '10' }),
        h('polyline', { points: '12 6 12 12 16 14' }),
      ]),
  },
  {
    title: 'Xatolik yo\'qoladi',
    description:
      "Validatsiya va statuslar tizimi — eski yoki bekor qilingan tadbirga yozilib bo'lmaydi, dublikat yo'q.",
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
        h('polyline', { points: '22 4 12 14.01 9 11.01' }),
      ]),
  },
  {
    title: 'Aloqa shaffof',
    description:
      "Real vaqtda savol, javob, status o'zgarishi va xabar — sahifani yangilamasdan ham hammasi yetadi.",
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('path', {
          d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
        }),
      ]),
  },
]
</script>

<template>
  <BaseSection id="benefits">
    <SectionHeading
      eyebrow="Nima foyda"
      title="Eski usul va EventLab — yonma-yon ko'ring"
      description="Har bir bosqichda nima o'zgaradi: qog'oz va Excel'dan avtomatik oqimga."
    />

    <div class="compare">
      <div class="compare__head">
        <span class="compare__col-label compare__col-label--label">Bosqich</span>
        <span class="compare__col-label compare__col-label--before">Eski usul</span>
        <span class="compare__col-label compare__col-label--after">EventLab bilan</span>
      </div>

      <div v-for="row in rows" :key="row.label" class="compare__row">
        <div class="compare__cell compare__cell--label">{{ row.label }}</div>
        <div class="compare__cell compare__cell--before">
          <span class="compare__icon compare__icon--bad" aria-hidden="true">
            <IconBase :size="14">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </IconBase>
          </span>
          {{ row.before }}
        </div>
        <div class="compare__cell compare__cell--after">
          <span class="compare__icon compare__icon--good" aria-hidden="true">
            <IconBase :size="14">
              <polyline points="5 12 10 17 19 8" />
            </IconBase>
          </span>
          {{ row.after }}
        </div>
      </div>
    </div>

    <div class="pillars">
      <div v-for="p in pillars" :key="p.title" class="pillar">
        <div class="pillar__icon">
          <component :is="p.icon" />
        </div>
        <h3 class="pillar__title">{{ p.title }}</h3>
        <p class="pillar__desc">{{ p.description }}</p>
      </div>
    </div>
  </BaseSection>
</template>

<style scoped>
.compare {
  margin-top: 48px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--color-bg);
  box-shadow: var(--shadow-card);
}

.compare__head {
  display: none;
  background: var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-border-subtle);
}

.compare__col-label {
  padding: 14px 20px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.compare__col-label--after {
  color: var(--color-brand-deep);
}

.compare__row {
  display: grid;
  grid-template-columns: 1fr;
  border-bottom: 1px solid var(--color-border-subtle);
}

.compare__row:last-child {
  border-bottom: none;
}

.compare__cell {
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-secondary);
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.compare__cell--label {
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-bg-subtle);
}

.compare__cell--before {
  color: var(--color-text-muted);
}

.compare__cell--after {
  color: var(--color-text);
  background: rgba(212, 250, 232, 0.35);
}

.compare__icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

.compare__icon--bad {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.compare__icon--good {
  background: var(--color-brand-light);
  color: var(--color-brand-deep);
}

@media (min-width: 768px) {
  .compare__head {
    display: grid;
    grid-template-columns: 1.2fr 2fr 2fr;
  }

  .compare__row {
    grid-template-columns: 1.2fr 2fr 2fr;
  }

  .compare__cell--label {
    background: transparent;
  }
}

.pillars {
  margin-top: 48px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .pillars {
    grid-template-columns: repeat(3, 1fr);
  }
}

.pillar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
}

.pillar__icon {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--color-text);
  color: var(--color-brand);
}

.pillar__title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-text);
}

.pillar__desc {
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-muted);
}
</style>

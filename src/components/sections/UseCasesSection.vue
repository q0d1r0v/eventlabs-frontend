<script setup lang="ts">
import { h } from 'vue'
import BaseSection from '@/components/ui/BaseSection.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import IconBase from '@/components/ui/IconBase.vue'

const cases = [
  {
    title: 'Akademik konferensiyalar',
    description:
      "Ilmiy konferensiya, dissertatsiya himoyasi va akademik seminarlar uchun — ma'ruzachilar, taqdimotlar va sertifikatlar bilan.",
    examples: ['Ilmiy seminar', 'Magistr/PhD himoyasi', 'Xalqaro forum'],
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('path', { d: 'M22 10v6M2 10l10-5 10 5-10 5z' }),
        h('path', { d: 'M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5' }),
      ]),
  },
  {
    title: 'Hackathon va meetuplar',
    description:
      "Tezkor ro'yxat, jonli savol-javob va jamoa tashkili — ko'p qatnashchili tadbirlarda har soniya hisoblanadi.",
    examples: ['Hackathon', "Mutaxassislar uchrashuvi", 'Open meetup'],
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('path', { d: 'M13 2L3 14h7l-1 8 11-14h-7l1-6z' }),
      ]),
  },
  {
    title: 'Korporativ tadbirlar',
    description:
      "Xodimlar uchun ichki uchrashuvlar, treninglar va yillik yig'ilishlar — yopiq guruhlar va kirish nazorati bilan.",
    examples: ["Onboarding", "Mahorat treningi", "Yillik yig'ilish"],
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('path', {
          d: 'M3 21V8a2 2 0 0 1 2-2h4V3h6v3h4a2 2 0 0 1 2 2v13z',
        }),
        h('path', { d: 'M9 21V12h6v9' }),
      ]),
  },
  {
    title: 'Onlayn seminarlar',
    description:
      "Masofadan turib o'tkaziladigan tadbirlar — qatnashchi qayerda bo'lishidan qat'iy nazar bir xil tajriba oladi.",
    examples: ["Ochiq lektsiya", "Yopiq trening", "Mahsulot taqdimoti"],
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('rect', { x: '2', y: '4', width: '20', height: '14', rx: '2' }),
        h('line', { x1: '8', y1: '21', x2: '16', y2: '21' }),
        h('line', { x1: '12', y1: '18', x2: '12', y2: '21' }),
        h('polygon', { points: '10,9 15,12 10,15' }),
      ]),
  },
]
</script>

<template>
  <BaseSection id="use-cases" tone="subtle" :bordered="false">
    <SectionHeading
      eyebrow="Kim uchun"
      title="Har qanday tadbir uchun mo'ljallangan"
      description="Bir kishilik seminar bo'lsin yoki ming kishilik forum — EventLab moslashuvchan."
    />

    <div class="cases__grid">
      <BaseCard
        v-for="c in cases"
        :key="c.title"
        variant="standard"
        interactive
        class="case"
      >
        <div class="case__icon">
          <component :is="c.icon" />
        </div>
        <h3 class="case__title">{{ c.title }}</h3>
        <p class="case__desc">{{ c.description }}</p>
        <ul class="case__list">
          <li v-for="ex in c.examples" :key="ex">{{ ex }}</li>
        </ul>
      </BaseCard>
    </div>
  </BaseSection>
</template>

<style scoped>
.cases__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 48px;
}

@media (min-width: 640px) {
  .cases__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .cases__grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.case {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.case__icon {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--color-brand-light);
  color: var(--color-brand-deep);
  margin-bottom: 4px;
}

.case__title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-text);
}

.case__desc {
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-text-muted);
}

.case__list {
  list-style: none;
  margin: 12px 0 0;
  padding: 12px 0 0;
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.case__list li {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.case__list li::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: var(--color-brand);
}
</style>

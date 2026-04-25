<script setup lang="ts">
import BaseSection from '@/components/ui/BaseSection.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import FeatureCard from '@/components/ui/FeatureCard.vue'
import IconBase from '@/components/ui/IconBase.vue'
import { h } from 'vue'

const features = [
  {
    title: 'Real vaqtli Q&A',
    description:
      "Ma'ruza vaqtida qatnashchilar savol berishadi, boshqalar yoqtirgan savollarni yuqoriga ko'taradi — barcha o'zgarishlar bir zumda ko'rinadi.",
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('path', {
          d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
        }),
      ]),
  },
  {
    title: "Dasturni drag-and-drop",
    description:
      "Sessiyalarni vaqt jadvaliga sudrab tashlang. Ma'ruzachilar to'qnashuvi avtomatik aniqlanadi.",
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2' }),
        h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
        h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
        h('line', { x1: '3', y1: '10', x2: '21', y2: '10' }),
      ]),
  },
  {
    title: 'QR-chiptalar',
    description:
      "Har bir qatnashchi unikal QR-kod oladi — registratsiya tezligi 6 marta oshadi, dublikatlar yo'qoladi.",
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }),
        h('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }),
        h('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }),
        h('path', { d: 'M14 14h3v3h-3zM18 18h3v3h-3z' }),
      ]),
  },
  {
    title: 'Avtomatik sertifikat',
    description:
      'Konferensiya tugagach har bir qatnashchiga noyob kod va QR bilan PDF sertifikat yuboriladi.',
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('path', {
          d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
        }),
        h('polyline', { points: '14 2 14 8 20 8' }),
        h('circle', { cx: '12', cy: '14', r: '3' }),
      ]),
  },
  {
    title: 'Live bildirishnomalar',
    description:
      'Dastur o\'zgarganda yoki xabar kelganda barcha qatnashchilar darhol push-orqali xabardor bo\'ladi.',
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('path', { d: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9' }),
        h('path', { d: 'M13.7 21a2 2 0 0 1-3.4 0' }),
      ]),
  },
  {
    title: 'Tahlil va hisobot',
    description:
      "Qatnashchilar dinamikasi, savol-javob faolligi, sessiya bahosi — bir dashboardda jamlangan.",
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('line', { x1: '12', y1: '20', x2: '12', y2: '10' }),
        h('line', { x1: '18', y1: '20', x2: '18', y2: '4' }),
        h('line', { x1: '6', y1: '20', x2: '6', y2: '16' }),
      ]),
  },
]
</script>

<template>
  <BaseSection id="features">
    <SectionHeading
      eyebrow="Imkoniyatlar"
      title="Konferensiyangiz uchun zarur barcha narsa"
      description="Ro'yxatga olishdan boshlab sertifikat berishgacha — bitta interfeysda. Excel jadvallar va alohida vositalardan voz keching."
    />

    <div class="features__grid">
      <FeatureCard
        v-for="f in features"
        :key="f.title"
        :title="f.title"
        :description="f.description"
      >
        <template #icon>
          <component :is="f.icon" />
        </template>
      </FeatureCard>
    </div>
  </BaseSection>
</template>

<style scoped>
.features__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 48px;
}

@media (min-width: 640px) {
  .features__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .features__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

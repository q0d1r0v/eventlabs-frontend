<script setup lang="ts">
import BaseSection from '@/components/ui/BaseSection.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import FeatureCard from '@/components/ui/FeatureCard.vue'
import IconBase from '@/components/ui/IconBase.vue'
import { h } from 'vue'

const features = [
  {
    title: 'Konferensiya va sessiyalar',
    description:
      "Banner rasm bilan ko'rinarli sahifa, sessiyalar jadvali va har biriga ma'ruzachi tayinlash — hammasi bir formada.",
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2' }),
        h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
        h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
        h('line', { x1: '3', y1: '10', x2: '21', y2: '10' }),
      ]),
  },
  {
    title: 'Real vaqtli savol-javob',
    description:
      "Sessiya vaqtida qatnashchilar savol berishadi, boshqalar yoqtiradi — yuqoridagilari avtomatik tepaga chiqadi. Ma'ruzachi javob bersa hammaga ko'rinadi.",
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('path', {
          d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
        }),
      ]),
  },
  {
    title: 'QR-chipta PDF formatda',
    description:
      "Yozilgach foydalanuvchi avtomatik chipta oladi: noyob kod, QR rasm va A5 dizayn — eshikda darhol skanlanadi.",
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }),
        h('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }),
        h('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }),
        h('path', { d: 'M14 14h3v3h-3zM18 18h3v3h-3z' }),
      ]),
  },
  {
    title: 'Materiallar va taqdimotlar',
    description:
      "Ma'ruzachi PDF, PPT, DOC, ZIP yoki rasm fayllarini sessiyaga yuklaydi. Qatnashchilar bir joydan yuklab oladi.",
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('path', {
          d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
        }),
        h('polyline', { points: '14 2 14 8 20 8' }),
      ]),
  },
  {
    title: 'Real-time bildirishnomalar',
    description:
      "Konferensiya bekor qilindi, sana o'zgardi yoki savolingizga javob berildi — sahifani yangilamasdan darhol bilasiz.",
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('path', { d: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9' }),
        h('path', { d: 'M13.7 21a2 2 0 0 1-3.4 0' }),
      ]),
  },
  {
    title: 'Sertifikat avtomatik',
    description:
      "Konferensiya tugagach qatnashganlar bir bosish bilan PDF sertifikat oladi. Noyob kod va QR — onlayn tekshiriladi.",
    icon: () =>
      h(IconBase, { size: 22 }, () => [
        h('circle', { cx: '12', cy: '8', r: '6' }),
        h('path', { d: 'M15.5 12.5L17 22l-5-3-5 3 1.5-9.5' }),
      ]),
  },
]
</script>

<template>
  <BaseSection id="features">
    <SectionHeading
      eyebrow="Imkoniyatlar"
      title="Konferensiyangiz uchun zarur barcha narsa"
      description="Ro'yxatdan o'tishdan sertifikatgacha — har bosqichi avtomatlashtirilgan, alohida vositalarsiz."
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

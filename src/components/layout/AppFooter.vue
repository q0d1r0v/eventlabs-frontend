<script setup lang="ts">
import BaseContainer from '@/components/ui/BaseContainer.vue'
import AppLogo from './AppLogo.vue'

const currentYear = new Date().getFullYear()

import { useSmoothScroll } from '@/composables/useSmoothScroll'

type FooterLink = { label: string; href?: string }

const { scrollTo } = useSmoothScroll()

const groups: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Mahsulot',
    links: [
      { label: 'Imkoniyatlar', href: '#features' },
      { label: 'Qanday ishlaydi', href: '#how-it-works' },
      { label: 'Foydasi', href: '#benefits' },
      { label: 'Kim uchun', href: '#use-cases' },
    ],
  },
  {
    title: 'Kompaniya',
    links: [
      { label: 'Biz haqimizda' },
      { label: 'Aloqa' },
      { label: 'Hamkorlar' },
    ],
  },
  {
    title: 'Resurslar',
    links: [
      { label: "Yo'riqnoma" },
      { label: 'Maxfiylik siyosati' },
      { label: 'Foydalanish shartlari' },
      { label: "Yordam markazi" },
    ],
  },
]
</script>

<template>
  <footer class="footer">
    <BaseContainer>
      <div class="footer__top">
        <div class="footer__brand">
          <AppLogo />
          <p class="footer__tag">
            Konferensiyalarni rejalashtirish, qatnashchilarni boshqarish va real
            vaqtdagi muloqot uchun zamonaviy platforma.
          </p>
        </div>

        <div class="footer__groups">
          <div v-for="group in groups" :key="group.title" class="footer__group">
            <h4 class="footer__group-title">{{ group.title }}</h4>
            <ul class="footer__list">
              <li v-for="link in group.links" :key="link.label">
                <a
                  v-if="link.href"
                  :href="link.href"
                  class="footer__link"
                  @click="scrollTo"
                >
                  {{ link.label }}
                </a>
                <button v-else type="button" class="footer__link">
                  {{ link.label }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <p class="footer__copy">© {{ currentYear }} EventLab. Barcha huquqlar himoyalangan.</p>
        <p class="footer__made">Toshkent, O'zbekiston bilan sevgi bilan tayyorlangan</p>
      </div>
    </BaseContainer>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--color-border-subtle);
  padding-block: 64px 32px;
  background: var(--color-bg);
}

.footer__top {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  padding-bottom: 48px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.footer__tag {
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-muted);
  max-width: 360px;
}

.footer__groups {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.footer__group-title {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: 16px;
}

.footer__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer__link {
  background: transparent;
  border: 0;
  padding: 0;
  font: inherit;
  text-align: left;
  cursor: pointer;
  display: inline;
  font-size: 14px;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s var(--ease-out-soft);
}

.footer__link:hover {
  color: var(--color-text);
}

.footer__bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 24px;
  font-size: 13px;
  color: var(--color-text-muted);
}

@media (min-width: 768px) {
  .footer__top {
    grid-template-columns: 1.2fr 2fr;
  }

  .footer__groups {
    grid-template-columns: repeat(3, 1fr);
  }

  .footer__bottom {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>

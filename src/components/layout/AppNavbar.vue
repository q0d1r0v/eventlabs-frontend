<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseContainer from '@/components/ui/BaseContainer.vue'
import AppLogo from './AppLogo.vue'
import IconBase from '@/components/ui/IconBase.vue'
import UserMenu from './UserMenu.vue'
import NotificationsBell from './NotificationsBell.vue'
import { useAuthStore } from '@/stores/auth'
import { useScrollLock } from '@/composables/useScrollLock'
import { useSmoothScroll } from '@/composables/useSmoothScroll'

const props = defineProps<{
  variant?: 'landing' | 'app'
}>()

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { scrollTo } = useSmoothScroll()

const sectionLinks = [
  { label: 'Imkoniyatlar', href: '#features' },
  { label: 'Kim uchun', href: '#use-cases' },
  { label: 'Qanday ishlaydi', href: '#how-it-works' },
  { label: 'Foydasi', href: '#benefits' },
]

const appLinks = [
  { label: 'Konferensiyalar', to: '/conferences' },
  { label: 'Boshqaruv paneli', to: '/dashboard', auth: true },
]

const open = ref(false)

useScrollLock(open)

watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)

const toggle = () => {
  open.value = !open.value
}

const handleSectionClick = (event: MouseEvent) => {
  scrollTo(event)
  open.value = false
}

const goLogin = () => {
  open.value = false
  router.push({ name: 'login' })
}

const goRegister = () => {
  open.value = false
  router.push({ name: 'register' })
}

const showSectionLinks = props.variant !== 'app' && route.name === 'home'
</script>

<template>
  <header class="nav">
    <BaseContainer>
      <div class="nav__bar">
        <router-link to="/" class="nav__logo" aria-label="EventLab — bosh sahifa">
          <AppLogo />
        </router-link>

        <nav class="nav__links" aria-label="Asosiy navigatsiya">
          <template v-if="showSectionLinks">
            <a
              v-for="link in sectionLinks"
              :key="link.href"
              :href="link.href"
              class="nav__link"
              @click="scrollTo"
            >
              {{ link.label }}
            </a>
          </template>
          <template v-else>
            <router-link
              v-for="link in appLinks.filter((l) => !l.auth || auth.isAuthenticated)"
              :key="link.to"
              :to="link.to"
              class="nav__link"
              active-class="nav__link--active"
            >
              {{ link.label }}
            </router-link>
          </template>
        </nav>

        <div class="nav__cta">
          <template v-if="auth.isAuthenticated">
            <NotificationsBell />
            <UserMenu />
          </template>
          <template v-else>
            <BaseButton variant="ghost" size="sm" @click="goLogin">Kirish</BaseButton>
            <BaseButton variant="primary" size="sm" @click="goRegister">
              Boshlash
            </BaseButton>
          </template>
        </div>

        <button
          type="button"
          class="nav__burger"
          :aria-expanded="open"
          aria-controls="mobile-menu"
          aria-label="Menyu"
          @click="toggle"
        >
          <IconBase v-if="!open" :size="22">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </IconBase>
          <IconBase v-else :size="22">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </IconBase>
        </button>
      </div>
    </BaseContainer>

    <div
      v-show="open"
      id="mobile-menu"
      class="nav__mobile"
      role="dialog"
      aria-modal="true"
    >
      <BaseContainer>
        <nav class="nav__mobile-links" aria-label="Mobil navigatsiya">
          <template v-if="showSectionLinks">
            <a
              v-for="link in sectionLinks"
              :key="link.href"
              :href="link.href"
              class="nav__mobile-link"
              @click="handleSectionClick"
            >
              {{ link.label }}
            </a>
          </template>
          <template v-else>
            <router-link
              v-for="link in appLinks.filter((l) => !l.auth || auth.isAuthenticated)"
              :key="link.to"
              :to="link.to"
              class="nav__mobile-link"
            >
              {{ link.label }}
            </router-link>
          </template>
        </nav>
        <div class="nav__mobile-cta">
          <template v-if="!auth.isAuthenticated">
            <BaseButton variant="secondary" size="md" full-width @click="goLogin">
              Kirish
            </BaseButton>
            <BaseButton variant="primary" size="md" full-width @click="goRegister">
              Boshlash
            </BaseButton>
          </template>
          <template v-else>
            <BaseButton variant="secondary" size="md" full-width to="/dashboard">
              Boshqaruv paneli
            </BaseButton>
            <BaseButton variant="ghost" size="md" full-width @click="auth.logout()">
              Chiqish
            </BaseButton>
          </template>
        </div>
      </BaseContainer>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: saturate(180%) blur(12px);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--color-border-subtle);
}

.nav__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  gap: 16px;
  flex-wrap: nowrap;
}

@media (max-width: 480px) {
  .nav__bar {
    height: 56px;
    gap: 8px;
  }
}

.nav__logo {
  display: inline-flex;
}

.nav__links {
  display: none;
  align-items: center;
  gap: 28px;
  flex: 1;
  justify-content: center;
}

.nav__link {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  transition: color 0.2s var(--ease-out-soft);
  position: relative;
}

.nav__link:hover {
  color: var(--color-brand-deep);
}

.nav__link--active {
  color: var(--color-brand-deep);
}

.nav__cta {
  display: none;
  align-items: center;
  gap: 8px;
}

.nav__burger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text);
}

.nav__burger:hover {
  background: var(--color-bg-muted);
}

.nav__mobile {
  border-top: 1px solid var(--color-border-subtle);
  padding-block: 16px 24px;
  background: var(--color-bg);
}

.nav__mobile-links {
  display: flex;
  flex-direction: column;
}

.nav__mobile-link {
  padding: 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border-subtle);
}

.nav__mobile-link:last-child {
  border-bottom: none;
}

.nav__mobile-cta {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (min-width: 768px) {
  .nav__links,
  .nav__cta {
    display: flex;
  }

  .nav__burger {
    display: none;
  }

  .nav__mobile {
    display: none !important;
  }
}
</style>

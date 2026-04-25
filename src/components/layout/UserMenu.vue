<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { formatRole } from '@/composables/useFormatters'
import { buildUploadsUrl } from '@/services/api'
import IconBase from '@/components/ui/IconBase.vue'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const avatarUrl = computed(() =>
  auth.user?.avatar ? buildUploadsUrl(auth.user.avatar) : null,
)

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

const close = () => {
  open.value = false
}

const toggle = () => {
  open.value = !open.value
}

const onDocumentClick = (event: MouseEvent) => {
  if (!open.value) return
  if (
    menuRef.value &&
    !menuRef.value.contains(event.target as Node)
  ) {
    close()
  }
}

document.addEventListener('click', onDocumentClick)
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))

const go = (to: { name: string }) => {
  close()
  router.push(to)
}

const onLogout = async () => {
  close()
  await auth.logout()
  toast.info('Tizimdan chiqildi')
  router.push({ name: 'home' })
}
</script>

<template>
  <div ref="menuRef" class="user-menu">
    <button
      type="button"
      class="user-menu__trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="toggle"
    >
      <span
        class="user-menu__avatar"
        :class="{ 'user-menu__avatar--image': avatarUrl }"
        :style="avatarUrl ? { backgroundImage: `url('${avatarUrl}')` } : undefined"
        aria-hidden="true"
      >
        <span v-if="!avatarUrl">
          {{ auth.user ? initials(auth.user.name) : '?' }}
        </span>
      </span>
      <span class="user-menu__chev" aria-hidden="true">
        <IconBase :size="14">
          <polyline points="6 9 12 15 18 9" />
        </IconBase>
      </span>
    </button>

    <div v-if="open" class="user-menu__panel" role="menu">
      <div class="user-menu__head">
        <div class="user-menu__name">{{ auth.user?.name }}</div>
        <div class="user-menu__email">{{ auth.user?.email }}</div>
        <span v-if="auth.user" class="user-menu__role">
          {{ formatRole(auth.user.role) }}
        </span>
      </div>
      <div class="user-menu__list">
        <button
          type="button"
          class="user-menu__item"
          role="menuitem"
          @click="go({ name: 'dashboard' })"
        >
          Boshqaruv paneli
        </button>
        <button
          type="button"
          class="user-menu__item"
          role="menuitem"
          @click="go({ name: 'profile' })"
        >
          Profil
        </button>
        <button
          v-if="auth.isOrganizer"
          type="button"
          class="user-menu__item"
          role="menuitem"
          @click="go({ name: 'conference-create' })"
        >
          Yangi konferensiya
        </button>
        <button
          v-if="auth.isAdmin"
          type="button"
          class="user-menu__item"
          role="menuitem"
          @click="go({ name: 'admin' })"
        >
          Admin panel
        </button>
      </div>
      <div class="user-menu__foot">
        <button
          type="button"
          class="user-menu__item user-menu__item--danger"
          role="menuitem"
          @click="onLogout"
        >
          Chiqish
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}

.user-menu__trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 4px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: 9999px;
  cursor: pointer;
  transition: border-color 0.2s var(--ease-out-soft);
}

.user-menu__trigger:hover {
  border-color: var(--color-border-medium);
}

.user-menu__avatar {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background-color: var(--color-text);
  color: var(--color-brand);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.4px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
}

.user-menu__avatar--image {
  background-color: var(--color-bg-muted);
}

.user-menu__chev {
  color: var(--color-text-muted);
}

.user-menu__panel {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  min-width: 240px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  z-index: 60;
}

.user-menu__head {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.user-menu__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.user-menu__email {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
  word-break: break-all;
}

.user-menu__role {
  display: inline-flex;
  margin-top: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
  background: var(--color-brand-light);
  border-radius: 9999px;
  padding: 3px 10px;
}

.user-menu__list,
.user-menu__foot {
  padding: 6px;
}

.user-menu__foot {
  border-top: 1px solid var(--color-border-subtle);
}

.user-menu__item {
  width: 100%;
  text-align: left;
  background: transparent;
  border: 0;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.user-menu__item:hover {
  background: var(--color-bg-muted);
  color: var(--color-text);
}

.user-menu__item--danger:hover {
  background: var(--color-error-bg);
  color: var(--color-error);
}
</style>

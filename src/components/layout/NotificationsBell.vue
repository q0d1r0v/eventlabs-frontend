<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import { formatRelativeTime } from '@/composables/useFormatters'
import IconBase from '@/components/ui/IconBase.vue'

const notif = useNotificationsStore()
const router = useRouter()

const open = ref(false)
const wrapRef = ref<HTMLElement | null>(null)

const toggle = async () => {
  open.value = !open.value
  if (open.value) {
    await notif.fetchAll()
  }
}

const close = () => {
  open.value = false
}

const onDocumentClick = (event: MouseEvent) => {
  if (!open.value) return
  if (wrapRef.value && !wrapRef.value.contains(event.target as Node)) {
    close()
  }
}

document.addEventListener('click', onDocumentClick)
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))

const onItemClick = async (n: { id: string; isRead: boolean; link?: string | null }) => {
  if (!n.isRead) await notif.markAsRead(n.id)
  if (n.link) {
    close()
    router.push(n.link)
  }
}

const onMarkAll = async () => {
  await notif.markAllAsRead()
}

const onSeeAll = () => {
  close()
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div ref="wrapRef" class="bell">
    <button
      type="button"
      class="bell__trigger"
      :aria-expanded="open"
      aria-label="Bildirishnomalar"
      @click="toggle"
    >
      <IconBase :size="18">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </IconBase>
      <span v-if="notif.unread > 0" class="bell__badge" aria-live="polite">
        {{ notif.unread > 9 ? '9+' : notif.unread }}
      </span>
    </button>

    <div v-if="open" class="bell__panel" role="dialog" aria-label="Bildirishnomalar paneli">
      <header class="bell__head">
        <strong>Bildirishnomalar</strong>
        <button
          v-if="notif.unread > 0"
          type="button"
          class="bell__action"
          @click="onMarkAll"
        >
          Barchasini o'qildi deb belgilash
        </button>
      </header>

      <div class="bell__list">
        <p v-if="notif.loading" class="bell__empty">Yuklanmoqda...</p>
        <p v-else-if="notif.ordered.length === 0" class="bell__empty">
          Hozircha bildirishnomalar yo'q.
        </p>
        <button
          v-for="n in notif.ordered.slice(0, 8)"
          v-else
          :key="n.id"
          type="button"
          class="bell__item"
          :class="{ 'bell__item--unread': !n.isRead }"
          @click="onItemClick(n)"
        >
          <span v-if="!n.isRead" class="bell__dot" aria-hidden="true" />
          <div class="bell__body">
            <strong v-if="n.title" class="bell__title">{{ n.title }}</strong>
            <span class="bell__msg">{{ n.message }}</span>
            <span class="bell__time">{{ formatRelativeTime(n.createdAt) }}</span>
          </div>
        </button>
      </div>

      <footer v-if="notif.ordered.length > 0" class="bell__foot">
        <button type="button" class="bell__action" @click="onSeeAll">
          Hammasini ko'rish
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.bell {
  position: relative;
}

.bell__trigger {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.bell__trigger:hover {
  background: var(--color-bg-muted);
  border-color: var(--color-border-medium);
}

.bell__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--color-brand);
  color: var(--color-text);
  border-radius: 9999px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.bell__panel {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 360px;
  max-width: calc(100vw - 32px);
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
  z-index: 60;
  overflow: hidden;
}

.bell__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
  font-size: 14px;
  color: var(--color-text);
}

.bell__action {
  background: transparent;
  border: 0;
  font-size: 12px;
  color: var(--color-brand-deep);
  cursor: pointer;
  font-weight: 500;
}

.bell__action:hover {
  text-decoration: underline;
}

.bell__list {
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.bell__empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
}

.bell__item {
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--color-border-subtle);
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  width: 100%;
}

.bell__item:hover {
  background: var(--color-bg-muted);
}

.bell__item:last-child {
  border-bottom: none;
}

.bell__item--unread {
  background: rgba(212, 250, 232, 0.25);
}

.bell__dot {
  flex-shrink: 0;
  margin-top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--color-brand);
}

.bell__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.bell__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.35;
}

.bell__msg {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.45;
  word-break: break-word;
}

.bell__time {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.4px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.bell__foot {
  padding: 10px 16px;
  border-top: 1px solid var(--color-border-subtle);
  text-align: center;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BaseContainer from '@/components/ui/BaseContainer.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import ConferenceCard from '@/components/conference/ConferenceCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useRegistrationsStore } from '@/stores/registrations'
import { useConferencesStore } from '@/stores/conferences'
import { useNotificationsStore } from '@/stores/notifications'
import { useToast } from '@/composables/useToast'
import { certificatesApi } from '@/services/certificates'
import { registrationsApi } from '@/services/registrations'
import { extractApiError } from '@/services/api'
import {
  formatDate,
  formatRelativeTime,
  formatRole,
  formatStatus,
} from '@/composables/useFormatters'
import type { Certificate } from '@/types'

const auth = useAuthStore()
const registrations = useRegistrationsStore()
const conferences = useConferencesStore()
const notifications = useNotificationsStore()
const toast = useToast()

const certificates = ref<Certificate[]>([])
const loadingCerts = ref(false)

const fetchAll = async () => {
  loadingCerts.value = true
  await Promise.all([
    registrations.fetchMine().catch(() => null),
    notifications.fetchAll().catch(() => null),
    conferences.fetchAll().catch(() => null),
    certificatesApi
      .mine()
      .then((data) => {
        certificates.value = data
      })
      .catch((err) => {
        if (err?.response?.status !== 404) toast.error(extractApiError(err))
      })
      .finally(() => {
        loadingCerts.value = false
      }),
  ])
}

onMounted(fetchAll)

const myConferences = computed(() => {
  if (!auth.isOrganizer) return []
  return conferences.items.filter((c) => c.organizerId === auth.user?.id)
})

const myRegistered = computed(() => {
  const ids = new Set(registrations.mine.map((r) => r.conferenceId))
  return conferences.items.filter((c) => ids.has(c.id))
})
</script>

<template>
  <main class="dash">
    <BaseContainer>
      <header class="dash__head">
        <div>
          <span class="dash__eyebrow">Boshqaruv paneli</span>
          <h1 class="dash__title">
            Salom, {{ auth.user?.name?.split(' ')[0] ?? 'foydalanuvchi' }}
          </h1>
          <p class="dash__sub">
            <BaseBadge tone="brand" mono>{{ formatRole(auth.user?.role ?? 'PARTICIPANT') }}</BaseBadge>
            <span class="dash__email">{{ auth.user?.email }}</span>
          </p>
        </div>
        <BaseButton
          v-if="auth.isOrganizer"
          variant="primary"
          size="md"
          to="/organizer/conferences/new"
        >
          Yangi konferensiya
        </BaseButton>
      </header>

      <div class="dash__grid">
        <BaseCard variant="standard" class="dash__stat">
          <span class="dash__stat-label">Yozilgan tadbirlar</span>
          <strong class="dash__stat-value">{{ registrations.mine.length }}</strong>
        </BaseCard>
        <BaseCard v-if="auth.isOrganizer" variant="standard" class="dash__stat">
          <span class="dash__stat-label">Mening konferensiyalarim</span>
          <strong class="dash__stat-value">{{ myConferences.length }}</strong>
        </BaseCard>
        <BaseCard variant="standard" class="dash__stat">
          <span class="dash__stat-label">Sertifikatlar</span>
          <strong class="dash__stat-value">{{ certificates.length }}</strong>
        </BaseCard>
        <BaseCard variant="standard" class="dash__stat">
          <span class="dash__stat-label">Bildirishnomalar</span>
          <strong class="dash__stat-value">{{ notifications.unread }}</strong>
        </BaseCard>
      </div>

      <section v-if="auth.isOrganizer" class="dash__section">
        <header class="dash__section-head">
          <h2>Mening konferensiyalarim</h2>
        </header>
        <div v-if="myConferences.length === 0" class="dash__empty">
          Hali konferensiya yaratmadingiz.
          <router-link to="/organizer/conferences/new" class="dash__link">
            Birinchisini yarating →
          </router-link>
        </div>
        <div v-else class="dash__cards">
          <ConferenceCard v-for="c in myConferences" :key="c.id" :conference="c" />
        </div>
      </section>

      <section class="dash__section">
        <header class="dash__section-head">
          <h2>Yozilgan konferensiyalar</h2>
        </header>
        <div v-if="myRegistered.length === 0" class="dash__empty">
          Hali hech qaysi konferensiyaga yozilmagansiz.
          <router-link to="/conferences" class="dash__link">
            Konferensiyalarni ko'rish →
          </router-link>
        </div>
        <div v-else class="dash__cards">
          <ConferenceCard v-for="c in myRegistered" :key="c.id" :conference="c" />
        </div>
      </section>

      <section class="dash__section">
        <header class="dash__section-head">
          <h2>Mening chiptalarim</h2>
        </header>
        <p v-if="registrations.loading" class="dash__state">Yuklanmoqda...</p>
        <div v-else-if="registrations.mine.length === 0" class="dash__empty">
          Hali chipta yo'q. Konferensiyaga yozilsangiz, chipta avtomatik yaratiladi.
        </div>
        <ul v-else class="dash__cert-list">
          <li
            v-for="reg in registrations.mine"
            :key="reg.id"
            class="dash__cert"
          >
            <div>
              <h4>{{ reg.conference?.title ?? 'Konferensiya' }}</h4>
              <p>
                {{ formatDate(reg.createdAt) }} · Kod:
                <code>{{ reg.ticketCode.slice(0, 8).toUpperCase() }}</code>
              </p>
            </div>
            <BaseButton
              variant="primary"
              size="sm"
              :href="registrationsApi.ticketDownloadUrl(reg.ticketCode)"
            >
              PDF yuklab olish
            </BaseButton>
          </li>
        </ul>
      </section>

      <section class="dash__section">
        <header class="dash__section-head">
          <h2>Mening sertifikatlarim</h2>
        </header>
        <p v-if="loadingCerts" class="dash__state">Yuklanmoqda...</p>
        <p v-else-if="certificates.length === 0" class="dash__empty">
          Hali sertifikat olmagansiz.
        </p>
        <ul v-else class="dash__cert-list">
          <li v-for="cert in certificates" :key="cert.id" class="dash__cert">
            <div>
              <h4>{{ cert.conference?.title ?? 'Konferensiya' }}</h4>
              <p>
                {{ formatDate(cert.issuedAt) }} · Kod: <code>{{ cert.code }}</code>
              </p>
            </div>
            <div class="dash__cert-actions">
              <BaseButton
                variant="primary"
                size="sm"
                :href="certificatesApi.downloadUrl(cert.code)"
              >
                PDF yuklab olish
              </BaseButton>
              <BaseButton
                variant="ghost"
                size="sm"
                :to="{ name: 'certificate-verify', params: { code: cert.code } }"
              >
                Tekshirish
              </BaseButton>
            </div>
          </li>
        </ul>
      </section>

      <section class="dash__section">
        <header class="dash__section-head">
          <h2>So'nggi bildirishnomalar</h2>
          <BaseButton
            v-if="notifications.unread > 0"
            variant="ghost"
            size="sm"
            @click="notifications.markAllAsRead()"
          >
            Hammasini o'qildi deb belgilash
          </BaseButton>
        </header>
        <p v-if="notifications.loading" class="dash__state">Yuklanmoqda...</p>
        <p v-else-if="notifications.ordered.length === 0" class="dash__empty">
          Bildirishnomalar yo'q.
        </p>
        <ul v-else class="dash__notif-list">
          <li
            v-for="n in notifications.ordered.slice(0, 6)"
            :key="n.id"
            class="dash__notif"
            :class="{ 'dash__notif--unread': !n.isRead }"
          >
            <span v-if="!n.isRead" class="dash__notif-dot" aria-hidden="true" />
            <div>
              <strong v-if="n.title" class="dash__notif-title">{{ n.title }}</strong>
              <p class="dash__notif-msg">{{ n.message }}</p>
              <span class="dash__notif-time">{{ formatRelativeTime(n.createdAt) }}</span>
            </div>
            <span class="dash__notif-type">{{ formatStatus(n.type) }}</span>
          </li>
        </ul>
      </section>
    </BaseContainer>
  </main>
</template>

<style scoped>
.dash {
  padding-block: 48px 96px;
  min-height: calc(100svh - 64px);
}

.dash__head {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 32px;
}

.dash__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
}

.dash__title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 600;
  letter-spacing: -0.8px;
  margin-top: 8px;
  color: var(--color-text);
}

.dash__sub {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.dash__email {
  font-size: 14px;
  color: var(--color-text-muted);
}

.dash__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

@media (min-width: 768px) {
  .dash__grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.dash__stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dash__stat-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.dash__stat-value {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.8px;
  color: var(--color-text);
}

.dash__section {
  margin-top: 32px;
}

.dash__section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.dash__section-head h2 {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-text);
}

.dash__cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .dash__cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .dash__cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

.dash__empty,
.dash__state {
  padding: 24px;
  text-align: center;
  color: var(--color-text-muted);
  border: 1px dashed var(--color-border-medium);
  border-radius: var(--radius-lg);
}

.dash__link {
  color: var(--color-brand-deep);
  margin-left: 6px;
  font-weight: 500;
}

.dash__cert-list,
.dash__notif-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dash__cert {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
}

.dash__cert > div {
  min-width: 0;
  flex: 1 1 200px;
}

.dash__cert-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .dash__cert,
  .dash__cert-actions {
    width: 100%;
  }
  .dash__cert-actions {
    justify-content: stretch;
  }
}

.dash__cert h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.dash__cert p {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.dash__cert code {
  font-family: var(--font-mono);
  background: var(--color-bg-muted);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--color-text);
}

.dash__notif {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  gap: 4px 16px;
  align-items: start;
  padding: 14px 16px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
}

.dash__notif--unread {
  background: rgba(212, 250, 232, 0.3);
}

.dash__notif-dot {
  grid-column: 1;
  grid-row: 1 / 3;
  align-self: center;
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--color-brand);
}

.dash__notif > div {
  grid-column: 2;
  grid-row: 1 / 3;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dash__notif-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
  margin-bottom: 2px;
}

.dash__notif-msg {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: anywhere;
}

.dash__notif-time {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.dash__notif-type {
  grid-column: 3;
  grid-row: 1;
  align-self: center;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
  background: var(--color-brand-light);
  border-radius: 9999px;
  padding: 2px 8px;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .dash__notif {
    grid-template-columns: 8px minmax(0, 1fr);
  }
  .dash__notif-type {
    grid-column: 2;
    grid-row: 3;
    justify-self: start;
    margin-top: 4px;
  }
  .dash__notif > div {
    grid-row: 1 / 3;
  }
}
</style>

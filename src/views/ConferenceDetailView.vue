<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseContainer from '@/components/ui/BaseContainer.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import IconBase from '@/components/ui/IconBase.vue'
import SessionList from '@/components/session/SessionList.vue'
import SessionForm from '@/components/session/SessionForm.vue'
import QuestionsList from '@/components/session/QuestionsList.vue'
import MaterialsList from '@/components/session/MaterialsList.vue'
import AllMaterialsList from '@/components/conference/AllMaterialsList.vue'
import { useConferencesStore } from '@/stores/conferences'
import { useRegistrationsStore } from '@/stores/registrations'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { sessionsApi } from '@/services/sessions'
import { certificatesApi } from '@/services/certificates'
import { registrationsApi } from '@/services/registrations'
import { extractApiError, buildUploadsUrl } from '@/services/api'
import {
  formatDateTime,
  formatRange,
  formatStatus,
} from '@/composables/useFormatters'
import type {
  BadgeTone,
  CreateSessionInput,
  Session,
} from '@/types'

const props = defineProps<{ id: string }>()

const router = useRouter()
const conferences = useConferencesStore()
const registrations = useRegistrationsStore()
const auth = useAuthStore()
const toast = useToast()
const confirm = useConfirm()

const sessions = ref<Session[]>([])
const sessionsLoading = ref(false)
const activeSessionId = ref<string | null>(null)

const sessionModalOpen = ref(false)
const editingSession = ref<Session | null>(null)
const sessionLoading = ref(false)

const registering = ref(false)
const issuingCertificate = ref(false)

const fetchAll = async () => {
  try {
    await conferences.fetchOne(props.id)
  } catch (err) {
    toast.error(extractApiError(err))
    router.push({ name: 'conferences' })
    return
  }

  sessionsLoading.value = true
  try {
    sessions.value = await sessionsApi.byConference(props.id)
    if (!activeSessionId.value && sessions.value.length > 0) {
      activeSessionId.value = sessions.value[0].id
    }
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    sessionsLoading.value = false
  }

  if (auth.isAuthenticated) {
    await registrations.fetchMine().catch(() => null)
  }
}

watch(() => props.id, fetchAll, { immediate: true })
onMounted(fetchAll)

const conf = computed(() => conferences.current)

const banner = computed(() =>
  conf.value?.bannerUrl ? buildUploadsUrl(conf.value.bannerUrl) : null,
)

const isOwner = computed(() => {
  if (!auth.user || !conf.value) return false
  return auth.user.role === 'ADMIN' || auth.user.id === conf.value.organizerId
})

const canManageActiveMaterials = computed(() => {
  if (!auth.user) return false
  if (auth.user.role === 'ADMIN') return true
  if (isOwner.value) return true
  return Boolean(activeSession.value && activeSession.value.speakerId === auth.user.id)
})

const isRegistered = computed(() =>
  registrations.isRegistered(props.id),
)

const myRegistration = computed(() =>
  registrations.mine.find((r) => r.conferenceId === props.id) ?? null,
)

const canRegister = computed(() => {
  if (!conf.value) return false
  return ['PUBLISHED', 'ONGOING'].includes(conf.value.status)
})

const blockedReason = computed(() => {
  if (!conf.value) return null
  switch (conf.value.status) {
    case 'DRAFT':
      return "Konferensiya hali e'lon qilinmagan"
    case 'CANCELLED':
      return 'Konferensiya bekor qilingan'
    case 'FINISHED':
      return 'Konferensiya allaqachon tugagan'
    default:
      return null
  }
})

const statusTone = (status: string): BadgeTone => {
  switch (status) {
    case 'PUBLISHED':
    case 'ONGOING':
      return 'brand'
    case 'CANCELLED':
      return 'error'
    case 'FINISHED':
      return 'neutral'
    default:
      return 'info'
  }
}

const onRegister = async () => {
  if (!auth.isAuthenticated) {
    router.push({
      name: 'login',
      query: { redirect: router.currentRoute.value.fullPath },
    })
    return
  }
  registering.value = true
  try {
    const reg = await registrations.register(props.id)
    toast.success("Ro'yxatdan o'tdingiz! Chipta yuklab olinmoqda...", {
      title: `Chipta kodi: ${reg.ticketCode.slice(0, 8)}`,
      duration: 6000,
    })
    // Avtomatik chipta PDF yuklab olish
    window.open(registrationsApi.ticketDownloadUrl(reg.ticketCode), '_blank')
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    registering.value = false
  }
}

const onCancelRegistration = async () => {
  const ok = await confirm({
    title: "Ro'yxatdan o'tishni bekor qilish",
    message: "Bu konferensiyaga yozilishingizni bekor qilmoqchimisiz? Keyinchalik qaytadan yozilishingiz mumkin.",
    confirmLabel: "Ha, bekor qilish",
    danger: true,
  })
  if (!ok) return
  registering.value = true
  try {
    await registrations.cancel(props.id)
    toast.info("Ro'yxatdan o'tish bekor qilindi")
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    registering.value = false
  }
}

const myCertificate = ref<{ code: string } | null>(null)

const onIssueCertificate = async () => {
  issuingCertificate.value = true
  try {
    const cert = await certificatesApi.issue(props.id)
    myCertificate.value = cert
    toast.success(`Sertifikat kodi: ${cert.code}`, {
      title: 'Sertifikat tayyor',
      duration: 8000,
    })
    // Avtomatik yuklab olish
    window.open(certificatesApi.downloadUrl(cert.code), '_blank')
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    issuingCertificate.value = false
  }
}

const openCreateSession = () => {
  editingSession.value = null
  sessionModalOpen.value = true
}

const openEditSession = (id: string) => {
  const s = sessions.value.find((x) => x.id === id)
  if (!s) return
  editingSession.value = s
  sessionModalOpen.value = true
}

const onSessionSubmit = async (payload: CreateSessionInput) => {
  sessionLoading.value = true
  try {
    if (editingSession.value) {
      const updated = await sessionsApi.update(
        editingSession.value.id,
        payload,
      )
      sessions.value = sessions.value.map((s) =>
        s.id === updated.id ? updated : s,
      )
      toast.success('Sessiya yangilandi')
    } else {
      const created = await sessionsApi.create(payload)
      sessions.value = [...sessions.value, created]
      toast.success("Sessiya qo'shildi")
    }
    sessionModalOpen.value = false
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    sessionLoading.value = false
  }
}

const onSessionRemove = async (id: string) => {
  const ok = await confirm({
    title: "Sessiyani o'chirish",
    message: "Bu sessiyani o'chirmoqchimisiz? Sessiyaga tegishli savollar va materiallar ham o'chiriladi.",
    confirmLabel: "O'chirish",
    danger: true,
  })
  if (!ok) return
  try {
    await sessionsApi.remove(id)
    sessions.value = sessions.value.filter((s) => s.id !== id)
    if (activeSessionId.value === id) activeSessionId.value = null
    toast.info("Sessiya o'chirildi")
  } catch (err) {
    toast.error(extractApiError(err))
  }
}

const onConferenceDelete = async () => {
  if (!conf.value) return
  const ok = await confirm({
    title: "Konferensiyani o'chirish",
    message: `"${conf.value.title}" konferensiyasini butunlay o'chirmoqchimisiz? Bu barcha sessiyalar, savollar va ro'yxatlarni ham o'chiradi. Bu amalni qaytarib bo'lmaydi.`,
    confirmLabel: "Butunlay o'chirish",
    danger: true,
  })
  if (!ok) return
  try {
    await conferences.remove(conf.value.id)
    toast.info("Konferensiya o'chirildi")
    router.push({ name: 'conferences' })
  } catch (err) {
    toast.error(extractApiError(err))
  }
}

const sortedSessions = computed(() =>
  [...sessions.value].sort(
    (a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  ),
)

const activeSession = computed(() =>
  sessions.value.find((s) => s.id === activeSessionId.value) ?? null,
)
</script>

<template>
  <main class="conf-detail">
    <div v-if="conferences.loadingDetail && !conf" class="conf-detail__loading">
      Yuklanmoqda...
    </div>

    <template v-else-if="conf">
      <section
        class="conf-detail__hero"
        :class="{ 'conf-detail__hero--has-banner': banner }"
        :style="banner ? { backgroundImage: `url('${banner}')` } : undefined"
      >
        <div
          v-if="banner"
          class="conf-detail__hero-overlay"
          aria-hidden="true"
        />
        <BaseContainer>
          <div class="conf-detail__hero-content">
            <div class="conf-detail__hero-meta">
              <BaseBadge :tone="statusTone(conf.status)" mono>
                {{ formatStatus(conf.status) }}
              </BaseBadge>
              <span v-if="conf.category" class="conf-detail__category">
                {{ conf.category }}
              </span>
            </div>
            <h1 class="conf-detail__title">{{ conf.title }}</h1>
            <p class="conf-detail__sub">{{ conf.description }}</p>

            <div class="conf-detail__meta">
              <div class="conf-detail__meta-item">
                <IconBase :size="16">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </IconBase>
                {{ formatRange(conf.startDate, conf.endDate) }}
              </div>
              <div class="conf-detail__meta-item">
                <IconBase :size="16">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </IconBase>
                {{ conf.isOnline ? 'Onlayn' : conf.location }}
              </div>
              <div v-if="conf.organizer" class="conf-detail__meta-item">
                <IconBase :size="16">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </IconBase>
                Tashkilotchi: {{ conf.organizer.name }}
              </div>
            </div>

            <div class="conf-detail__actions">
              <template v-if="!isOwner">
                <template v-if="isRegistered">
                  <BaseBadge tone="brand" mono>
                    Yozilgan · {{ myRegistration?.ticketCode?.slice(0, 8) }}
                  </BaseBadge>
                  <BaseButton
                    v-if="myRegistration"
                    variant="primary"
                    size="md"
                    :href="registrationsApi.ticketDownloadUrl(myRegistration.ticketCode)"
                  >
                    Chipta yuklab olish
                    <template #trailing>
                      <IconBase :size="14">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </IconBase>
                    </template>
                  </BaseButton>
                  <BaseButton
                    v-if="canRegister"
                    variant="ghost"
                    size="md"
                    @click="onCancelRegistration"
                  >
                    Bekor qilish
                  </BaseButton>
                </template>
                <BaseButton
                  v-else-if="canRegister"
                  variant="primary"
                  size="lg"
                  :disabled="registering"
                  @click="onRegister"
                >
                  {{ registering ? 'Yozilmoqda...' : "Ro'yxatdan o'tish" }}
                </BaseButton>
                <span v-else-if="blockedReason" class="conf-detail__blocked">
                  {{ blockedReason }}
                </span>

                <BaseButton
                  v-if="conf.status === 'FINISHED' && isRegistered"
                  variant="accent"
                  size="md"
                  :disabled="issuingCertificate"
                  @click="onIssueCertificate"
                >
                  {{ issuingCertificate ? 'Yaratilmoqda...' : 'Sertifikat olish' }}
                </BaseButton>
              </template>

              <template v-if="isOwner">
                <BaseButton
                  variant="primary"
                  size="md"
                  :to="`/organizer/conferences/${conf.id}/edit`"
                >
                  Tahrirlash
                </BaseButton>
                <BaseButton
                  variant="ghost"
                  size="md"
                  @click="onConferenceDelete"
                >
                  O'chirish
                </BaseButton>
              </template>
            </div>
          </div>
        </BaseContainer>
      </section>

      <BaseContainer>
        <div class="conf-detail__layout">
          <div class="conf-detail__main">
            <div class="conf-detail__panel-head">
              <div>
                <h2 class="conf-detail__panel-title">Dastur</h2>
                <p class="conf-detail__panel-sub">
                  Konferensiya sessiyalari va vaqt jadvali
                </p>
              </div>
              <BaseButton
                v-if="isOwner"
                variant="primary"
                size="sm"
                @click="openCreateSession"
              >
                Sessiya qo'shish
              </BaseButton>
            </div>

            <p v-if="sessionsLoading" class="conf-detail__state">
              Sessiyalar yuklanmoqda...
            </p>
            <SessionList
              v-else
              :sessions="sortedSessions"
              :active-id="activeSessionId"
              :manageable="isOwner"
              @select="(id) => (activeSessionId = id)"
              @edit="openEditSession"
              @remove="onSessionRemove"
            />

            <AllMaterialsList
              v-if="!sessionsLoading && sortedSessions.length > 0"
              :sessions="sortedSessions"
              class="conf-detail__all-materials"
              @select="(id) => (activeSessionId = id)"
            />

            <div v-if="activeSession" class="conf-detail__qa">
              <BaseCard variant="standard" class="conf-detail__active-session">
                <span class="conf-detail__active-label">Tanlangan sessiya</span>
                <h3>{{ activeSession.title }}</h3>
                <p class="conf-detail__active-time">
                  {{ formatDateTime(activeSession.startTime) }}
                </p>
              </BaseCard>

              <MaterialsList
                :key="`mat-${activeSession.id}`"
                :session-id="activeSession.id"
                :can-manage="canManageActiveMaterials"
              />

              <QuestionsList
                :key="`qa-${activeSession.id}`"
                :session-id="activeSession.id"
                :conference-id="conf.id"
              />
            </div>
          </div>

          <aside class="conf-detail__side">
            <BaseCard variant="standard" class="conf-detail__side-card">
              <h3 class="conf-detail__side-title">Tezkor ma'lumot</h3>
              <dl class="conf-detail__dl">
                <div>
                  <dt>Boshlanish</dt>
                  <dd>{{ formatDateTime(conf.startDate) }}</dd>
                </div>
                <div>
                  <dt>Tugash</dt>
                  <dd>{{ formatDateTime(conf.endDate) }}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>{{ conf.isOnline ? 'Onlayn' : 'Joyida' }}</dd>
                </div>
                <div v-if="conf.maxAttendees">
                  <dt>Maks. qatnashchilar</dt>
                  <dd>{{ conf.maxAttendees }}</dd>
                </div>
                <div v-if="conf._count?.registrations !== undefined">
                  <dt>Yozilganlar</dt>
                  <dd>{{ conf._count.registrations }}</dd>
                </div>
              </dl>
            </BaseCard>
          </aside>
        </div>
      </BaseContainer>
    </template>

    <BaseModal
      :open="sessionModalOpen"
      :title="editingSession ? 'Sessiyani tahrirlash' : 'Yangi sessiya'"
      size="md"
      @close="sessionModalOpen = false"
    >
      <SessionForm
        :conference-id="props.id"
        :initial="editingSession"
        :loading="sessionLoading"
        @submit="onSessionSubmit"
        @cancel="sessionModalOpen = false"
      />
    </BaseModal>
  </main>
</template>

<style scoped>
.conf-detail {
  min-height: calc(100svh - 64px);
  padding-bottom: 96px;
}

.conf-detail__loading {
  text-align: center;
  padding: 96px 24px;
  color: var(--color-text-muted);
}

.conf-detail__hero {
  position: relative;
  padding-block: 64px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-brand-light), #fff);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

@media (max-width: 640px) {
  .conf-detail__hero {
    padding-block: 40px;
  }
}

.conf-detail__hero--has-banner {
  background-color: var(--color-text);
  color: #fff;
}

.conf-detail__hero-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(13, 13, 13, 0.35) 0%,
    rgba(13, 13, 13, 0.75) 100%
  );
}

.conf-detail__hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
}

.conf-detail__hero--has-banner .conf-detail__hero-content,
.conf-detail__hero--has-banner .conf-detail__title,
.conf-detail__hero--has-banner .conf-detail__meta-item {
  color: #ffffff;
}

.conf-detail__hero-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.conf-detail__category {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.conf-detail__hero--has-banner .conf-detail__category {
  color: rgba(255, 255, 255, 0.7);
}

.conf-detail__title {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 600;
  letter-spacing: -1px;
  line-height: 1.1;
  color: var(--color-text);
}

.conf-detail__sub {
  font-size: 16px;
  line-height: 1.55;
  color: var(--color-text-muted);
  max-width: 640px;
}

.conf-detail__hero--has-banner .conf-detail__sub {
  color: rgba(255, 255, 255, 0.85);
}

.conf-detail__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-top: 8px;
}

.conf-detail__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.conf-detail__hero--has-banner .conf-detail__meta-item {
  color: rgba(255, 255, 255, 0.85);
}

.conf-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 16px;
}

.conf-detail__blocked {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 9999px;
  background: var(--color-bg-muted);
  border: 1px solid var(--color-border-medium);
  font-size: 13px;
  color: var(--color-text-muted);
}

.conf-detail__hero--has-banner .conf-detail__blocked {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.85);
}

.conf-detail__layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin-top: 48px;
}

@media (min-width: 1024px) {
  .conf-detail__layout {
    grid-template-columns: 1fr 320px;
  }
}

.conf-detail__panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 16px;
}

.conf-detail__panel-title {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.4px;
  color: var(--color-text);
}

.conf-detail__panel-sub {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.conf-detail__state {
  text-align: center;
  padding: 32px;
  color: var(--color-text-muted);
}

.conf-detail__qa {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conf-detail__all-materials {
  margin-top: 24px;
}

.conf-detail__active-session {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.conf-detail__active-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
}

.conf-detail__active-session h3 {
  font-size: 18px;
  letter-spacing: -0.2px;
  color: var(--color-text);
}

.conf-detail__active-time {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.4px;
  color: var(--color-text-muted);
}

.conf-detail__side-card {
  position: sticky;
  top: 88px;
}

.conf-detail__side-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-text);
  margin-bottom: 12px;
}

.conf-detail__dl {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conf-detail__dl > div {
  display: flex;
  flex-direction: column;
}

.conf-detail__dl dt {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.conf-detail__dl dd {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text);
}
</style>

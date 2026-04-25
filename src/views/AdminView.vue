<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BaseContainer from '@/components/ui/BaseContainer.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import IconBase from '@/components/ui/IconBase.vue'
import UserForm from '@/components/admin/UserForm.vue'
import { usersApi } from '@/services/users'
import type { CreateUserInput, UpdateUserInput } from '@/services/users'
import { useAuthStore } from '@/stores/auth'
import { useConferencesStore } from '@/stores/conferences'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { buildUploadsUrl, extractApiError } from '@/services/api'
import { formatDate, formatRole, formatStatus } from '@/composables/useFormatters'
import type { BadgeTone, User, UserRole } from '@/types'

const conferences = useConferencesStore()
const toast = useToast()
const confirm = useConfirm()
const auth = useAuthStore()

const userInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

const users = ref<User[]>([])
const loadingUsers = ref(false)
const search = ref('')
const roleFilter = ref<UserRole | ''>('')

const userModalOpen = ref(false)
const editingUser = ref<User | null>(null)
const userFormLoading = ref(false)

const openCreateUser = () => {
  editingUser.value = null
  userModalOpen.value = true
}

const openEditUser = (user: User) => {
  editingUser.value = user
  userModalOpen.value = true
}

const onUserSubmit = async (
  payload: CreateUserInput | UpdateUserInput,
) => {
  userFormLoading.value = true
  try {
    if (editingUser.value) {
      const updated = await usersApi.update(
        editingUser.value.id,
        payload as UpdateUserInput,
      )
      users.value = users.value.map((u) =>
        u.id === updated.id ? updated : u,
      )
      toast.success('Foydalanuvchi yangilandi')
    } else {
      const created = await usersApi.create(payload as CreateUserInput)
      users.value = [created, ...users.value]
      toast.success('Foydalanuvchi yaratildi')
    }
    userModalOpen.value = false
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    userFormLoading.value = false
  }
}

const fetch = async () => {
  loadingUsers.value = true
  try {
    users.value = await usersApi.list()
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    loadingUsers.value = false
  }
  await conferences.fetchAll().catch(() => null)
}

onMounted(fetch)

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  return users.value.filter((u) => {
    const matchesRole = !roleFilter.value || u.role === roleFilter.value
    const matchesQ =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    return matchesRole && matchesQ
  })
})

const stats = computed(() => ({
  total: users.value.length,
  organizers: users.value.filter((u) => u.role === 'ORGANIZER').length,
  speakers: users.value.filter((u) => u.role === 'SPEAKER').length,
  participants: users.value.filter((u) => u.role === 'PARTICIPANT').length,
  conferences: conferences.items.length,
}))

const onDeleteUser = async (user: User) => {
  if (user.id === auth.user?.id) {
    toast.warning("O'z hisobingizni o'chira olmaysiz")
    return
  }
  const ok = await confirm({
    title: "Foydalanuvchini o'chirish",
    message: `${user.name} (${user.email}) foydalanuvchini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`,
    confirmLabel: "O'chirish",
    danger: true,
  })
  if (!ok) return
  try {
    await usersApi.remove(user.id)
    users.value = users.value.filter((u) => u.id !== user.id)
    toast.info("Foydalanuvchi o'chirildi")
  } catch (err) {
    toast.error(extractApiError(err))
  }
}

const roleTone = (role: UserRole): BadgeTone => {
  switch (role) {
    case 'ADMIN':
      return 'error'
    case 'ORGANIZER':
      return 'brand'
    case 'SPEAKER':
      return 'info'
    case 'PARTICIPANT':
      return 'neutral'
    default:
      return 'neutral'
  }
}

const conferenceStatusTone = (s: string): BadgeTone => {
  switch (s) {
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
</script>

<template>
  <main class="admin">
    <BaseContainer>
      <header class="admin__head">
        <span class="admin__eyebrow">Admin</span>
        <h1 class="admin__title">Tizim boshqaruvi</h1>
      </header>

      <div class="admin__stats">
        <BaseCard variant="standard" class="admin__stat">
          <span>Jami foydalanuvchilar</span>
          <strong>{{ stats.total }}</strong>
        </BaseCard>
        <BaseCard variant="standard" class="admin__stat">
          <span>Tashkilotchilar</span>
          <strong>{{ stats.organizers }}</strong>
        </BaseCard>
        <BaseCard variant="standard" class="admin__stat">
          <span>Ma'ruzachilar</span>
          <strong>{{ stats.speakers }}</strong>
        </BaseCard>
        <BaseCard variant="standard" class="admin__stat">
          <span>Konferensiyalar</span>
          <strong>{{ stats.conferences }}</strong>
        </BaseCard>
      </div>

      <section class="admin__section">
        <header class="admin__section-head">
          <h2>Foydalanuvchilar</h2>
          <div class="admin__filters">
            <input
              v-model="search"
              class="admin__search"
              type="search"
              placeholder="Ism yoki email bo'yicha qidirish"
            />
            <select v-model="roleFilter" class="admin__select">
              <option value="">Barcha rollar</option>
              <option value="ADMIN">Administrator</option>
              <option value="ORGANIZER">Tashkilotchi</option>
              <option value="SPEAKER">Ma'ruzachi</option>
              <option value="PARTICIPANT">Qatnashchi</option>
            </select>
            <BaseButton variant="primary" size="sm" @click="openCreateUser">
              <template #leading>
                <IconBase :size="14">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </IconBase>
              </template>
              Yangi foydalanuvchi
            </BaseButton>
          </div>
        </header>

        <p v-if="loadingUsers" class="admin__state">Yuklanmoqda...</p>
        <div v-else-if="filteredUsers.length === 0" class="admin__state">
          Foydalanuvchi topilmadi.
        </div>
        <div v-else class="admin__table">
          <div class="admin__row admin__row--head">
            <span>Foydalanuvchi</span>
            <span>Rol</span>
            <span>Yaratildi</span>
            <span></span>
          </div>
          <div
            v-for="u in filteredUsers"
            :key="u.id"
            class="admin__row"
          >
            <div class="admin__user">
              <span
                class="admin__avatar"
                :style="
                  u.avatar
                    ? { backgroundImage: `url('${buildUploadsUrl(u.avatar)}')` }
                    : undefined
                "
                aria-hidden="true"
              >
                <span v-if="!u.avatar">{{ userInitials(u.name) }}</span>
              </span>
              <div class="admin__user-info">
                <strong>{{ u.name }}</strong>
                <small>{{ u.email }}</small>
              </div>
            </div>
            <BaseBadge :tone="roleTone(u.role)" mono>
              {{ formatRole(u.role) }}
            </BaseBadge>
            <span class="admin__date">{{ formatDate(u.createdAt) }}</span>
            <div class="admin__row-actions">
              <BaseButton
                variant="ghost"
                size="sm"
                aria-label="Tahrirlash"
                @click="openEditUser(u)"
              >
                <IconBase :size="14">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
                </IconBase>
                Tahrirlash
              </BaseButton>
              <BaseButton
                v-if="u.id !== auth.user?.id"
                variant="ghost"
                size="sm"
                aria-label="O'chirish"
                @click="onDeleteUser(u)"
              >
                <IconBase :size="14">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                </IconBase>
                O'chirish
              </BaseButton>
            </div>
          </div>
        </div>
      </section>

      <section class="admin__section">
        <header class="admin__section-head">
          <h2>Konferensiyalar</h2>
        </header>
        <p v-if="conferences.loading" class="admin__state">Yuklanmoqda...</p>
        <div v-else-if="conferences.items.length === 0" class="admin__state">
          Hali konferensiya yo'q.
        </div>
        <div v-else class="admin__table">
          <div class="admin__row admin__row--head admin__row--conf">
            <span>Konferensiya</span>
            <span>Tashkilotchi</span>
            <span>Holat</span>
            <span></span>
          </div>
          <div
            v-for="c in conferences.items"
            :key="c.id"
            class="admin__row admin__row--conf"
          >
            <div class="admin__user">
              <strong>{{ c.title }}</strong>
              <small>{{ formatDate(c.startDate) }}</small>
            </div>
            <span class="admin__date">{{ c.organizer?.name ?? '—' }}</span>
            <BaseBadge :tone="conferenceStatusTone(c.status)" mono>
              {{ formatStatus(c.status) }}
            </BaseBadge>
            <BaseButton
              variant="ghost"
              size="sm"
              :to="{ name: 'conference-detail', params: { id: c.id } }"
            >
              Ko'rish
            </BaseButton>
          </div>
        </div>
      </section>
    </BaseContainer>
    <BaseModal
      :open="userModalOpen"
      :title="editingUser ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'"
      size="md"
      @close="userModalOpen = false"
    >
      <UserForm
        :initial="editingUser"
        :loading="userFormLoading"
        @submit="onUserSubmit"
        @cancel="userModalOpen = false"
      />
    </BaseModal>
  </main>
</template>

<style scoped>
.admin {
  padding-block: 48px 96px;
  min-height: calc(100svh - 64px);
}

.admin__head {
  margin-bottom: 24px;
}

.admin__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
}

.admin__title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 600;
  letter-spacing: -0.8px;
  margin-top: 8px;
  color: var(--color-text);
}

.admin__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

@media (min-width: 768px) {
  .admin__stats {
    grid-template-columns: repeat(4, 1fr);
  }
}

.admin__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin__stat span {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.admin__stat strong {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.6px;
  color: var(--color-text);
}

.admin__section {
  margin-top: 32px;
}

.admin__section-head {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.admin__section-head h2 {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-text);
}

.admin__filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.admin__search,
.admin__select {
  font-family: var(--font-sans);
  font-size: 14px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  padding: 8px 14px;
  color: var(--color-text);
  outline: none;
}

.admin__search:focus,
.admin__select:focus {
  border-color: var(--color-brand);
}

.admin__state {
  text-align: center;
  padding: 24px;
  color: var(--color-text-muted);
  border: 1px dashed var(--color-border-medium);
  border-radius: var(--radius-lg);
}

.admin__table {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg);
}

.admin__row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
  font-size: 14px;
}

.admin__row:last-child {
  border-bottom: none;
}

.admin__row--head {
  background: var(--color-bg-subtle);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.admin__user {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.admin__user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin__user strong {
  font-size: 14px;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin__user small {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin__avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background-color: var(--color-text);
  color: var(--color-brand);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid var(--color-border-subtle);
}

.admin__date {
  font-size: 13px;
  color: var(--color-text-muted);
}

.admin__row-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .admin__row,
  .admin__row--conf {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 14px;
  }
  .admin__row--head {
    display: none;
  }
  .admin__row-actions {
    justify-content: flex-start;
  }
  .admin__filters {
    width: 100%;
  }
  .admin__search,
  .admin__select {
    flex: 1;
    min-width: 140px;
  }
  .admin__section-head {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .admin__filters {
    flex-direction: column;
  }
  .admin__search,
  .admin__select {
    width: 100%;
  }
}
</style>

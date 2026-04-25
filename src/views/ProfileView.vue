<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseContainer from '@/components/ui/BaseContainer.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconBase from '@/components/ui/IconBase.vue'
import { useAuthStore } from '@/stores/auth'
import { formatDate, formatRole } from '@/composables/useFormatters'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { usersApi } from '@/services/users'
import { buildUploadsUrl, extractApiError } from '@/services/api'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const removing = ref(false)

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

const onPickAvatar = () => fileInput.value?.click()

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  input.value = ''

  if (!file.type.startsWith('image/')) {
    toast.error("Faqat rasm fayl tanlang")
    return
  }
  if (file.size > 3 * 1024 * 1024) {
    toast.error("Rasm 3 MB dan oshmasligi kerak")
    return
  }

  uploading.value = true
  try {
    const updated = await usersApi.uploadAvatar(file)
    auth.user = updated
    toast.success("Avatar yangilandi")
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    uploading.value = false
  }
}

const onRemoveAvatar = async () => {
  const ok = await confirm({
    title: "Avatarni olib tashlash",
    message: "Joriy avatarni o'chirmoqchimisiz?",
    confirmLabel: "O'chirish",
    danger: true,
  })
  if (!ok) return
  removing.value = true
  try {
    const updated = await usersApi.removeAvatar()
    auth.user = updated
    toast.info("Avatar olib tashlandi")
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    removing.value = false
  }
}

const onLogout = async () => {
  await auth.logout()
  toast.info('Tizimdan chiqildi')
  router.push({ name: 'home' })
}
</script>

<template>
  <main class="profile">
    <BaseContainer>
      <header class="profile__head">
        <span class="profile__eyebrow">Profil</span>
        <h1 class="profile__title">Hisob ma'lumotlari</h1>
      </header>

      <div class="profile__layout">
        <BaseCard variant="featured" class="profile__main">
          <div class="profile__user">
            <div class="profile__avatar-wrap">
              <div
                class="profile__avatar"
                :class="{ 'profile__avatar--image': avatarUrl }"
                :style="avatarUrl ? { backgroundImage: `url('${avatarUrl}')` } : undefined"
                aria-hidden="true"
              >
                <span v-if="!avatarUrl">
                  {{ auth.user ? initials(auth.user.name) : '' }}
                </span>
              </div>

              <input
                ref="fileInput"
                type="file"
                class="profile__file"
                accept="image/*"
                @change="onFileChange"
              />

              <button
                type="button"
                class="profile__avatar-edit"
                aria-label="Avatarni almashtirish"
                :disabled="uploading"
                @click="onPickAvatar"
              >
                <IconBase :size="14">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </IconBase>
              </button>
            </div>

            <div>
              <h2 class="profile__name">{{ auth.user?.name }}</h2>
              <p class="profile__email">{{ auth.user?.email }}</p>
              <div class="profile__chips">
                <BaseBadge tone="brand" mono>
                  {{ formatRole(auth.user?.role ?? 'PARTICIPANT') }}
                </BaseBadge>
                <BaseBadge v-if="auth.user?.isVerified" tone="info" mono>
                  Tasdiqlangan
                </BaseBadge>
              </div>
              <div class="profile__avatar-actions">
                <BaseButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  :disabled="uploading"
                  @click="onPickAvatar"
                >
                  {{ uploading ? "Yuklanmoqda..." : avatarUrl ? "Almashtirish" : "Avatar yuklash" }}
                </BaseButton>
                <BaseButton
                  v-if="avatarUrl"
                  type="button"
                  variant="ghost"
                  size="sm"
                  :disabled="removing"
                  @click="onRemoveAvatar"
                >
                  {{ removing ? "O'chirilmoqda..." : "O'chirish" }}
                </BaseButton>
              </div>
            </div>
          </div>

          <dl class="profile__dl">
            <div>
              <dt>To'liq ism</dt>
              <dd>{{ auth.user?.name }}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{{ auth.user?.email }}</dd>
            </div>
            <div>
              <dt>Rol</dt>
              <dd>{{ formatRole(auth.user?.role ?? '') }}</dd>
            </div>
            <div v-if="auth.user?.createdAt">
              <dt>A'zo bo'ldi</dt>
              <dd>{{ formatDate(auth.user.createdAt) }}</dd>
            </div>
            <div v-if="auth.user?.bio">
              <dt>Bio</dt>
              <dd>{{ auth.user.bio }}</dd>
            </div>
          </dl>
        </BaseCard>

        <aside class="profile__side">
          <BaseCard variant="standard">
            <h3 class="profile__side-title">Hisobni boshqarish</h3>
            <p class="profile__side-sub">
              Tizimdan chiqishingiz mumkin. Boshqa hisob sozlamalari keyingi
              versiyada qo'shiladi.
            </p>
            <BaseButton variant="secondary" size="md" full-width @click="onLogout">
              Chiqish
            </BaseButton>
          </BaseCard>
        </aside>
      </div>
    </BaseContainer>
  </main>
</template>

<style scoped>
.profile {
  padding-block: 48px 96px;
  min-height: calc(100svh - 64px);
}

.profile__head {
  margin-bottom: 24px;
}

.profile__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
}

.profile__title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 600;
  letter-spacing: -0.8px;
  margin-top: 8px;
  color: var(--color-text);
}

.profile__layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 1024px) {
  .profile__layout {
    grid-template-columns: 2fr 1fr;
  }
}

.profile__main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile__user {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.profile__avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .profile__user {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .profile__chips,
  .profile__avatar-actions {
    justify-content: center;
  }
}

.profile__avatar {
  width: 80px;
  height: 80px;
  border-radius: 9999px;
  background: var(--color-text);
  color: var(--color-brand);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 2px solid var(--color-bg);
  box-shadow: 0 0 0 1px var(--color-border-subtle);
}

.profile__avatar--image {
  background-color: var(--color-bg-muted);
  color: transparent;
}

.profile__file {
  display: none;
}

.profile__avatar-edit {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: var(--color-text);
  color: var(--color-brand);
  border: 2px solid var(--color-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s var(--ease-out-soft);
}

.profile__avatar-edit:hover {
  opacity: 0.85;
}

.profile__avatar-edit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.profile__name {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.4px;
  color: var(--color-text);
}

.profile__email {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.profile__chips {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.profile__avatar-actions {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.profile__dl {
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-subtle);
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .profile__dl {
    grid-template-columns: 1fr 1fr;
  }
}

.profile__dl dt {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.profile__dl dd {
  margin: 6px 0 0;
  font-size: 15px;
  color: var(--color-text);
}

.profile__side-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-text);
  margin-bottom: 8px;
}

.profile__side-sub {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-bottom: 16px;
}
</style>

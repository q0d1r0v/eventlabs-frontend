<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconBase from '@/components/ui/IconBase.vue'
import { buildUploadsUrl } from '@/services/api'
import { useToast } from '@/composables/useToast'
import type {
  Conference,
  ConferenceStatus,
  CreateConferenceInput,
  UpdateConferenceInput,
} from '@/types'

const props = defineProps<{
  initial?: Conference | null
  loading?: boolean
  mode?: 'create' | 'edit'
}>()

const emit = defineEmits<{
  submit: [
    payload: CreateConferenceInput | UpdateConferenceInput,
    bannerFile: File | null,
    removeBanner: boolean,
  ]
  cancel: []
}>()

const toast = useToast()

// Banner state
const bannerFile = ref<File | null>(null)
const bannerPreview = ref<string | null>(null)
const removeBannerFlag = ref(false)
const bannerInput = ref<HTMLInputElement | null>(null)

const currentBannerUrl = computed(() => {
  if (removeBannerFlag.value) return null
  if (bannerPreview.value) return bannerPreview.value
  return props.initial?.bannerUrl ? buildUploadsUrl(props.initial.bannerUrl) : null
})

const form = reactive({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  location: '',
  isOnline: false,
  category: '',
  maxAttendees: '' as string | number,
  status: 'DRAFT' as ConferenceStatus,
})

const errors = reactive<Record<string, string>>({})

const toLocalInput = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

watch(
  () => props.initial,
  (val) => {
    if (!val) return
    form.title = val.title
    form.description = val.description
    form.startDate = toLocalInput(val.startDate)
    form.endDate = toLocalInput(val.endDate)
    form.location = val.location
    form.isOnline = val.isOnline
    form.category = val.category ?? ''
    form.maxAttendees = val.maxAttendees ?? ''
    form.status = val.status
  },
  { immediate: true },
)

const isValidDateTime = (value: string) =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) &&
  !Number.isNaN(new Date(value).getTime())

const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (form.title.trim().length < 3)
    errors.title = "Sarlavha kamida 3 belgi bo'lishi kerak"
  if (form.description.trim().length < 10)
    errors.description = "Tavsif kamida 10 belgi bo'lishi kerak"

  if (!form.startDate || !isValidDateTime(form.startDate))
    errors.startDate = "Sana va vaqtni to'liq kiriting (masalan: 09:00)"

  if (!form.endDate || !isValidDateTime(form.endDate))
    errors.endDate = "Sana va vaqtni to'liq kiriting (masalan: 18:00)"

  if (
    isValidDateTime(form.startDate) &&
    isValidDateTime(form.endDate)
  ) {
    const s = new Date(form.startDate).getTime()
    const e = new Date(form.endDate).getTime()
    if (e < s)
      errors.endDate = "Tugash sanasi boshlanishdan keyin bo'lishi kerak"
  }
  if (!form.location.trim()) errors.location = "Joy nomi majburiy"

  return Object.keys(errors).length === 0
}

const onSubmit = (e: Event) => {
  e.preventDefault()
  if (!validate()) return

  const payload: CreateConferenceInput & { status?: ConferenceStatus } = {
    title: form.title.trim(),
    description: form.description.trim(),
    startDate: new Date(form.startDate).toISOString(),
    endDate: new Date(form.endDate).toISOString(),
    location: form.location.trim(),
    isOnline: form.isOnline,
  }
  if (form.category.trim()) payload.category = form.category.trim()
  const max = Number(form.maxAttendees)
  if (!Number.isNaN(max) && max > 0) payload.maxAttendees = max
  if (props.mode === 'edit') payload.status = form.status

  emit('submit', payload, bannerFile.value, removeBannerFlag.value)
}

const onPickBanner = () => bannerInput.value?.click()

const onBannerChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.error('Faqat rasm fayl tanlang')
    input.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Rasm 5 MB dan oshmasligi kerak')
    input.value = ''
    return
  }
  bannerFile.value = file
  removeBannerFlag.value = false
  // Preview yaratish
  if (bannerPreview.value) URL.revokeObjectURL(bannerPreview.value)
  bannerPreview.value = URL.createObjectURL(file)
  input.value = ''
}

const onClearBanner = () => {
  if (bannerPreview.value) URL.revokeObjectURL(bannerPreview.value)
  bannerPreview.value = null
  bannerFile.value = null
  // Mavjud bannerni o'chirish flag'i — faqat edit rejimida ishlaydi
  if (props.initial?.bannerUrl) {
    removeBannerFlag.value = true
  }
}
</script>

<template>
  <form class="conf-form" novalidate @submit="onSubmit">
    <div class="conf-form__field">
      <label class="conf-form__label">Banner rasmi (ixtiyoriy)</label>

      <input
        ref="bannerInput"
        type="file"
        class="conf-form__file"
        accept="image/*"
        @change="onBannerChange"
      />

      <div
        v-if="currentBannerUrl"
        class="banner-preview"
        :style="{ backgroundImage: `url(${currentBannerUrl})` }"
      >
        <div class="banner-preview__actions">
          <BaseButton
            type="button"
            variant="secondary"
            size="sm"
            @click="onPickBanner"
          >
            Almashtirish
          </BaseButton>
          <BaseButton
            type="button"
            variant="ghost"
            size="sm"
            @click="onClearBanner"
          >
            O'chirish
          </BaseButton>
        </div>
      </div>

      <button
        v-else
        type="button"
        class="banner-empty"
        @click="onPickBanner"
      >
        <IconBase :size="22">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </IconBase>
        <span>Banner rasm yuklash</span>
        <small>Tavsiya: 1600×600, JPG/PNG/WEBP, maks. 5 MB</small>
      </button>
    </div>

    <BaseInput
      v-model="form.title"
      label="Sarlavha"
      placeholder="Konferensiya nomini kiriting"
      :pill="false"
      :error="errors.title"
      required
    />

    <div class="conf-form__field">
      <label class="conf-form__label">
        Tavsif <span class="conf-form__req" aria-hidden="true">*</span>
      </label>
      <textarea
        v-model="form.description"
        class="conf-form__textarea"
        :class="{ 'conf-form__textarea--error': errors.description }"
        placeholder="Konferensiya haqida qisqacha ma'lumot..."
        rows="4"
        required
      />
      <p v-if="errors.description" class="conf-form__error">
        {{ errors.description }}
      </p>
    </div>

    <div class="conf-form__row">
      <BaseInput
        v-model="form.startDate"
        type="datetime-local"
        label="Boshlanish (sana va vaqt)"
        hint="Sana va vaqtni to'liq kiriting"
        :pill="false"
        :error="errors.startDate"
        required
      />
      <BaseInput
        v-model="form.endDate"
        type="datetime-local"
        label="Tugash (sana va vaqt)"
        hint="Sana va vaqtni to'liq kiriting"
        :pill="false"
        :error="errors.endDate"
        required
      />
    </div>

    <BaseInput
      v-model="form.location"
      label="Joy"
      placeholder="Konferensiya o'tkaziladigan manzil"
      :pill="false"
      :error="errors.location"
      required
    />

    <div class="conf-form__check">
      <input
        id="conf-online"
        v-model="form.isOnline"
        type="checkbox"
        class="conf-form__checkbox"
      />
      <label for="conf-online">Onlayn konferensiya</label>
    </div>

    <div class="conf-form__row">
      <BaseInput
        v-model="form.category"
        label="Kategoriya (ixtiyoriy)"
        placeholder="Yo'nalish nomi"
        :pill="false"
      />
      <BaseInput
        v-model="form.maxAttendees"
        type="number"
        label="Maksimal qatnashchilar (ixtiyoriy)"
        placeholder="500"
        :pill="false"
      />
    </div>

    <div v-if="mode === 'edit'" class="conf-form__field">
      <label class="conf-form__label" for="conf-status">Holat</label>
      <select
        id="conf-status"
        v-model="form.status"
        class="conf-form__select"
      >
        <option value="DRAFT">Qoralama</option>
        <option value="PUBLISHED">E'lon qilindi</option>
        <option value="ONGOING">Davom etmoqda</option>
        <option value="FINISHED">Tugadi</option>
        <option value="CANCELLED">Bekor qilindi</option>
      </select>
    </div>

    <div class="conf-form__actions">
      <BaseButton type="button" variant="secondary" size="md" @click="emit('cancel')">
        Bekor qilish
      </BaseButton>
      <BaseButton type="submit" variant="primary" size="md" :disabled="loading">
        {{
          loading
            ? 'Saqlanmoqda...'
            : mode === 'edit'
              ? "O'zgarishlarni saqlash"
              : 'Konferensiya yaratish'
        }}
      </BaseButton>
    </div>
  </form>
</template>

<style scoped>
.conf-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conf-form__row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .conf-form__row {
    grid-template-columns: 1fr 1fr;
  }
}

.conf-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.conf-form__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.conf-form__req {
  color: var(--color-error);
  margin-left: 2px;
}

.conf-form__textarea,
.conf-form__select {
  width: 100%;
  font-family: var(--font-sans);
  font-size: 15px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  color: var(--color-text);
  outline: none;
  transition:
    border-color 0.2s var(--ease-out-soft),
    box-shadow 0.2s var(--ease-out-soft);
}

.conf-form__textarea {
  resize: vertical;
  min-height: 100px;
}

.conf-form__textarea:focus,
.conf-form__select:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(24, 226, 153, 0.15);
}

.conf-form__textarea--error {
  border-color: var(--color-error);
}

.conf-form__error {
  font-size: 13px;
  color: var(--color-error);
}

.conf-form__check {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.conf-form__checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--color-brand);
}

.conf-form__file {
  display: none;
}

.banner-preview {
  position: relative;
  aspect-ratio: 16 / 6;
  border-radius: var(--radius-lg);
  background-size: cover;
  background-position: center;
  background-color: var(--color-bg-muted);
  border: 1px solid var(--color-border-subtle);
  overflow: hidden;
}

.banner-preview__actions {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  padding: 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.45));
}

.banner-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  aspect-ratio: 16 / 5;
  background: var(--color-bg-subtle);
  border: 2px dashed var(--color-border-medium);
  border-radius: var(--radius-lg);
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition:
    border-color 0.2s var(--ease-out-soft),
    background 0.2s var(--ease-out-soft),
    color 0.2s var(--ease-out-soft);
}

.banner-empty:hover {
  border-color: var(--color-brand);
  background: var(--color-brand-light);
  color: var(--color-brand-deep);
}

.banner-empty small {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-muted);
}

.conf-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
}
</style>

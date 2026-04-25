<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { usersApi } from '@/services/users'
import { useToast } from '@/composables/useToast'
import { extractApiError } from '@/services/api'
import type { CreateSessionInput, Session, User } from '@/types'

const props = defineProps<{
  conferenceId: string
  initial?: Session | null
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: CreateSessionInput]
  cancel: []
}>()

const toLocalInput = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const form = reactive({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  room: '',
  virtualLink: '',
  speakerId: '',
})

const errors = reactive<Record<string, string>>({})

const speakers = ref<User[]>([])
const loadingSpeakers = ref(false)
const toast = useToast()

const fetchSpeakers = async () => {
  loadingSpeakers.value = true
  try {
    speakers.value = await usersApi.speakers()
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    loadingSpeakers.value = false
  }
}

onMounted(fetchSpeakers)

watch(
  () => props.initial,
  (val) => {
    if (!val) {
      form.title = ''
      form.description = ''
      form.startTime = ''
      form.endTime = ''
      form.room = ''
      form.virtualLink = ''
      form.speakerId = ''
      return
    }
    form.title = val.title
    form.description = val.description
    form.startTime = toLocalInput(val.startTime)
    form.endTime = toLocalInput(val.endTime)
    form.room = val.room ?? ''
    form.virtualLink = val.virtualLink ?? ''
    form.speakerId = val.speakerId ?? ''
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
  if (form.description.trim().length < 3)
    errors.description = "Tavsif kamida 3 belgi bo'lishi kerak"

  if (!form.startTime || !isValidDateTime(form.startTime))
    errors.startTime = "Sana va vaqtni to'liq kiriting (masalan: 09:00)"

  if (!form.endTime || !isValidDateTime(form.endTime))
    errors.endTime = "Sana va vaqtni to'liq kiriting (masalan: 10:30)"

  if (
    isValidDateTime(form.startTime) &&
    isValidDateTime(form.endTime)
  ) {
    const s = new Date(form.startTime).getTime()
    const e = new Date(form.endTime).getTime()
    if (e <= s) errors.endTime = "Tugash vaqti boshlanishdan keyin bo'lishi kerak"
  }
  return Object.keys(errors).length === 0
}

const onSubmit = (e: Event) => {
  e.preventDefault()
  if (!validate()) return

  // Bo'sh string null sifatida yuboriladi — backend qiymatni tozalashi uchun
  const payload: CreateSessionInput = {
    conferenceId: props.conferenceId,
    title: form.title.trim(),
    description: form.description.trim(),
    startTime: new Date(form.startTime).toISOString(),
    endTime: new Date(form.endTime).toISOString(),
    room: form.room.trim() || null,
    virtualLink: form.virtualLink.trim() || null,
    speakerId: form.speakerId || null,
  }

  emit('submit', payload)
}
</script>

<template>
  <form class="sess-form" novalidate @submit="onSubmit">
    <BaseInput
      v-model="form.title"
      label="Sessiya sarlavhasi"
      placeholder="Sessiya nomini kiriting"
      :pill="false"
      :error="errors.title"
      required
    />

    <div class="sess-form__field">
      <label class="sess-form__label">Tavsif</label>
      <textarea
        v-model="form.description"
        class="sess-form__textarea"
        :class="{ 'sess-form__textarea--error': errors.description }"
        rows="3"
        placeholder="Sessiya haqida qisqacha"
        required
      />
      <p v-if="errors.description" class="sess-form__error">
        {{ errors.description }}
      </p>
    </div>

    <div class="sess-form__row">
      <BaseInput
        v-model="form.startTime"
        type="datetime-local"
        label="Boshlanish (sana va vaqt)"
        hint="Vaqtni ham kiriting (masalan: 09:00)"
        :pill="false"
        :error="errors.startTime"
        required
      />
      <BaseInput
        v-model="form.endTime"
        type="datetime-local"
        label="Tugash (sana va vaqt)"
        hint="Vaqtni ham kiriting"
        :pill="false"
        :error="errors.endTime"
        required
      />
    </div>

    <div class="sess-form__field">
      <label class="sess-form__label" for="sess-speaker">
        Ma'ruzachi (ixtiyoriy)
      </label>
      <select
        id="sess-speaker"
        v-model="form.speakerId"
        class="sess-form__select"
        :disabled="loadingSpeakers"
      >
        <option value="">— Ma'ruzachi tanlang —</option>
        <option v-for="s in speakers" :key="s.id" :value="s.id">
          {{ s.name }} · {{ s.email }}
        </option>
      </select>
      <p v-if="!loadingSpeakers && speakers.length === 0" class="sess-form__hint">
        Hech qanday ma'ruzachi topilmadi. Avval admin foydalanuvchini SPEAKER
        qilib qo'shsin.
      </p>
    </div>

    <div class="sess-form__row">
      <BaseInput
        v-model="form.room"
        label="Xona (ixtiyoriy)"
        placeholder="Xona nomi yoki raqami"
        :pill="false"
      />
      <BaseInput
        v-model="form.virtualLink"
        label="Onlayn havola (ixtiyoriy)"
        placeholder="Onlayn uchrashuv havolasi"
        :pill="false"
      />
    </div>

    <div class="sess-form__actions">
      <BaseButton type="button" variant="secondary" size="md" @click="emit('cancel')">
        Bekor qilish
      </BaseButton>
      <BaseButton type="submit" variant="primary" size="md" :disabled="loading">
        {{ loading ? 'Saqlanmoqda...' : initial ? "O'zgartirish" : "Sessiya qo'shish" }}
      </BaseButton>
    </div>
  </form>
</template>

<style scoped>
.sess-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sess-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sess-form__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.sess-form__textarea {
  width: 100%;
  font-family: var(--font-sans);
  font-size: 15px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  color: var(--color-text);
  outline: none;
  resize: vertical;
}

.sess-form__textarea:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(24, 226, 153, 0.15);
}

.sess-form__textarea--error {
  border-color: var(--color-error);
}

.sess-form__select {
  width: 100%;
  font-family: var(--font-sans);
  font-size: 15px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  color: var(--color-text);
  outline: none;
  cursor: pointer;
}

.sess-form__select:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(24, 226, 153, 0.15);
}

.sess-form__select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sess-form__error {
  font-size: 13px;
  color: var(--color-error);
}

.sess-form__hint {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.45;
}

.sess-form__row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 640px) {
  .sess-form__row {
    grid-template-columns: 1fr 1fr;
  }
}

.sess-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

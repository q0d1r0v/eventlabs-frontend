<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { CreateUserInput, UpdateUserInput } from '@/services/users'
import type { User, UserRole } from '@/types'

const props = defineProps<{
  initial?: User | null
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: CreateUserInput | UpdateUserInput]
  cancel: []
}>()

const isEdit = () => Boolean(props.initial)

const form = reactive({
  email: '',
  name: '',
  password: '',
  role: 'PARTICIPANT' as UserRole,
  bio: '',
  isVerified: true,
})

const errors = reactive<Record<string, string>>({})

watch(
  () => props.initial,
  (val) => {
    Object.keys(errors).forEach((k) => delete errors[k])
    if (!val) {
      form.email = ''
      form.name = ''
      form.password = ''
      form.role = 'PARTICIPANT'
      form.bio = ''
      form.isVerified = true
      return
    }
    form.email = val.email
    form.name = val.name
    form.password = ''
    form.role = val.role
    form.bio = val.bio ?? ''
    form.isVerified = val.isVerified ?? true
  },
  { immediate: true },
)

const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Email noto'g'ri formatda"
  }
  if (form.name.trim().length < 2) {
    errors.name = "Ism kamida 2 belgi bo'lishi kerak"
  }
  if (!isEdit() && form.password.length < 8) {
    errors.password = "Parol kamida 8 belgi bo'lishi kerak"
  } else if (isEdit() && form.password && form.password.length < 8) {
    errors.password = "Yangi parol kamida 8 belgi bo'lishi kerak"
  }

  return Object.keys(errors).length === 0
}

const onSubmit = (e: Event) => {
  e.preventDefault()
  if (!validate()) return

  if (isEdit()) {
    const payload: UpdateUserInput = {
      email: form.email.trim(),
      name: form.name.trim(),
      role: form.role,
      bio: form.bio.trim() || undefined,
      isVerified: form.isVerified,
    }
    if (form.password) payload.password = form.password
    emit('submit', payload)
  } else {
    const payload: CreateUserInput = {
      email: form.email.trim(),
      name: form.name.trim(),
      password: form.password,
      role: form.role,
      bio: form.bio.trim() || undefined,
    }
    emit('submit', payload)
  }
}
</script>

<template>
  <form class="user-form" novalidate @submit="onSubmit">
    <BaseInput
      v-model="form.name"
      label="Ism va familiya"
      placeholder="To'liq ismni kiriting"
      :pill="false"
      :error="errors.name"
      required
    />

    <BaseInput
      v-model="form.email"
      label="Email"
      type="email"
      placeholder="Email manzilini kiriting"
      autocomplete="off"
      :pill="false"
      :error="errors.email"
      required
    />

    <BaseInput
      v-model="form.password"
      :label="isEdit() ? 'Yangi parol (ixtiyoriy)' : 'Parol'"
      :hint="isEdit() ? 'Bo\'sh qoldirsangiz, parol o\'zgarmaydi' : 'Kamida 8 belgi'"
      type="password"
      autocomplete="new-password"
      :pill="false"
      :error="errors.password"
      :required="!isEdit()"
    />

    <div class="user-form__field">
      <label class="user-form__label" for="user-role">Rol</label>
      <select id="user-role" v-model="form.role" class="user-form__select">
        <option value="ADMIN">Administrator</option>
        <option value="ORGANIZER">Tashkilotchi</option>
        <option value="SPEAKER">Ma'ruzachi</option>
        <option value="PARTICIPANT">Qatnashchi</option>
        <option value="GUEST">Mehmon</option>
      </select>
    </div>

    <div class="user-form__field">
      <label class="user-form__label" for="user-bio">Bio (ixtiyoriy)</label>
      <textarea
        id="user-bio"
        v-model="form.bio"
        class="user-form__textarea"
        rows="2"
        placeholder="Foydalanuvchi haqida qisqacha"
      />
    </div>

    <div v-if="isEdit()" class="user-form__check">
      <input
        id="user-verified"
        v-model="form.isVerified"
        type="checkbox"
        class="user-form__checkbox"
      />
      <label for="user-verified">Tasdiqlangan foydalanuvchi</label>
    </div>

    <div class="user-form__actions">
      <BaseButton type="button" variant="secondary" size="md" @click="emit('cancel')">
        Bekor qilish
      </BaseButton>
      <BaseButton type="submit" variant="primary" size="md" :disabled="loading">
        {{ loading ? 'Saqlanmoqda...' : isEdit() ? "O'zgarishlarni saqlash" : 'Yaratish' }}
      </BaseButton>
    </div>
  </form>
</template>

<style scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.user-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-form__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.user-form__select,
.user-form__textarea {
  width: 100%;
  font-family: var(--font-sans);
  font-size: 15px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.2s var(--ease-out-soft);
}

.user-form__textarea {
  resize: vertical;
  min-height: 60px;
}

.user-form__select:focus,
.user-form__textarea:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(24, 226, 153, 0.15);
}

.user-form__check {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.user-form__checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--color-brand);
}

.user-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
}
</style>

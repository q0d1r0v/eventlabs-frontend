<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconBase from '@/components/ui/IconBase.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { extractApiError } from '@/services/api'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const email = ref('')
const password = ref('')
const errors = ref<{ email?: string; password?: string; form?: string }>({})

const validate = () => {
  errors.value = {}
  if (!email.value) errors.value.email = 'Email majburiy'
  else if (!/^\S+@\S+\.\S+$/.test(email.value))
    errors.value.email = "Email noto'g'ri formatda"
  if (!password.value) errors.value.password = 'Parol majburiy'
  else if (password.value.length < 8)
    errors.value.password = "Parol kamida 8 belgi bo'lishi kerak"
  return Object.keys(errors.value).length === 0
}

const onSubmit = async (event: Event) => {
  event.preventDefault()
  if (!validate()) return

  try {
    const user = await auth.login(email.value, password.value)
    toast.success(`Xush kelibsiz, ${user.name}!`)

    const redirect =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    router.push(redirect)
  } catch (err) {
    errors.value.form = extractApiError(err)
    toast.error(errors.value.form)
  }
}
</script>

<template>
  <div class="auth-card">
    <div class="auth-card__head">
      <h1 class="auth-card__title">Tizimga kirish</h1>
      <p class="auth-card__sub">
        Konferensiyalarni boshqarish uchun hisobingizga kiring.
      </p>
    </div>

    <form class="auth-card__form" novalidate @submit="onSubmit">
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="Email manzilingiz"
        autocomplete="email"
        :pill="false"
        :error="errors.email"
        required
      />

      <BaseInput
        v-model="password"
        label="Parol"
        type="password"
        placeholder="Kamida 8 ta belgi"
        autocomplete="current-password"
        :pill="false"
        :error="errors.password"
        required
      />

      <p v-if="errors.form" class="auth-card__error" role="alert">
        {{ errors.form }}
      </p>

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        full-width
        :disabled="auth.loading"
      >
        {{ auth.loading ? 'Tekshirilmoqda...' : 'Kirish' }}
        <template v-if="!auth.loading" #trailing>
          <IconBase :size="16">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </IconBase>
        </template>
      </BaseButton>
    </form>

    <div class="auth-card__foot">
      Akkauntingiz yo'qmi?
      <router-link :to="{ name: 'register' }" class="auth-card__link">
        Ro'yxatdan o'tish
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 440px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
}

@media (max-width: 480px) {
  .auth-card {
    padding: 24px 20px;
    border-radius: var(--radius-lg);
  }
  .auth-card__title {
    font-size: 24px;
  }
}

.auth-card__head {
  margin-bottom: 24px;
  text-align: center;
}

.auth-card__title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.6px;
  color: var(--color-text);
  margin-bottom: 6px;
}

.auth-card__sub {
  font-size: 14px;
  color: var(--color-text-muted);
}

.auth-card__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-card__error {
  font-size: 13px;
  color: var(--color-error);
  background: var(--color-error-bg);
  padding: 10px 14px;
  border-radius: var(--radius-md);
}

.auth-card__foot {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted);
}

.auth-card__link {
  color: var(--color-brand-deep);
  font-weight: 500;
  margin-left: 4px;
}

.auth-card__link:hover {
  text-decoration: underline;
}
</style>

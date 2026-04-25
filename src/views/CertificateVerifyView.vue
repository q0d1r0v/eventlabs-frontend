<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseContainer from '@/components/ui/BaseContainer.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import IconBase from '@/components/ui/IconBase.vue'
import { certificatesApi } from '@/services/certificates'
import { useToast } from '@/composables/useToast'
import { extractApiError } from '@/services/api'
import { formatDate } from '@/composables/useFormatters'
import type { CertificateVerification } from '@/types'

const props = defineProps<{ code?: string }>()

const router = useRouter()
const toast = useToast()

const code = ref(props.code ?? '')
const result = ref<CertificateVerification | null>(null)
const checked = ref(false)
const loading = ref(false)

const verify = async (input?: string) => {
  const value = (input ?? code.value).trim()
  if (!value) return
  loading.value = true
  checked.value = false
  try {
    result.value = await certificatesApi.verify(value)
    checked.value = true
  } catch (err) {
    toast.error(extractApiError(err))
    result.value = { valid: false }
    checked.value = true
  } finally {
    loading.value = false
  }
}

const onSubmit = (e: Event) => {
  e.preventDefault()
  router.replace({ name: 'certificate-verify', params: { code: code.value.trim() } })
  verify(code.value)
}

watch(
  () => props.code,
  (val) => {
    if (val) {
      code.value = val
      verify(val)
    }
  },
)

onMounted(() => {
  if (props.code) verify(props.code)
})
</script>

<template>
  <main class="cert">
    <BaseContainer>
      <header class="cert__head">
        <span class="cert__eyebrow">Sertifikat</span>
        <h1 class="cert__title">Sertifikatni tekshirish</h1>
        <p class="cert__sub">
          Konferensiya tugagandan keyin berilgan sertifikatning haqiqiyligini
          aniqlang.
        </p>
      </header>

      <BaseCard variant="featured" class="cert__form-card">
        <form @submit="onSubmit">
          <BaseInput
            v-model="code"
            label="Sertifikat kodi"
            placeholder="Sertifikat kodini kiriting"
            :pill="false"
          >
            <template #leading>
              <IconBase :size="16">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </IconBase>
            </template>
          </BaseInput>
          <BaseButton
            type="submit"
            variant="primary"
            size="md"
            :disabled="loading || code.trim().length === 0"
          >
            {{ loading ? 'Tekshirilmoqda...' : 'Tekshirish' }}
          </BaseButton>
        </form>
      </BaseCard>

      <div v-if="checked" class="cert__result">
        <BaseCard
          v-if="result?.valid && result.certificate"
          variant="featured"
          class="cert__valid"
        >
          <div class="cert__icon cert__icon--valid">
            <IconBase :size="24">
              <polyline points="5 12 10 17 19 8" />
            </IconBase>
          </div>
          <h2>Sertifikat haqiqiy</h2>
          <dl class="cert__dl">
            <div>
              <dt>Egasi</dt>
              <dd>{{ result.certificate.user?.name ?? '—' }}</dd>
            </div>
            <div>
              <dt>Konferensiya</dt>
              <dd>{{ result.certificate.conference?.title ?? '—' }}</dd>
            </div>
            <div>
              <dt>Berilgan sana</dt>
              <dd>{{ formatDate(result.certificate.issuedAt) }}</dd>
            </div>
            <div>
              <dt>Kod</dt>
              <dd><code>{{ result.certificate.code }}</code></dd>
            </div>
          </dl>

          <div class="cert__download">
            <BaseButton
              variant="primary"
              size="md"
              :href="certificatesApi.downloadUrl(result.certificate.code)"
            >
              PDF yuklab olish
              <template #trailing>
                <IconBase :size="16">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </IconBase>
              </template>
            </BaseButton>
          </div>
        </BaseCard>

        <BaseCard v-else variant="featured" class="cert__invalid">
          <div class="cert__icon cert__icon--invalid">
            <IconBase :size="24">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </IconBase>
          </div>
          <h2>Sertifikat topilmadi</h2>
          <p>
            Bunday kod bilan sertifikat mavjud emas. Kodni qayta tekshirib
            ko'ring.
          </p>
        </BaseCard>
      </div>
    </BaseContainer>
  </main>
</template>

<style scoped>
.cert {
  padding-block: 48px 96px;
  min-height: calc(100svh - 64px);
}

.cert__head {
  margin-bottom: 24px;
  max-width: 640px;
}

.cert__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
}

.cert__title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 600;
  letter-spacing: -0.8px;
  margin-top: 8px;
  color: var(--color-text);
}

.cert__sub {
  margin-top: 8px;
  font-size: 16px;
  color: var(--color-text-muted);
}

.cert__form-card {
  max-width: 640px;
}

.cert__form-card form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
}

.cert__result {
  margin-top: 24px;
  max-width: 640px;
}

.cert__valid,
.cert__invalid {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.cert__icon {
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cert__icon--valid {
  background: var(--color-brand-light);
  color: var(--color-brand-deep);
}

.cert__icon--invalid {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.cert__valid h2,
.cert__invalid h2 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.4px;
  color: var(--color-text);
}

.cert__dl {
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-subtle);
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  width: 100%;
}

@media (min-width: 640px) {
  .cert__dl {
    grid-template-columns: 1fr 1fr;
  }
}

.cert__dl dt {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.cert__dl dd {
  margin: 4px 0 0;
  font-size: 15px;
  color: var(--color-text);
}

.cert__dl code {
  font-family: var(--font-mono);
  background: var(--color-bg-muted);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  word-break: break-all;
}

.cert__download {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-subtle);
  width: 100%;
  display: flex;
  justify-content: flex-start;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseContainer from '@/components/ui/BaseContainer.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import ConferenceForm from '@/components/conference/ConferenceForm.vue'
import { useConferencesStore } from '@/stores/conferences'
import { useToast } from '@/composables/useToast'
import { conferencesApi } from '@/services/conferences'
import { extractApiError } from '@/services/api'
import type {
  CreateConferenceInput,
  UpdateConferenceInput,
} from '@/types'

const router = useRouter()
const store = useConferencesStore()
const toast = useToast()

const loading = ref(false)

const onSubmit = async (
  payload: CreateConferenceInput | UpdateConferenceInput,
  bannerFile: File | null,
) => {
  loading.value = true
  try {
    const created = await store.create(payload as CreateConferenceInput)
    if (bannerFile) {
      try {
        await conferencesApi.uploadBanner(created.id, bannerFile)
      } catch (err) {
        toast.warning(
          `Konferensiya yaratildi, lekin banner yuklanmadi: ${extractApiError(err)}`,
        )
      }
    }
    toast.success('Konferensiya yaratildi')
    router.push({ name: 'conference-detail', params: { id: created.id } })
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  router.push({ name: 'conferences' })
}
</script>

<template>
  <main class="page">
    <BaseContainer>
      <header class="page__head">
        <span class="page__eyebrow">Tashkilotchi</span>
        <h1 class="page__title">Yangi konferensiya yaratish</h1>
        <p class="page__sub">
          Asosiy ma'lumotlarni kiriting. Sessiyalarni keyin qo'sha olasiz.
        </p>
      </header>

      <BaseCard variant="featured" class="page__card">
        <ConferenceForm
          mode="create"
          :loading="loading"
          @submit="onSubmit"
          @cancel="onCancel"
        />
      </BaseCard>
    </BaseContainer>
  </main>
</template>

<style scoped>
.page {
  padding-block: 48px 96px;
}

.page__head {
  margin-bottom: 24px;
  max-width: 720px;
}

.page__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
}

.page__title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 600;
  letter-spacing: -0.8px;
  margin-top: 8px;
  color: var(--color-text);
}

.page__sub {
  margin-top: 8px;
  font-size: 16px;
  color: var(--color-text-muted);
}

.page__card {
  max-width: 720px;
}
</style>

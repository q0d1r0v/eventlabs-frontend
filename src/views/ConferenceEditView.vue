<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseContainer from '@/components/ui/BaseContainer.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import ConferenceForm from '@/components/conference/ConferenceForm.vue'
import { useConferencesStore } from '@/stores/conferences'
import { useToast } from '@/composables/useToast'
import { conferencesApi } from '@/services/conferences'
import { extractApiError } from '@/services/api'
import type {
  Conference,
  CreateConferenceInput,
  UpdateConferenceInput,
} from '@/types'

const props = defineProps<{ id: string }>()

const router = useRouter()
const store = useConferencesStore()
const toast = useToast()

const initial = ref<Conference | null>(null)
const loading = ref(false)

const fetch = async () => {
  try {
    initial.value = await store.fetchOne(props.id)
  } catch (err) {
    toast.error(extractApiError(err))
    router.push({ name: 'conferences' })
  }
}

watch(() => props.id, fetch, { immediate: true })
onMounted(fetch)

const onSubmit = async (
  payload: CreateConferenceInput | UpdateConferenceInput,
  bannerFile: File | null,
  removeBanner: boolean,
) => {
  loading.value = true
  try {
    const updated = await store.update(props.id, payload as UpdateConferenceInput)
    if (bannerFile) {
      try {
        await conferencesApi.uploadBanner(updated.id, bannerFile)
      } catch (err) {
        toast.warning(
          `O'zgarishlar saqlandi, lekin banner yuklanmadi: ${extractApiError(err)}`,
        )
      }
    } else if (removeBanner && updated.bannerUrl) {
      try {
        await conferencesApi.removeBanner(updated.id)
      } catch (err) {
        toast.warning(
          `Bannerni olib tashlashda xatolik: ${extractApiError(err)}`,
        )
      }
    }
    toast.success("O'zgarishlar saqlandi")
    router.push({ name: 'conference-detail', params: { id: updated.id } })
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  router.push({ name: 'conference-detail', params: { id: props.id } })
}
</script>

<template>
  <main class="page">
    <BaseContainer>
      <header class="page__head">
        <span class="page__eyebrow">Tahrirlash</span>
        <h1 class="page__title">Konferensiyani tahrirlash</h1>
      </header>

      <BaseCard variant="featured" class="page__card">
        <p v-if="!initial" class="page__loading">Yuklanmoqda...</p>
        <ConferenceForm
          v-else
          mode="edit"
          :initial="initial"
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

.page__card {
  max-width: 720px;
}

.page__loading {
  text-align: center;
  padding: 32px;
  color: var(--color-text-muted);
}
</style>

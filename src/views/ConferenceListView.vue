<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import BaseContainer from '@/components/ui/BaseContainer.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconBase from '@/components/ui/IconBase.vue'
import ConferenceCard from '@/components/conference/ConferenceCard.vue'
import { useConferencesStore } from '@/stores/conferences'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { extractApiError } from '@/services/api'
import type { ConferenceStatus } from '@/types'

const store = useConferencesStore()
const auth = useAuthStore()
const toast = useToast()

const search = ref('')
const status = ref<ConferenceStatus | ''>('')

const statusOptions: { value: ConferenceStatus | ''; label: string }[] = [
  { value: '', label: 'Hammasi' },
  { value: 'PUBLISHED', label: "E'lon qilindi" },
  { value: 'ONGOING', label: 'Davom etmoqda' },
  { value: 'FINISHED', label: 'Tugadi' },
  { value: 'DRAFT', label: 'Qoralama' },
]

let timer: number | undefined

const fetch = async () => {
  try {
    await store.fetchAll({
      status: status.value || undefined,
      search: search.value || undefined,
    })
  } catch (err) {
    toast.error(extractApiError(err))
  }
}

watch([search, status], () => {
  if (timer) window.clearTimeout(timer)
  timer = window.setTimeout(fetch, 250)
})

onMounted(fetch)

const isEmpty = computed(
  () => !store.loading && store.items.length === 0,
)
</script>

<template>
  <main class="conf-list">
    <BaseContainer>
      <header class="conf-list__head">
        <div>
          <span class="conf-list__eyebrow">Konferensiyalar</span>
          <h1 class="conf-list__title">Yaqinlashayotgan tadbirlar</h1>
          <p class="conf-list__sub">
            Sizga mos keladigan konferensiyani toping va bir bosishda yoziling.
          </p>
        </div>

        <BaseButton
          v-if="auth.isOrganizer"
          variant="primary"
          size="md"
          to="/organizer/conferences/new"
        >
          Yangi konferensiya
          <template #trailing>
            <IconBase :size="14">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </IconBase>
          </template>
        </BaseButton>
      </header>

      <div class="conf-list__filters">
        <BaseInput
          v-model="search"
          placeholder="Sarlavha bo'yicha qidirish..."
          :pill="false"
        >
          <template #leading>
            <IconBase :size="16">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </IconBase>
          </template>
        </BaseInput>

        <div class="conf-list__chips" role="tablist">
          <button
            v-for="opt in statusOptions"
            :key="opt.value || 'all'"
            type="button"
            class="conf-list__chip"
            :class="{ 'conf-list__chip--active': status === opt.value }"
            @click="status = opt.value"
            role="tab"
            :aria-selected="status === opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <p v-if="store.loading" class="conf-list__state">Yuklanmoqda...</p>

      <div v-else-if="isEmpty" class="conf-list__empty">
        <h3>Konferensiya topilmadi</h3>
        <p>Boshqa filter yoki qidiruv so'zini sinab ko'ring.</p>
      </div>

      <div v-else class="conf-list__grid">
        <ConferenceCard
          v-for="c in store.items"
          :key="c.id"
          :conference="c"
        />
      </div>
    </BaseContainer>
  </main>
</template>

<style scoped>
.conf-list {
  padding-block: 48px 96px;
  min-height: calc(100svh - 64px);
}

.conf-list__head {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}

.conf-list__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
}

.conf-list__title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 600;
  letter-spacing: -0.8px;
  margin-top: 8px;
  color: var(--color-text);
}

.conf-list__sub {
  margin-top: 8px;
  font-size: 16px;
  color: var(--color-text-muted);
  max-width: 560px;
}

.conf-list__filters {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 32px;
}

@media (min-width: 768px) {
  .conf-list__filters {
    grid-template-columns: 1fr auto;
    align-items: center;
  }
}

@media (max-width: 640px) {
  .conf-list__head {
    flex-direction: column;
    align-items: stretch;
  }
  .conf-list__chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    margin-inline: -4px;
    padding: 4px;
  }
  .conf-list__chip {
    flex-shrink: 0;
  }
}

.conf-list__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.conf-list__chip {
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: 9999px;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background 0.2s var(--ease-out-soft),
    border-color 0.2s var(--ease-out-soft),
    color 0.2s var(--ease-out-soft);
}

.conf-list__chip:hover {
  border-color: var(--color-border-medium);
}

.conf-list__chip--active {
  background: var(--color-text);
  color: #ffffff;
  border-color: var(--color-text);
}

.conf-list__state {
  text-align: center;
  padding: 64px 24px;
  color: var(--color-text-muted);
}

.conf-list__empty {
  text-align: center;
  padding: 64px 24px;
  border: 1px dashed var(--color-border-medium);
  border-radius: var(--radius-xl);
}

.conf-list__empty h3 {
  font-size: 18px;
  margin-bottom: 6px;
  color: var(--color-text);
}

.conf-list__empty p {
  font-size: 14px;
  color: var(--color-text-muted);
}

.conf-list__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 640px) {
  .conf-list__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .conf-list__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

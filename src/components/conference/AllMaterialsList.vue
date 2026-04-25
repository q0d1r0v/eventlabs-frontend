<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import IconBase from '@/components/ui/IconBase.vue'
import { useToast } from '@/composables/useToast'
import { formatBytes, formatRelativeTime, formatTime } from '@/composables/useFormatters'
import { materialsApi } from '@/services/materials'
import { buildUploadsUrl, extractApiError } from '@/services/api'
import type { Material, Session } from '@/types'

const props = defineProps<{
  sessions: Session[]
}>()

const emit = defineEmits<{
  select: [sessionId: string]
}>()

const toast = useToast()

const bySession = ref<Record<string, Material[]>>({})
const loading = ref(false)

const fetchAll = async () => {
  if (props.sessions.length === 0) {
    bySession.value = {}
    return
  }
  loading.value = true
  const next: Record<string, Material[]> = {}
  try {
    await Promise.all(
      props.sessions.map(async (s) => {
        try {
          next[s.id] = await materialsApi.bySession(s.id)
        } catch {
          next[s.id] = []
        }
      }),
    )
    bySession.value = next
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    loading.value = false
  }
}

watch(
  () => props.sessions.map((s) => s.id).join(','),
  fetchAll,
  { immediate: true },
)

const totalCount = computed(() =>
  Object.values(bySession.value).reduce((sum, arr) => sum + arr.length, 0),
)

const sessionsWithMaterials = computed(() =>
  props.sessions
    .map((s) => ({
      session: s,
      materials: bySession.value[s.id] ?? [],
    }))
    .filter((x) => x.materials.length > 0)
    .sort(
      (a, b) =>
        new Date(a.session.startTime).getTime() -
        new Date(b.session.startTime).getTime(),
    ),
)

const fileTypeLabel = (mime: string): string => {
  if (mime.includes('pdf')) return 'PDF'
  if (mime.includes('presentation') || mime.includes('powerpoint')) return 'PPT'
  if (mime.includes('word') || mime.includes('document')) return 'DOC'
  if (mime.includes('zip')) return 'ZIP'
  if (mime.startsWith('image/')) return 'IMG'
  return 'FILE'
}
</script>

<template>
  <section class="all-materials">
    <header class="all-materials__head">
      <div>
        <h3 class="all-materials__title">Barcha materiallar</h3>
        <p class="all-materials__sub">
          Konferensiya bo'yicha yuklangan barcha taqdimot va hujjatlar
        </p>
      </div>
      <span class="all-materials__count">{{ totalCount }} ta fayl</span>
    </header>

    <p v-if="loading" class="all-materials__state">Yuklanmoqda...</p>

    <div
      v-else-if="totalCount === 0"
      class="all-materials__empty"
    >
      Hali hech qaysi sessiyaga material yuklanmagan.
    </div>

    <div v-else class="all-materials__groups">
      <div
        v-for="group in sessionsWithMaterials"
        :key="group.session.id"
        class="group"
      >
        <button
          type="button"
          class="group__head"
          @click="emit('select', group.session.id)"
        >
          <div>
            <span class="group__time">
              {{ formatTime(group.session.startTime) }}
            </span>
            <h4 class="group__title">{{ group.session.title }}</h4>
          </div>
          <span class="group__chev">
            <IconBase :size="14">
              <polyline points="9 18 15 12 9 6" />
            </IconBase>
          </span>
        </button>

        <ul class="group__list">
          <li v-for="m in group.materials" :key="m.id" class="material">
            <span class="material__type">{{ fileTypeLabel(m.fileType) }}</span>
            <a
              :href="buildUploadsUrl(m.fileUrl)"
              target="_blank"
              rel="noopener"
              class="material__name"
              :title="m.fileName"
            >
              {{ m.fileName }}
            </a>
            <span class="material__meta">
              {{ formatBytes(m.fileSize ?? 0) }}
              <template v-if="m.createdAt">
                · {{ formatRelativeTime(m.createdAt) }}
              </template>
            </span>
            <a
              :href="buildUploadsUrl(m.fileUrl)"
              target="_blank"
              rel="noopener"
              download
              class="material__action"
              aria-label="Yuklab olish"
            >
              <IconBase :size="14">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </IconBase>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.all-materials {
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.all-materials__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.all-materials__title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-text);
}

.all-materials__sub {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.all-materials__count {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
  background: var(--color-brand-light);
  padding: 4px 12px;
  border-radius: 9999px;
  white-space: nowrap;
}

.all-materials__state,
.all-materials__empty {
  text-align: center;
  padding: 24px;
  color: var(--color-text-muted);
  font-size: 14px;
  border: 1px dashed var(--color-border-subtle);
  border-radius: var(--radius-lg);
}

.all-materials__groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.group__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: var(--color-bg-subtle);
  border: 0;
  padding: 12px 16px;
  cursor: pointer;
  text-align: left;
  border-bottom: 1px solid var(--color-border-subtle);
}

.group__head:hover {
  background: var(--color-bg-muted);
}

.group__time {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.group__title {
  margin-top: 2px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.1px;
}

.group__chev {
  color: var(--color-text-muted);
}

.group__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.material {
  display: grid;
  grid-template-columns: 44px 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border-subtle);
  font-size: 13px;
}

.material:last-child {
  border-bottom: none;
}

.material__type {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
  background: var(--color-brand-light);
  border-radius: var(--radius-sm);
  padding: 4px 0;
  text-align: center;
}

.material__name {
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.material__name:hover {
  color: var(--color-brand-deep);
  text-decoration: underline;
}

.material__meta {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.4px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.material__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
}

.material__action:hover {
  background: var(--color-bg-muted);
  color: var(--color-text);
}
</style>

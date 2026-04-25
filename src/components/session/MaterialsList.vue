<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconBase from '@/components/ui/IconBase.vue'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { formatBytes, formatRelativeTime } from '@/composables/useFormatters'
import { materialsApi } from '@/services/materials'
import { buildUploadsUrl, extractApiError } from '@/services/api'
import type { Material } from '@/types'

const props = defineProps<{
  sessionId: string
  canManage?: boolean
}>()

const toast = useToast()
const confirm = useConfirm()

const items = ref<Material[]>([])
const loading = ref(false)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

const fetchItems = async () => {
  loading.value = true
  try {
    items.value = await materialsApi.bySession(props.sessionId)
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    loading.value = false
  }
}

watch(() => props.sessionId, fetchItems, { immediate: true })

const onPickFiles = () => fileInput.value?.click()

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  await upload(input.files[0])
  input.value = ''
}

const onDrop = async (event: DragEvent) => {
  dragOver.value = false
  if (!props.canManage) return
  const file = event.dataTransfer?.files?.[0]
  if (file) await upload(file)
}

const upload = async (file: File) => {
  if (file.size > 25 * 1024 * 1024) {
    toast.error("Fayl 25 MB dan oshmasligi kerak")
    return
  }
  uploading.value = true
  try {
    const created = await materialsApi.upload(props.sessionId, file)
    items.value = [created, ...items.value]
    toast.success(`"${created.fileName}" yuklandi`)
  } catch (err) {
    toast.error(extractApiError(err))
  } finally {
    uploading.value = false
  }
}

const onRemove = async (material: Material) => {
  const ok = await confirm({
    title: "Materialni o'chirish",
    message: `"${material.fileName}" faylini o'chirmoqchimisiz?`,
    confirmLabel: "O'chirish",
    danger: true,
  })
  if (!ok) return
  try {
    await materialsApi.remove(material.id)
    items.value = items.value.filter((m) => m.id !== material.id)
    toast.info("Material o'chirildi")
  } catch (err) {
    toast.error(extractApiError(err))
  }
}

const fileTypeLabel = (mime: string): string => {
  if (mime.includes('pdf')) return 'PDF'
  if (mime.includes('presentation') || mime.includes('powerpoint')) return 'PPT'
  if (mime.includes('word') || mime.includes('document')) return 'DOC'
  if (mime.includes('zip')) return 'ZIP'
  if (mime.startsWith('image/')) return 'IMG'
  return 'FILE'
}

const ordered = computed(() =>
  [...items.value].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
  ),
)
</script>

<template>
  <section class="materials">
    <header class="materials__head">
      <div>
        <h3 class="materials__title">Materiallar</h3>
        <p class="materials__sub">
          Taqdimot fayllari, hujjatlar va boshqa resurslar
        </p>
      </div>
      <BaseButton
        v-if="canManage"
        variant="primary"
        size="sm"
        :disabled="uploading"
        @click="onPickFiles"
      >
        <template #leading>
          <IconBase :size="14">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </IconBase>
        </template>
        {{ uploading ? 'Yuklanmoqda...' : "Fayl qo'shish" }}
      </BaseButton>
    </header>

    <input
      ref="fileInput"
      type="file"
      class="materials__input"
      accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,image/*"
      @change="onFileChange"
    />

    <div
      v-if="canManage"
      class="materials__drop"
      :class="{ 'materials__drop--over': dragOver }"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
      @click="onPickFiles"
    >
      <IconBase :size="20">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </IconBase>
      <span>
        Faylni shu joyga sudrab tashlang yoki <strong>tanlash</strong> uchun bosing
      </span>
      <small>PDF, PPT, DOC, ZIP yoki rasm · maks. 25 MB</small>
    </div>

    <p v-if="loading" class="materials__state">Yuklanmoqda...</p>

    <div v-else-if="ordered.length === 0" class="materials__empty">
      Hali material yuklanmagan.
    </div>

    <ul v-else class="materials__list">
      <li v-for="m in ordered" :key="m.id" class="material">
        <span class="material__type">{{ fileTypeLabel(m.fileType) }}</span>
        <div class="material__body">
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
            <template v-if="m.createdAt"> · {{ formatRelativeTime(m.createdAt) }}</template>
          </span>
        </div>
        <div class="material__actions">
          <a
            :href="buildUploadsUrl(m.fileUrl)"
            target="_blank"
            rel="noopener"
            download
            class="material__action"
            aria-label="Yuklab olish"
          >
            <IconBase :size="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </IconBase>
          </a>
          <button
            v-if="canManage"
            type="button"
            class="material__action material__action--danger"
            aria-label="O'chirish"
            @click="onRemove(m)"
          >
            <IconBase :size="16">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
            </IconBase>
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.materials {
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.materials__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.materials__title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-text);
}

.materials__sub {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.materials__input {
  display: none;
}

.materials__drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px;
  border: 2px dashed var(--color-border-medium);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
  color: var(--color-text-muted);
  cursor: pointer;
  text-align: center;
  font-size: 14px;
  transition:
    border-color 0.2s var(--ease-out-soft),
    background 0.2s var(--ease-out-soft),
    color 0.2s var(--ease-out-soft);
}

.materials__drop:hover,
.materials__drop--over {
  border-color: var(--color-brand);
  background: var(--color-brand-light);
  color: var(--color-brand-deep);
}

.materials__drop strong {
  color: var(--color-brand-deep);
  text-decoration: underline;
}

.materials__drop small {
  font-size: 11px;
  color: var(--color-text-muted);
}

.materials__state,
.materials__empty {
  text-align: center;
  padding: 24px;
  color: var(--color-text-muted);
  font-size: 14px;
  border: 1px dashed var(--color-border-subtle);
  border-radius: var(--radius-lg);
}

.materials__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.material {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
  transition: border-color 0.2s var(--ease-out-soft);
}

.material:hover {
  border-color: var(--color-border-medium);
}

.material__type {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--color-brand-deep);
  background: var(--color-brand-light);
  border-radius: var(--radius-md);
  padding: 6px 0;
  text-align: center;
}

.material__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.material__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.material__name:hover {
  color: var(--color-brand-deep);
  text-decoration: underline;
}

.material__meta {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.4px;
  color: var(--color-text-muted);
}

.material__actions {
  display: flex;
  gap: 4px;
}

.material__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  cursor: pointer;
  text-decoration: none;
  transition:
    background 0.2s var(--ease-out-soft),
    color 0.2s var(--ease-out-soft);
}

.material__action:hover {
  background: var(--color-bg-muted);
  color: var(--color-text);
}

.material__action--danger:hover {
  background: var(--color-error-bg);
  color: var(--color-error);
}
</style>

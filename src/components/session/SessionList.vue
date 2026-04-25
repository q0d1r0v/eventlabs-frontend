<script setup lang="ts">
import IconBase from '@/components/ui/IconBase.vue'
import { formatDate, formatTime } from '@/composables/useFormatters'
import type { Session } from '@/types'

defineProps<{
  sessions: Session[]
  activeId?: string | null
  manageable?: boolean
}>()

defineEmits<{
  select: [id: string]
  edit: [id: string]
  remove: [id: string]
}>()
</script>

<template>
  <div v-if="sessions.length === 0" class="sess-empty">
    <p>Hali sessiya yo'q.</p>
  </div>

  <ul v-else class="sess-list">
    <li
      v-for="s in sessions"
      :key="s.id"
      class="sess"
      :class="{ 'sess--active': activeId === s.id }"
    >
      <button
        type="button"
        class="sess__main"
        :aria-pressed="activeId === s.id"
        @click="$emit('select', s.id)"
      >
        <div class="sess__time">
          <span class="sess__day">{{ formatDate(s.startTime) }}</span>
          <span class="sess__hours">
            {{ formatTime(s.startTime) }} – {{ formatTime(s.endTime) }}
          </span>
        </div>

        <div class="sess__body">
          <h4 class="sess__title">{{ s.title }}</h4>
          <p class="sess__desc">{{ s.description }}</p>
          <div class="sess__meta">
            <span v-if="s.speaker" class="sess__chip">
              <IconBase :size="12">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </IconBase>
              {{ s.speaker.name }}
            </span>
            <span v-if="s.room" class="sess__chip">
              <IconBase :size="12">
                <path d="M3 21V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13" />
                <path d="M9 21V12h6v9" />
              </IconBase>
              {{ s.room }}
            </span>
            <a
              v-if="s.virtualLink"
              :href="s.virtualLink"
              target="_blank"
              rel="noopener"
              class="sess__chip sess__chip--link"
              @click.stop
            >
              <IconBase :size="12">
                <rect x="2" y="4" width="20" height="14" rx="2" />
                <polygon points="10,9 15,12 10,15" />
              </IconBase>
              Onlayn
            </a>
          </div>
        </div>
      </button>

      <div v-if="manageable" class="sess__actions">
        <button
          type="button"
          class="sess__action"
          aria-label="Tahrirlash"
          @click="$emit('edit', s.id)"
        >
          <IconBase :size="14">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
          </IconBase>
        </button>
        <button
          type="button"
          class="sess__action sess__action--danger"
          aria-label="O'chirish"
          @click="$emit('remove', s.id)"
        >
          <IconBase :size="14">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
          </IconBase>
        </button>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.sess-empty {
  padding: 32px;
  text-align: center;
  color: var(--color-text-muted);
  border: 1px dashed var(--color-border-medium);
  border-radius: var(--radius-lg);
  font-size: 14px;
}

.sess-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sess {
  display: flex;
  align-items: stretch;
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition:
    border-color 0.2s var(--ease-out-soft),
    box-shadow 0.2s var(--ease-out-soft);
}

.sess:hover {
  border-color: var(--color-border-medium);
}

.sess--active {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(24, 226, 153, 0.12);
}

.sess__main {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 16px;
  padding: 16px;
  background: transparent;
  border: 0;
  text-align: left;
  cursor: pointer;
  flex: 1;
}

.sess__time {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 16px;
  border-right: 1px solid var(--color-border-subtle);
}

.sess__day {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.sess__hours {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.sess__title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-text);
  margin-bottom: 4px;
}

.sess__desc {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-bottom: 8px;
}

.sess__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sess__chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
  border-radius: 9999px;
  font-size: 12px;
  text-decoration: none;
}

.sess__chip--link {
  background: var(--color-brand-light);
  color: var(--color-brand-deep);
}

.sess__actions {
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--color-border-subtle);
}

.sess__action {
  background: transparent;
  border: 0;
  padding: 8px 12px;
  color: var(--color-text-muted);
  cursor: pointer;
  flex: 1;
}

.sess__action:hover {
  color: var(--color-text);
  background: var(--color-bg-muted);
}

.sess__action--danger:hover {
  color: var(--color-error);
  background: var(--color-error-bg);
}

@media (max-width: 640px) {
  .sess__main {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .sess__time {
    flex-direction: row;
    gap: 12px;
    padding-right: 0;
    border-right: none;
    align-items: center;
  }
}
</style>

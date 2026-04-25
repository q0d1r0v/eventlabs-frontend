<script setup lang="ts">
import { computed } from 'vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import IconBase from '@/components/ui/IconBase.vue'
import { formatRange, formatStatus } from '@/composables/useFormatters'
import { buildUploadsUrl } from '@/services/api'
import type { BadgeTone, Conference } from '@/types'

const props = defineProps<{
  conference: Conference
}>()

const statusTone = (status: Conference['status']): BadgeTone => {
  switch (status) {
    case 'PUBLISHED':
      return 'brand'
    case 'ONGOING':
      return 'brand'
    case 'FINISHED':
      return 'neutral'
    case 'CANCELLED':
      return 'error'
    default:
      return 'info'
  }
}

const banner = computed(() =>
  props.conference.bannerUrl
    ? buildUploadsUrl(props.conference.bannerUrl)
    : null,
)

const sessionsCount = computed(
  () =>
    props.conference._count?.sessions ?? props.conference.sessions?.length,
)
const registrationsCount = computed(
  () => props.conference._count?.registrations,
)
</script>

<template>
  <router-link
    :to="{ name: 'conference-detail', params: { id: conference.id } }"
    class="conf-card"
  >
    <div
      class="conf-card__banner"
      :class="{ 'conf-card__banner--placeholder': !banner }"
      :style="banner ? { backgroundImage: `url('${banner}')` } : undefined"
    >
      <BaseBadge :tone="statusTone(conference.status)" mono class="conf-card__status">
        {{ formatStatus(conference.status) }}
      </BaseBadge>
    </div>

    <div class="conf-card__body">
      <h3 class="conf-card__title">{{ conference.title }}</h3>
      <p class="conf-card__desc">{{ conference.description }}</p>

      <div class="conf-card__meta">
        <span class="conf-card__meta-item">
          <IconBase :size="14">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </IconBase>
          {{ formatRange(conference.startDate, conference.endDate) }}
        </span>
        <span class="conf-card__meta-item">
          <IconBase :size="14">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </IconBase>
          {{ conference.isOnline ? 'Onlayn' : conference.location }}
        </span>
      </div>

      <div v-if="sessionsCount !== undefined || registrationsCount !== undefined" class="conf-card__stats">
        <span v-if="sessionsCount !== undefined">
          {{ sessionsCount }} sessiya
        </span>
        <span v-if="registrationsCount !== undefined">
          {{ registrationsCount }} qatnashchi
        </span>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.conf-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition:
    border-color 0.2s var(--ease-out-soft),
    transform 0.2s var(--ease-out-soft),
    box-shadow 0.2s var(--ease-out-soft);
  height: 100%;
}

.conf-card:hover {
  border-color: var(--color-border-medium);
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
}

.conf-card__banner {
  position: relative;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, var(--color-brand-light), #fff);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.conf-card__banner--placeholder {
  background:
    radial-gradient(circle at 30% 20%, rgba(24, 226, 153, 0.3), transparent 60%),
    radial-gradient(circle at 80% 80%, rgba(15, 167, 110, 0.2), transparent 60%),
    var(--color-brand-light);
}

.conf-card__status {
  position: absolute;
  top: 12px;
  left: 12px;
}

.conf-card__body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.conf-card__title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-text);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.conf-card__desc {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.conf-card__meta {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-subtle);
}

.conf-card__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.conf-card__meta-item :deep(svg) {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.conf-card__stats {
  display: flex;
  gap: 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding-top: 8px;
}
</style>

const dateFormatter = new Intl.DateTimeFormat('uz-UZ', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const dateShort = new Intl.DateTimeFormat('uz-UZ', {
  day: '2-digit',
  month: 'short',
})

const timeFormatter = new Intl.DateTimeFormat('uz-UZ', {
  hour: '2-digit',
  minute: '2-digit',
})

const dateTimeFormatter = new Intl.DateTimeFormat('uz-UZ', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const safeDate = (input: string | Date): Date | null => {
  const d = input instanceof Date ? input : new Date(input)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDate(input: string | Date): string {
  const d = safeDate(input)
  return d ? dateFormatter.format(d) : ''
}

export function formatDateShort(input: string | Date): string {
  const d = safeDate(input)
  return d ? dateShort.format(d) : ''
}

export function formatTime(input: string | Date): string {
  const d = safeDate(input)
  return d ? timeFormatter.format(d) : ''
}

export function formatDateTime(input: string | Date): string {
  const d = safeDate(input)
  return d ? dateTimeFormatter.format(d) : ''
}

export function formatRange(
  start: string | Date,
  end: string | Date,
): string {
  const s = safeDate(start)
  const e = safeDate(end)
  if (!s || !e) return ''
  const sameDay =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate()
  if (sameDay) {
    return `${formatDate(s)} · ${formatTime(s)}–${formatTime(e)}`
  }
  return `${formatDate(s)} → ${formatDate(e)}`
}

export function formatRelativeTime(input: string | Date): string {
  const d = safeDate(input)
  if (!d) return ''
  const diff = Date.now() - d.getTime()
  const sec = Math.round(diff / 1000)
  if (sec < 60) return `${sec} sek oldin`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} daqiqa oldin`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} soat oldin`
  const days = Math.round(hr / 24)
  if (days < 30) return `${days} kun oldin`
  return formatDate(d)
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let value = bytes
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i += 1
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Qoralama',
  PUBLISHED: "E'lon qilindi",
  ONGOING: 'Davom etmoqda',
  FINISHED: 'Tugadi',
  CANCELLED: 'Bekor qilindi',
  PENDING: 'Kutilmoqda',
  CONFIRMED: 'Tasdiqlandi',
  ATTENDED: 'Qatnashdi',
}

export function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  ORGANIZER: 'Tashkilotchi',
  SPEAKER: "Ma'ruzachi",
  PARTICIPANT: 'Qatnashchi',
  GUEST: 'Mehmon',
}

export function formatRole(role: string): string {
  return ROLE_LABELS[role] ?? role
}

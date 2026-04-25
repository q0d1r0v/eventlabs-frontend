import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const STORAGE_PREFIX = 'eventlab.upvotes.'

const buildKey = (userId: string, sessionId: string) =>
  `${STORAGE_PREFIX}${userId}:${sessionId}`

const loadFromStorage = (key: string): Set<string> => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

const saveToStorage = (key: string, voted: Set<string>) => {
  try {
    localStorage.setItem(key, JSON.stringify([...voted]))
  } catch {
    // quota exceeded — ignore
  }
}

/**
 * Bir foydalanuvchining bitta sessiyadagi savollar uchun upvote'larini
 * lokal saqlaydi. Backend dublikat ovozlarni hisoblamaslik uchun bu
 * frontend himoyasi sifatida ishlatiladi.
 */
export function useUpvotes(sessionId: () => string) {
  const auth = useAuthStore()
  const voted = ref<Set<string>>(new Set())

  const key = computed(() => {
    const uid = auth.user?.id ?? 'guest'
    return buildKey(uid, sessionId())
  })

  watch(
    key,
    (newKey) => {
      voted.value = loadFromStorage(newKey)
    },
    { immediate: true },
  )

  const has = (questionId: string) => voted.value.has(questionId)

  const mark = (questionId: string) => {
    if (voted.value.has(questionId)) return false
    voted.value = new Set([...voted.value, questionId])
    saveToStorage(key.value, voted.value)
    return true
  }

  return { voted, has, mark }
}

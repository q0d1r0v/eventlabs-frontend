import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Notification } from '@/types'
import { notificationsApi } from '@/services/notifications'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<Notification[]>([])
  const unread = ref(0)
  const loading = ref(false)

  const ordered = computed(() =>
    [...items.value].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  )

  const fetchAll = async () => {
    loading.value = true
    try {
      items.value = await notificationsApi.list()
      unread.value = items.value.filter((n) => !n.isRead).length
    } finally {
      loading.value = false
    }
  }

  const refreshUnread = async () => {
    try {
      const result = (await notificationsApi.unreadCount()) as
        | { count: number }
        | number
      const count =
        typeof result === 'number' ? result : Number(result?.count ?? 0)
      unread.value = Number.isFinite(count) ? count : 0
    } catch {
      // silent
    }
  }

  const markAsRead = async (id: string) => {
    const updated = await notificationsApi.markAsRead(id)
    items.value = items.value.map((n) => (n.id === id ? updated : n))
    unread.value = Math.max(0, unread.value - 1)
  }

  const markAllAsRead = async () => {
    await notificationsApi.markAllAsRead()
    items.value = items.value.map((n) => ({ ...n, isRead: true }))
    unread.value = 0
  }

  const prepend = (n: Notification) => {
    items.value = [n, ...items.value]
    if (!n.isRead) unread.value += 1
  }

  const reset = () => {
    items.value = []
    unread.value = 0
  }

  return {
    items,
    ordered,
    unread,
    loading,
    fetchAll,
    refreshUnread,
    markAsRead,
    markAllAsRead,
    prepend,
    reset,
  }
})

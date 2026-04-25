import api from './api'
import type { Notification, UnreadCountResponse } from '@/types'

export const notificationsApi = {
  list: () => api.get<Notification[]>('/notifications').then((r) => r.data),

  unreadCount: () =>
    api
      .get<UnreadCountResponse>('/notifications/unread-count')
      .then((r) => r.data),

  markAsRead: (id: string) =>
    api.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    api.patch<{ success: true }>('/notifications/read-all').then((r) => r.data),
}

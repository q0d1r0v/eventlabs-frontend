import api from './api'
import type { CreateSessionInput, Session, UpdateSessionInput } from '@/types'

export const sessionsApi = {
  byConference: (conferenceId: string) =>
    api
      .get<Session[]>(`/sessions/conference/${conferenceId}`)
      .then((r) => r.data),

  byId: (id: string) => api.get<Session>(`/sessions/${id}`).then((r) => r.data),

  create: (payload: CreateSessionInput) =>
    api.post<Session>('/sessions', payload).then((r) => r.data),

  update: (id: string, payload: UpdateSessionInput) =>
    api.patch<Session>(`/sessions/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.delete<{ success: true }>(`/sessions/${id}`).then((r) => r.data),
}

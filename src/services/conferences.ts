import api from './api'
import type {
  Conference,
  ConferenceStatus,
  CreateConferenceInput,
  UpdateConferenceInput,
} from '@/types'

export const conferencesApi = {
  list: (params: { status?: ConferenceStatus; search?: string } = {}) =>
    api.get<Conference[]>('/conferences', { params }).then((r) => r.data),

  byId: (id: string) =>
    api.get<Conference>(`/conferences/${id}`).then((r) => r.data),

  create: (payload: CreateConferenceInput) =>
    api.post<Conference>('/conferences', payload).then((r) => r.data),

  update: (id: string, payload: UpdateConferenceInput) =>
    api.patch<Conference>(`/conferences/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.delete<{ success: true }>(`/conferences/${id}`).then((r) => r.data),

  uploadBanner: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    // Headers'ni qo'lda bermaymiz — axios FormData uchun boundary bilan
    // to'g'ri Content-Type'ni o'zi qo'yadi
    return api
      .post<Conference>(`/conferences/${id}/banner`, form)
      .then((r) => r.data)
  },

  removeBanner: (id: string) =>
    api
      .delete<Conference>(`/conferences/${id}/banner`)
      .then((r) => r.data),
}

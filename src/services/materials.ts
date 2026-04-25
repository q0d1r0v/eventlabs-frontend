import api from './api'
import type { Material } from '@/types'

export const materialsApi = {
  bySession: (sessionId: string) =>
    api.get<Material[]>(`/materials/session/${sessionId}`).then((r) => r.data),

  upload: (sessionId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    form.append('sessionId', sessionId)
    // Axios FormData uchun boundary bilan Content-Type'ni o'zi qo'yadi
    return api.post<Material>('/materials/upload', form).then((r) => r.data)
  },

  remove: (id: string) =>
    api.delete<{ success: true }>(`/materials/${id}`).then((r) => r.data),
}

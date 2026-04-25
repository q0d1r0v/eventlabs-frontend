import api from './api'
import type { Registration } from '@/types'

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const registrationsApi = {
  mine: () => api.get<Registration[]>('/registrations/me').then((r) => r.data),

  byConference: (conferenceId: string) =>
    api
      .get<Registration[]>(`/registrations/conference/${conferenceId}`)
      .then((r) => r.data),

  register: (conferenceId: string) =>
    api
      .post<Registration>(`/registrations/conference/${conferenceId}`)
      .then((r) => r.data),

  cancel: (conferenceId: string) =>
    api
      .delete<{ success: true }>(`/registrations/conference/${conferenceId}`)
      .then((r) => r.data),

  byTicketCode: (code: string) =>
    api
      .get<Registration>(`/registrations/ticket/${code}`)
      .then((r) => r.data),

  ticketDownloadUrl: (code: string) =>
    `${apiBase}/registrations/ticket/${code}/download`,
}

import api from './api'
import type { Certificate, CertificateVerification } from '@/types'

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const certificatesApi = {
  verify: (code: string) =>
    api
      .get<CertificateVerification>(`/certificates/verify/${code}`)
      .then((r) => r.data),

  mine: () => api.get<Certificate[]>('/certificates/me').then((r) => r.data),

  issue: (conferenceId: string) =>
    api
      .post<Certificate>(`/certificates/issue/${conferenceId}`)
      .then((r) => r.data),

  /** Sertifikat PDF'i uchun yuklab olish URL'i (Content-Disposition bilan). */
  downloadUrl: (code: string) => `${apiBase}/certificates/download/${code}`,
}

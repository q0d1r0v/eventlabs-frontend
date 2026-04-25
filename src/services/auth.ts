import api from './api'
import type { AuthResponse, RefreshResponse, User } from '@/types'

export const authApi = {
  register: (payload: { email: string; password: string; name: string }) =>
    api.post<AuthResponse>('/auth/register', payload).then((r) => r.data),

  login: (payload: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', payload).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api
      .post<RefreshResponse>('/auth/refresh', { refreshToken })
      .then((r) => r.data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }).then((r) => r.data),

  me: () => api.get<User>('/users/me').then((r) => r.data),
}

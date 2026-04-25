import api from './api'
import type { User, UserRole } from '@/types'

export interface CreateUserInput {
  email: string
  name: string
  password: string
  role?: UserRole
  bio?: string
}

export interface UpdateUserInput {
  email?: string
  name?: string
  password?: string
  role?: UserRole
  bio?: string
  isVerified?: boolean
}

export const usersApi = {
  me: () => api.get<User>('/users/me').then((r) => r.data),
  list: () => api.get<User[]>('/users').then((r) => r.data),
  speakers: () => api.get<User[]>('/users/speakers').then((r) => r.data),
  byId: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),
  create: (payload: CreateUserInput) =>
    api.post<User>('/users', payload).then((r) => r.data),
  update: (id: string, payload: UpdateUserInput) =>
    api.patch<User>(`/users/${id}`, payload).then((r) => r.data),
  remove: (id: string) =>
    api.delete<{ success: true }>(`/users/${id}`).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<User>('/users/me/avatar', form).then((r) => r.data)
  },

  removeAvatar: () =>
    api.delete<User>('/users/me/avatar').then((r) => r.data),
}

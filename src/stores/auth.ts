import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthTokens, User, UserRole } from '@/types'
import { authApi } from '@/services/auth'
import { tokenStorage } from '@/services/api'
import { resetSocket } from '@/services/socket'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(tokenStorage.getAccess())
  const refreshToken = ref<string | null>(tokenStorage.getRefresh())
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  const hasRole = (...roles: UserRole[]) =>
    Boolean(user.value && roles.includes(user.value.role))

  const isAdmin = computed(() => hasRole('ADMIN'))
  const isOrganizer = computed(() => hasRole('ADMIN', 'ORGANIZER'))
  const isSpeaker = computed(() => hasRole('SPEAKER'))

  const setTokens = (tokens: AuthTokens) => {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    tokenStorage.set(tokens)
  }

  const setUser = (u: User) => {
    user.value = u
  }

  const reset = () => {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    tokenStorage.clear()
    resetSocket()
  }

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const data = await authApi.login({ email, password })
      setTokens(data.tokens)
      setUser(data.user)
      return data.user
    } finally {
      loading.value = false
    }
  }

  const register = async (payload: {
    name: string
    email: string
    password: string
  }) => {
    loading.value = true
    error.value = null
    try {
      const data = await authApi.register(payload)
      setTokens(data.tokens)
      setUser(data.user)
      return data.user
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    const token = refreshToken.value
    reset()
    if (token) {
      await authApi.logout(token).catch(() => null)
    }
  }

  const fetchMe = async () => {
    if (!accessToken.value) {
      initialized.value = true
      return null
    }
    try {
      const me = await authApi.me()
      setUser(me)
      return me
    } catch {
      reset()
      return null
    } finally {
      initialized.value = true
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    initialized,
    error,
    isAuthenticated,
    isAdmin,
    isOrganizer,
    isSpeaker,
    hasRole,
    login,
    register,
    logout,
    fetchMe,
    reset,
  }
})

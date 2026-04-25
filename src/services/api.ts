import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { AuthTokens, RefreshResponse } from '@/types'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const ACCESS_TOKEN_KEY = 'eventlab.access_token'
export const REFRESH_TOKEN_KEY = 'eventlab.refresh_token'

export const tokenStorage = {
  getAccess: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (tokens: AuthTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (!config.headers) config.headers = new AxiosHeaders()
  const headers = config.headers as AxiosHeaders

  const token = tokenStorage.getAccess()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // FormData uchun Content-Type'ni o'chirib tashlaymiz — xhr boundary bilan
  // to'g'ri Content-Type'ni o'zi qo'yadi (multipart/form-data; boundary=...).
  if (config.data instanceof FormData) {
    headers.delete('Content-Type')
  }

  return config
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let isRefreshing = false
let waitingQueue: Array<(token: string | null) => void> = []
let onUnauthorized: (() => void) | null = null

export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

const flushQueue = (token: string | null) => {
  waitingQueue.forEach((resolver) => resolver(token))
  waitingQueue = []
}

const refreshTokens = async (): Promise<string | null> => {
  const refreshToken = tokenStorage.getRefresh()
  if (!refreshToken) return null

  try {
    const { data } = await axios.post<RefreshResponse>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15_000 },
    )
    tokenStorage.set(data.tokens)
    return data.tokens.accessToken
  } catch {
    tokenStorage.clear()
    return null
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined
    const status = error.response?.status

    if (status !== 401 || !original || original._retry) {
      return Promise.reject(error)
    }

    const url = original.url ?? ''
    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waitingQueue.push((token) => {
          if (!token) {
            reject(error)
            return
          }
          if (!original.headers) original.headers = new AxiosHeaders()
          ;(original.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`)
          resolve(api(original))
        })
      })
    }

    isRefreshing = true
    const newToken = await refreshTokens()
    isRefreshing = false
    flushQueue(newToken)

    if (!newToken) {
      onUnauthorized?.()
      return Promise.reject(error)
    }

    if (!original.headers) original.headers = new AxiosHeaders()
    ;(original.headers as AxiosHeaders).set('Authorization', `Bearer ${newToken}`)
    return api(original)
  },
)

export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined
    const msg = data?.message
    if (Array.isArray(msg)) return msg.join(', ')
    if (typeof msg === 'string') return msg
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return "Noma'lum xatolik yuz berdi"
}

export function buildUploadsUrl(path: string): string {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  const base = import.meta.env.VITE_UPLOADS_URL ?? 'http://localhost:3000'
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

export type { AxiosRequestConfig }
export default api

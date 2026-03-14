import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { normalizeApiError } from '@/utils/apiError'

const REQUEST_CACHE_TTL_MS = 1000 * 60

type CachedResponse = {
  timestamp: number
  status: number
  statusText: string
  headers: Record<string, string>
  data: unknown
}

const responseCache = new Map<string, CachedResponse>()

function getCacheKey(config: InternalAxiosRequestConfig) {
  const baseURL = config.baseURL ?? ''
  const url = config.url ?? ''
  const params = config.params ? JSON.stringify(config.params) : ''
  return `${config.method ?? 'get'}:${baseURL}${url}?${params}`
}

function cloneCachedResponse(cached: CachedResponse, config: InternalAxiosRequestConfig): AxiosResponse {
  return {
    data: cached.data,
    status: cached.status,
    statusText: cached.statusText,
    headers: cached.headers,
    config,
  }
}

function isCacheableGetRequest(config: InternalAxiosRequestConfig) {
  const method = (config.method ?? 'get').toLowerCase()
  const cacheHeader = config.headers?.['x-skip-cache']
  return method === 'get' && cacheHeader !== '1'
}

function getTokenFromCookie(): string | null {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'token') {
      return value
    }
  }
  return null
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const tokenFromStore = useAuthStore.getState().token
  const tokenFromCookie = getTokenFromCookie()
  const token = tokenFromCookie ?? tokenFromStore

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const method = (config.method ?? 'get').toLowerCase()

  if (isCacheableGetRequest(config)) {
    const cacheKey = getCacheKey(config)
    ;(config as InternalAxiosRequestConfig & { _cacheKey?: string })._cacheKey = cacheKey

    const cached = responseCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < REQUEST_CACHE_TTL_MS) {
      config.adapter = async () => cloneCachedResponse(cached, config)
      return config
    }

  }

  if (method !== 'get') {
    responseCache.clear()
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    const config = response.config as InternalAxiosRequestConfig & { _cacheKey?: string }
    const method = (config.method ?? 'get').toLowerCase()

    if (method === 'get' && config._cacheKey) {
      responseCache.set(config._cacheKey, {
        timestamp: Date.now(),
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        data: response.data,
      })
    }

    return response
  },
  (error) => {
    const normalizedError = normalizeApiError(error)

    const status = error?.response?.status
    const method = String(error?.config?.method ?? 'get').toUpperCase()
    const url = String(error?.config?.url ?? '')

    console.error('[API_ERROR]', {
      status,
      method,
      url,
      message: normalizedError.message,
      requestId: normalizedError.requestId,
      code: normalizedError.code,
    })

    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(normalizedError)
  }
)

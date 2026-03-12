import axios from 'axios'

const DEFAULT_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.'

type ErrorPayload = {
  message?: string
  error?: string
  details?: unknown
  errors?: Array<{ message?: string } | string>
  code?: string
}

export interface NormalizedApiError extends Error {
  status?: number
  code?: string
  details?: unknown
  requestId?: string
}

function extractMessage(payload: unknown): string | undefined {
  if (!payload) return undefined
  if (typeof payload === 'string') return payload

  if (typeof payload === 'object') {
    const data = payload as ErrorPayload
    if (typeof data.message === 'string' && data.message.trim()) return data.message
    if (typeof data.error === 'string' && data.error.trim()) return data.error
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0]
      if (typeof first === 'string') return first
      if (first && typeof first.message === 'string') return first.message
    }
  }

  return undefined
}

function fallbackByStatus(status?: number): string {
  if (status === 400) return 'Requisicao invalida. Verifique os dados enviados.'
  if (status === 401) return 'Sua sessao expirou. Faca login novamente.'
  if (status === 403) return 'Voce nao tem permissao para esta acao.'
  if (status === 404) return 'Recurso nao encontrado.'
  if (status === 409) return 'Conflito de dados. Atualize e tente novamente.'
  if (status && status >= 500) return 'Erro interno do servidor. Tente novamente em instantes.'
  return DEFAULT_MESSAGE
}

export function normalizeApiError(error: unknown, fallbackMessage?: string): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const requestId = error.response?.headers?.['x-request-id'] as string | undefined
    const payload = error.response?.data
    const code = typeof payload === 'object' && payload && 'code' in payload ? String((payload as { code?: unknown }).code) : undefined
    const message = extractMessage(payload) ?? fallbackMessage ?? fallbackByStatus(status)

    const normalized = new Error(message) as NormalizedApiError
    normalized.name = 'ApiError'
    normalized.status = status
    normalized.code = code
    normalized.details = payload
    normalized.requestId = requestId
    return normalized
  }

  if (error instanceof Error) return error as NormalizedApiError

  const normalized = new Error(fallbackMessage ?? DEFAULT_MESSAGE) as NormalizedApiError
  normalized.name = 'ApiError'
  return normalized
}

export function getErrorMessage(error: unknown, fallbackMessage?: string) {
  return normalizeApiError(error, fallbackMessage).message
}

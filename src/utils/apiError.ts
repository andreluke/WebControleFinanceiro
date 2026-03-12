import axios from 'axios'

const DEFAULT_MESSAGE = 'Algo deu errado. Tente novamente mais tarde.'

const ERROR_MESSAGES: Record<string, string> = {
  'Erro ao buscar usuário': 'E-mail ou senha incorretos.',
  'Erro ao verificar email': 'E-mail ou senha incorretos.',
  'Credenciais inválidas': 'E-mail ou senha incorretos.',
  'E-mail já cadastrado': 'Este e-mail já está cadastrado.',
  'Este e-mail já está cadastrado': 'Este e-mail já está cadastrado.',
  'Algo deu errado': 'Algo deu errado. Tente novamente mais tarde.',
  'Erro de conexão com o banco de dados': 'Serviço temporariamente indisponível. Tente novamente.',
  'Erro ao processar sua solicitação': 'Algo deu errado. Tente novamente.',
}

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

  console.log('Extracting message from payload:', payload)

  if (Array.isArray(payload)) {
    if (payload.length > 0) {
      const first = payload[0]
      if (typeof first === 'string') return first
      if (typeof first === 'object' && first !== null && 'message' in first) {
        return String((first as { message: unknown }).message)
      }
    }
    return undefined
  }

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
  if (status === 400) return 'Dados inválidos. Verifique os campos obrigatórios.'
  if (status === 401) return 'Sua sessão expirou. Faça login novamente.'
  if (status === 403) return 'Você não tem permissão para realizar esta ação.'
  if (status === 404) return 'Registro não encontrado.'
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
    let message = extractMessage(payload) ?? fallbackMessage ?? fallbackByStatus(status)

    // Map backend messages to friendly messages
    if (message && message in ERROR_MESSAGES) {
      message = ERROR_MESSAGES[message]
    }

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

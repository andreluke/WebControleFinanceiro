import { toast } from '@/hooks/use-toast'
import { normalizeApiError } from '@/utils/apiError'

const dedupeWindowMs = 2500
const errorToastTimestamps = new Map<string, number>()

interface NotifyErrorOptions {
  title?: string
  fallbackMessage?: string
  dedupeKey?: string
}

export function notifyErrorToast(error: unknown, options: NotifyErrorOptions = {}) {
  const normalized = normalizeApiError(error, options.fallbackMessage)
  if (normalized.status === 401) return

  const dedupeKey = options.dedupeKey ?? `${normalized.status ?? 'unknown'}:${normalized.message}`
  const now = Date.now()
  const last = errorToastTimestamps.get(dedupeKey)

  if (last && now - last < dedupeWindowMs) return

  errorToastTimestamps.set(dedupeKey, now)

  toast({
    title: options.title ?? 'Erro',
    description: normalized.message,
    variant: 'destructive',
  })
}

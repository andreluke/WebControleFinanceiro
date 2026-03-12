import { api } from '@/services/api'
import type {
  RecurringTransaction,
  ListRecurringTransactionsParams,
  CreateRecurringTransactionInput,
} from '@/types/recurring'

function normalizeRecurring(r: RecurringTransaction & { amount: string | number }): RecurringTransaction {
  return {
    ...r,
    amount: Number(r.amount),
  }
}

export const RecurringService = {
  list: async (params?: ListRecurringTransactionsParams) => {
    const response = await api.get<RecurringTransaction[]>('/recurring', { params })
    return response.data.map((item) => normalizeRecurring(item as RecurringTransaction & { amount: string | number }))
  },

  getById: async (id: string) => {
    const response = await api.get<RecurringTransaction>(`/recurring/${id}`)
    return normalizeRecurring(response.data as RecurringTransaction & { amount: string | number })
  },

  create: async (body: CreateRecurringTransactionInput) => {
    const response = await api.post<RecurringTransaction>('/recurring', body)
    return normalizeRecurring(response.data as RecurringTransaction & { amount: string | number })
  },

  update: async (id: string, body: Partial<CreateRecurringTransactionInput>) => {
    const response = await api.put<RecurringTransaction>(`/recurring/${id}`, body)
    return normalizeRecurring(response.data as RecurringTransaction & { amount: string | number })
  },

  toggle: async (id: string) => {
    const response = await api.patch<RecurringTransaction>(`/recurring/${id}/toggle`)
    return normalizeRecurring(response.data as RecurringTransaction & { amount: string | number })
  },

  remove: async (id: string) => {
    await api.delete(`/recurring/${id}`)
  },

  process: async (id: string) => {
    const response = await api.post<RecurringTransaction>(`/recurring/${id}/process`)
    return normalizeRecurring(response.data as RecurringTransaction & { amount: string | number })
  },
}

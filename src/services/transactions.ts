import { api } from '@/services/api'
import type {
  CreateTransactionInput,
  ListTransactionsParams,
  ListTransactionsResponse,
  Transaction,
} from '@/types/transaction'

function normalizeTransaction(t: Transaction & { amount: number | string }): Transaction {
  return {
    ...t,
    amount: Number(t.amount),
  }
}

export const TransactionService = {
  list: async (params: ListTransactionsParams) => {
    const response = await api.get<ListTransactionsResponse>('/transactions', { params })
    return {
      ...response.data,
      data: response.data.data.map((item) => normalizeTransaction(item as Transaction & { amount: number | string })),
    }
  },

  getById: async (id: string) => {
    const response = await api.get<Transaction>(`/transactions/${id}`)
    return normalizeTransaction(response.data as Transaction & { amount: number | string })
  },

  create: async (body: CreateTransactionInput) => {
    const response = await api.post<Transaction>('/transactions', body)
    return normalizeTransaction(response.data as Transaction & { amount: number | string })
  },

  update: async (id: string, body: Partial<CreateTransactionInput>) => {
    const response = await api.put<Transaction>(`/transactions/${id}`, body)
    return normalizeTransaction(response.data as Transaction & { amount: number | string })
  },

  remove: async (id: string) => {
    await api.delete(`/transactions/${id}`)
  },
}

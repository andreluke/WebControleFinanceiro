import { api } from '@/services/api'
import type { Budget, BudgetSummary, CreateBudgetInput, UpdateBudgetInput } from '@/types/budget'

export interface BudgetQueryParams {
  month?: number
  year?: number
}

export const BudgetsService = {
  list: async (params?: BudgetQueryParams) => {
    const response = await api.get<BudgetSummary>('/budgets', { params })
    return response.data
  },

  create: async (body: CreateBudgetInput) => {
    const response = await api.post<Budget>('/budgets', body)
    return response.data
  },

  update: async (id: string, body: UpdateBudgetInput) => {
    const response = await api.put<Budget>(`/budgets/${id}`, body)
    return response.data
  },

  toggleActive: async (id: string) => {
    const response = await api.patch<Budget>(`/budgets/${id}/toggle`)
    return response.data
  },

  remove: async (id: string) => {
    await api.delete(`/budgets/${id}`)
  },
}

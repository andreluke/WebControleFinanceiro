import { api } from '@/services/api'
import type { CategorySummary, MonthlySummary, Summary, SummaryPeriod } from '@/types/summary'

export const SummaryService = {
  getSummary: async (params?: { month?: string; period?: SummaryPeriod }) => {
    const response = await api.get<Summary>('/summary', { params })
    return response.data
  },

  getMonthly: async () => {
    const response = await api.get<MonthlySummary[]>('/summary/monthly')
    return response.data
  },

  getByCategory: async (params?: { month?: string; period?: SummaryPeriod; type?: 'income' | 'expense' }) => {
    const response = await api.get<CategorySummary[]>('/summary/by-category', { params })
    return response.data
  },
}

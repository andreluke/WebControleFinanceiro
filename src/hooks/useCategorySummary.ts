import { useQuery } from '@tanstack/react-query'
import { SummaryService } from '@/services/summary'
import type { SummaryPeriod } from '@/types/summary'

export function useCategorySummary(params?: { month?: string; period?: SummaryPeriod; type?: 'income' | 'expense' }) {
  return useQuery({
    queryKey: ['summary-by-category', params],
    queryFn: () => SummaryService.getByCategory(params),
    staleTime: 1000 * 60 * 5,
  })
}

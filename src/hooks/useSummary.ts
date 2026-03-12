import { useQuery } from '@tanstack/react-query'
import { SummaryService } from '@/services/summary'
import type { SummaryPeriod } from '@/types/summary'

export function useSummary(params?: { month?: string; period?: SummaryPeriod }) {
  return useQuery({
    queryKey: ['summary', params],
    queryFn: () => SummaryService.getSummary(params),
    staleTime: 1000 * 60 * 5,
  })
}

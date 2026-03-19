import { useQuery } from '@tanstack/react-query'
import { SummaryService, type ForecastParams } from '@/services/summary'
import type { SummaryPeriod } from '@/types/summary'

export function useSummary(params?: { month?: string; period?: SummaryPeriod }) {
  return useQuery({
    queryKey: ['summary', params],
    queryFn: () => SummaryService.getSummary(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useForecast(params?: ForecastParams) {
  return useQuery({
    queryKey: ['forecast', params],
    queryFn: () => SummaryService.getForecast(params),
    staleTime: 1000 * 60 * 5,
  })
}

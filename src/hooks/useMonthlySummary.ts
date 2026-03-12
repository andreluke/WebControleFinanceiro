import { useQuery } from '@tanstack/react-query'
import { SummaryService } from '@/services/summary'

export function useMonthlySummary() {
  return useQuery({
    queryKey: ['summary-monthly'],
    queryFn: SummaryService.getMonthly,
    staleTime: 1000 * 60 * 5,
  })
}

import type { PeriodKey } from "@/components/PeriodSelector"
import { format, subMonths } from "date-fns"

export function monthFromPeriod(period: PeriodKey, specificMonth?: string): string | undefined {
  const now = new Date()
  
  if (period === 'specific' && specificMonth) {
    return specificMonth
  }
  
  if (period === 'previous') {
    return format(subMonths(now, 1), 'yyyy-MM')
  }
  
  if (period === 'month') {
    return format(now, 'yyyy-MM')
  }
  
  return undefined
}


export function extractMonthYearFromParam(periodParam: string | null): { month?: string } {
  if (periodParam && periodParam.includes('-')) {
    return { month: periodParam }
  }
  return {}
}
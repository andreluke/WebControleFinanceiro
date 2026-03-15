import { useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import type { TransactionType } from '@/types/transaction'

export type TypeFilter = TransactionType | 'all'
export type MonthFilter = 'all' | 'current' | 'previous' | 'two_months_ago' | 'specific'

export interface TransactionFilters {
  query: string
  type: TypeFilter
  period: MonthFilter
  specificMonth?: string
  page: number
  new: boolean
}

export function useTransactionFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const periodParam = searchParams.get('period')
  
  const filters: TransactionFilters = {
    query: searchParams.get('q') ?? '',
    type: (searchParams.get('type') === 'income' || searchParams.get('type') === 'expense') 
      ? searchParams.get('type') as TransactionType 
      : 'all',
    period: (periodParam === 'all' || 
            periodParam === 'current' || 
            periodParam === 'previous' || 
            periodParam === 'two_months_ago')
      ? periodParam as MonthFilter
      : periodParam?.includes('-')
        ? 'specific'
        : 'current',
    specificMonth: periodParam?.includes('-') ? periodParam : undefined,
    page: Math.floor(Number(searchParams.get('page') ?? '1')),
    new: searchParams.get('new') === '1',
  }

  function update(updates: Record<string, string | number | null>) {
    const next = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all' || value === 'current') {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
    })

    setSearchParams(next, { replace: true })
  }

  function updatePeriod(period: string, specificMonth?: string) {
    const next = new URLSearchParams(searchParams)
    
    if (period === 'specific') {
      if (specificMonth) {
        next.set('period', specificMonth)
      } else {
        next.set('period', format(new Date(), 'yyyy-MM'))
      }
    } else if (period === 'all' || period === 'current') {
      next.delete('period')
    } else {
      next.set('period', period)
    }
    
    setSearchParams(next, { replace: true })
  }

  return { filters, update, updatePeriod }
}

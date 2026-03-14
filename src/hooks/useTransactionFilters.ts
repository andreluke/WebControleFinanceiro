import { useSearchParams } from 'react-router-dom'
import type { TransactionType } from '@/types/transaction'

export type TypeFilter = TransactionType | 'all'
export type MonthFilter = 'all' | 'current' | 'previous' | 'two_months_ago'

export interface TransactionFilters {
  query: string
  type: TypeFilter
  period: MonthFilter
  page: number
  new: boolean
}

export function useTransactionFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters: TransactionFilters = {
    query: searchParams.get('q') ?? '',
    type: (searchParams.get('type') === 'income' || searchParams.get('type') === 'expense') 
      ? searchParams.get('type') as TransactionType 
      : 'all',
    period: (searchParams.get('period') === 'all' || 
            searchParams.get('period') === 'current' || 
            searchParams.get('period') === 'previous' || 
            searchParams.get('period') === 'two_months_ago')
      ? searchParams.get('period') as MonthFilter
      : 'current',
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

  return { filters, update }
}

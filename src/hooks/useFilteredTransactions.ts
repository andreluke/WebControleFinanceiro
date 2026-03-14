import { useMemo } from 'react'
import type { Transaction } from '@/types/transaction'

export function useFilteredTransactions(transactions: Transaction[], query: string) {
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return transactions

    return transactions.filter((t) =>
      t.description.toLowerCase().includes(q) ||
      t.subDescription?.toLowerCase().includes(q) ||
      t.category?.name.toLowerCase().includes(q)
    )
  }, [transactions, query])
}

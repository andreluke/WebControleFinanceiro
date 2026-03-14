import { useMemo } from 'react'

interface UsePaginationResult {
  totalPages: number
  effectivePage: number
}

export function usePagination(totalItems: number, page: number, pageSize: number): UsePaginationResult {
  return useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    const effectivePage = Math.min(page, totalPages)
    return { totalPages, effectivePage }
  }, [totalItems, page, pageSize])
}

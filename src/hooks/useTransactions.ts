import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TransactionService } from '@/services/transactions'
import type { CreateTransactionInput, ListTransactionsParams } from '@/types/transaction'

export function useTransactions(params: ListTransactionsParams) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => TransactionService.list(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateTransactionInput) => TransactionService.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['summary-monthly'] })
      queryClient.invalidateQueries({ queryKey: ['summary-by-category'] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TransactionService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['summary-monthly'] })
      queryClient.invalidateQueries({ queryKey: ['summary-by-category'] })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CreateTransactionInput> }) => TransactionService.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['summary-monthly'] })
      queryClient.invalidateQueries({ queryKey: ['summary-by-category'] })
    },
  })
}

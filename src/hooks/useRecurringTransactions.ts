import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RecurringService } from '@/services/recurring'
import type { CreateRecurringTransactionInput, ListRecurringTransactionsParams } from '@/types/recurring'

export function useRecurringTransactions(params?: ListRecurringTransactionsParams) {
  return useQuery({
    queryKey: ['recurring', params],
    queryFn: () => RecurringService.list(params),
  })
}

export function useRecurringTransaction(id: string) {
  return useQuery({
    queryKey: ['recurring', id],
    queryFn: () => RecurringService.getById(id),
    enabled: !!id,
  })
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateRecurringTransactionInput) => RecurringService.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
    },
  })
}

export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CreateRecurringTransactionInput> }) =>
      RecurringService.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
    },
  })
}

export function useToggleRecurringTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => RecurringService.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
    },
  })
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => RecurringService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
    },
  })
}

export function useProcessRecurringTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => RecurringService.process(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

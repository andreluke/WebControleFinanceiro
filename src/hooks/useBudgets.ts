import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BudgetsService, type BudgetQueryParams } from '@/services/budgets'
import type { CreateBudgetInput, UpdateBudgetInput } from '@/types/budget'

export function useBudgets(params?: BudgetQueryParams) {
  return useQuery({
    queryKey: ['budgets', params],
    queryFn: () => BudgetsService.list(params),
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBudgetInput) => BudgetsService.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBudgetInput }) => BudgetsService.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => BudgetsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export function useToggleBudgetActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => BudgetsService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

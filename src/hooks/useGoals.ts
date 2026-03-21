import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GoalsService } from '@/services/goals'
import type { CreateGoalInput, UpdateGoalInput } from '@/types/goal'

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => GoalsService.getAll(),
  })
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: ['goals', id],
    queryFn: () => GoalsService.getById(id),
    enabled: !!id,
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGoalInput) => GoalsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalInput }) =>
      GoalsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goals', id] })
    },
  })
}

export function useContributeGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      GoalsService.contribute(id, { amount }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goals', id] })
      queryClient.invalidateQueries({ queryKey: ['goals', id, 'contributions'] })
    },
  })
}

export function useWithdrawGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      GoalsService.withdraw(id, { amount }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goals', id] })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => GoalsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useGoalContributions(goalId: string) {
  return useQuery({
    queryKey: ['goals', goalId, 'contributions'],
    queryFn: () => GoalsService.getContributions(goalId),
    enabled: !!goalId,
  })
}

export function useRemoveContribution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contributionId: string) => GoalsService.removeContribution(contributionId),
    onSuccess: (_, contributionId) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goals', contributionId, 'contributions'] })
    },
  })
}

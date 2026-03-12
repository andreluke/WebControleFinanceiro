import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PaymentMethodsService } from '@/services/paymentMethods'
import type { CreatePaymentMethodInput } from '@/types/paymentMethod'

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: PaymentMethodsService.list,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePaymentMethodInput) => PaymentMethodsService.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
    },
  })
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CreatePaymentMethodInput> }) => PaymentMethodsService.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
    },
  })
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => PaymentMethodsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useRestorePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => PaymentMethodsService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
    },
  })
}

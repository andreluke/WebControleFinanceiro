import { api } from '@/services/api'
import type { CreatePaymentMethodInput, PaymentMethod } from '@/types/paymentMethod'

export const PaymentMethodsService = {
  list: async () => {
    const response = await api.get<PaymentMethod[]>('/payment-methods')
    return response.data
  },

  create: async (body: CreatePaymentMethodInput) => {
    const response = await api.post<PaymentMethod>('/payment-methods', body)
    return response.data
  },

  update: async (id: string, body: Partial<CreatePaymentMethodInput>) => {
    const response = await api.put<PaymentMethod>(`/payment-methods/${id}`, body)
    return response.data
  },

  remove: async (id: string) => {
    await api.delete(`/payment-methods/${id}`)
  },

  restore: async (id: string) => {
    const response = await api.patch<PaymentMethod>(`/payment-methods/${id}/restore`)
    return response.data
  },
}

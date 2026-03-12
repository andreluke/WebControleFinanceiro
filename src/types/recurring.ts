import type { TransactionCategory, TransactionPaymentMethod, TransactionType } from './transaction'

export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurringTransaction {
  id: string
  description: string
  subDescription?: string | null
  amount: number
  type: TransactionType
  categoryId?: string | null
  category?: TransactionCategory | null
  paymentMethodId?: string | null
  paymentMethod?: TransactionPaymentMethod | null
  frequency: FrequencyType
  dayOfMonth: number
  dayOfWeek?: number | null
  startDate: string
  endDate?: string | null
  isActive: boolean
  lastGeneratedAt?: string | null
  createdAt: string
}

export interface ListRecurringTransactionsParams {
  isActive?: boolean
  type?: TransactionType
}

export interface CreateRecurringTransactionInput {
  description: string
  subDescription?: string
  amount: number
  type: TransactionType
  categoryId?: string
  paymentMethodId?: string
  frequency: FrequencyType
  dayOfMonth: number
  dayOfWeek?: number
  startDate: string
  endDate?: string
}

import type { TransactionCategory, TransactionPaymentMethod, TransactionType, TransactionSubcategory } from './transaction'

export type TransactionTypeR = TransactionType

export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

export interface RecurringTransaction {
  id: string
  description: string
  subDescription?: string | null
  amount: number
  type: TransactionType
  categoryId?: string | null
  category?: TransactionCategory | null
  subcategoryId?: string | null
  subcategory?: TransactionSubcategory | null
  paymentMethodId?: string | null
  paymentMethod?: TransactionPaymentMethod | null
  frequency: FrequencyType
  customIntervalDays?: number | null
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
  subcategoryId?: string
  paymentMethodId?: string
  frequency: FrequencyType
  customIntervalDays?: number
  dayOfMonth: number
  dayOfWeek?: number
  startDate: string
  endDate?: string
}

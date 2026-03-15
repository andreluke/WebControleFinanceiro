export type TransactionType = 'income' | 'expense'

export interface TransactionCategory {
  id: string
  name: string
  color: string
  icon?: string | null
}

export interface TransactionSubcategory {
  id: string
  name: string
  color: string
}

export interface TransactionPaymentMethod {
  id: string
  name: string
}

export interface Transaction {
  id: string
  description: string
  subDescription?: string | null
  amount: number
  type: TransactionType
  date: string
  categoryId?: string | null
  subcategoryId?: string | null
  category?: TransactionCategory | null
  subcategory?: TransactionSubcategory | null
  paymentMethodId?: string | null
  paymentMethod?: TransactionPaymentMethod | null
  createdAt: string
}

export interface ListTransactionsParams {
  month?: string
  startDate?: string
  endDate?: string
  type?: TransactionType
  categoryId?: string
  paymentMethodId?: string
  page?: number
  limit?: number
}

export interface ListTransactionsResponse {
  data: Transaction[]
  total: number
}

export interface CreateTransactionInput {
  description: string
  subDescription?: string
  amount: number
  type: TransactionType
  date: string
  categoryId?: string
  subcategoryId?: string
  paymentMethodId?: string
}

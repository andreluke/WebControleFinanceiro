export interface Summary {
  totalBalance: number
  monthlyIncome: number
  monthlyExpense: number
  monthlyChange: number
}

export type SummaryPeriod = '7d' | '30d' | 'month' | 'previous'

export interface MonthlySummary {
  month: string
  income: number
  expense: number
  balance: number
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  color: string
  total: number
  percentage: number
}

export interface RecurringUpcoming {
  description: string
  amount: number
  type: 'income' | 'expense'
  expectedDate: string
}

export interface Forecast {
  currentIncome: number
  currentExpense: number
  projectedIncome: number
  projectedExpense: number
  projectedBalance: number
  recurringUpcoming: RecurringUpcoming[]
  confidence: 'high' | 'low'
}

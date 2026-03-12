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

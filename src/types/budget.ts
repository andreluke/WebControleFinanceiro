export interface Budget {
  id: string
  amount: number
  month: number
  year: number
  categoryId: string
  subcategoryId?: string | null
  categoryName: string
  categoryColor: string
  subcategoryName?: string | null
  subcategoryColor?: string | null
  spent: number
  percentage: number
  remaining: number
  isOverBudget: boolean
}

export interface BudgetSummary {
  totalBudgeted: number
  totalSpent: number
  totalRemaining: number
  overBudgetCount: number
  nearLimitCount: number
  budgets: Budget[]
}

export interface CreateBudgetInput {
  categoryId: string
  subcategoryId?: string
  amount: number
  month: number
  year: number
}

export interface UpdateBudgetInput {
  amount: number
}

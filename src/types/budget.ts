export interface Budget {
  id: string
  amount: number
  baseAmount?: number | null
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
  isRecurring?: boolean | null
  isActive?: boolean | null
  recurringGroupId?: string | null
  subcategoriesTotal?: number | null
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
  baseAmount?: number
  month: number
  year: number
  isRecurring?: boolean
}

export interface UpdateBudgetInput {
  amount?: number
  baseAmount?: number
  isActive?: boolean
  isRecurring?: boolean
}

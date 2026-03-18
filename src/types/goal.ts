export interface Goal {
  id: string
  name: string
  description?: string | null
  targetAmount: number
  currentAmount: number
  deadline?: string | null
  icon?: string | null
  color?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateGoalInput {
  name: string
  description?: string
  targetAmount: number
  deadline?: string
  icon?: string
  color?: string
}

export interface UpdateGoalInput {
  name?: string
  description?: string
  targetAmount?: number
  deadline?: string
  icon?: string
  color?: string
  isActive?: boolean
}

export interface ContributeGoalInput {
  amount: number
}

export interface GoalContribution {
  id: string
  goalId: string
  transactionId: string
  type: 'deposit' | 'withdrawal'
  amount: number
  createdAt: string
}

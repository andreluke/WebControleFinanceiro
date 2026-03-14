import { AlertTriangle, TrendingDown } from 'lucide-react'
import type { Budget } from '@/types/budget'
import { Button } from '@/components/ui'

interface BudgetCardProps {
  budget: Budget
  onEdit: (budget: Budget) => void
}

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const percentage = budget.percentage
  const isOverBudget = budget.isOverBudget
  const isNearLimit = percentage >= 80 && !isOverBudget

  const getProgressBarColor = () => {
    if (isOverBudget) return 'bg-danger'
    if (isNearLimit) return 'bg-warning'
    return 'bg-primary'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="group relative rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: budget.categoryColor }} />
          <span className="font-medium text-foreground">{budget.categoryName}</span>
        </div>
        {isOverBudget && (
          <div className="flex items-center gap-1 text-danger">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">Acima</span>
          </div>
        )}
        {isNearLimit && !isOverBudget && (
          <div className="flex items-center gap-1 text-warning">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs font-medium">Próximo</span>
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-secondary">Gasto</span>
          <span className={`font-semibold ${isOverBudget ? 'text-danger' : 'text-foreground'}`}>
            {formatCurrency(budget.spent)}
          </span>
        </div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-secondary">Orçamento</span>
          <span className="font-medium text-foreground">{formatCurrency(budget.amount)}</span>
        </div>
      </div>

      <div className="relative mb-2 h-2 w-full overflow-hidden rounded-full bg-secondary/20">
        <div
          className={`h-full transition-all duration-500 ${getProgressBarColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${isOverBudget ? 'text-danger' : 'text-secondary'}`}>
          {percentage.toFixed(1)}% utilizado
        </span>
        <span className="text-sm text-secondary">
          Restante: {formatCurrency(budget.remaining)}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => onEdit(budget)}
      >
        Editar
      </Button>
    </div>
  )
}

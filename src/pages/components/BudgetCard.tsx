import { AlertTriangle, TrendingDown, RefreshCw, Power, Layers } from 'lucide-react'
import type { Budget } from '@/types/budget'
import { Button } from '@/components/ui'
import { useToggleBudgetActive } from '@/hooks/useBudgets'
import { useToast } from '@/hooks/use-toast'

interface BudgetCardProps {
  budget: Budget
  onEdit: (budget: Budget) => void
}

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const toggleActive = useToggleBudgetActive()
  const { toast } = useToast()
  const percentage = budget.percentage
  const isOverBudget = budget.isOverBudget
  const isNearLimit = percentage >= 80 && !isOverBudget
  const hasBaseAmount = !budget.subcategoryId && (budget.baseAmount ?? 0) > 0
  const showSubcategoriesTotal = !budget.subcategoryId && (budget.subcategoriesTotal ?? 0) > 0
  const showCalculatedBadge = !budget.subcategoryId && (budget.subcategoriesTotal ?? 0) > 0

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

  const handleToggleActive = async () => {
    if (!budget.isRecurring) return
    
    try {
      await toggleActive.mutateAsync(budget.id)
      toast({
        title: budget.isActive ? 'Orçamento desativado' : 'Orçamento ativado',
        description: budget.isActive 
          ? 'Este orçamento não será recriado no próximo mês.'
          : 'Este orçamento será recriado automaticamente no próximo mês.',
      })
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do orçamento.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className={`group relative rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md ${!budget.isActive ? 'opacity-50' : ''}`}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: budget.categoryColor }} />
          <span className="font-medium text-foreground">{budget.categoryName}</span>
          {budget.subcategoryName && (
            <>
              <span className="text-secondary">/</span>
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: budget.subcategoryColor || '#6B7280' }} />
              <span className="font-medium text-foreground">{budget.subcategoryName}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {budget.isRecurring && (
            <div className="flex items-center gap-1 text-secondary" title="Orçamento recorrente">
              <RefreshCw className="h-3 w-3" />
              <span className="text-xs">Recorrente</span>
            </div>
          )}
          {showCalculatedBadge && (
            <div className="flex items-center gap-1 text-secondary" title="Orçamento calculado a partir das subcategorias">
              <Layers className="h-3 w-3" />
              <span className="text-xs">Calculado</span>
            </div>
          )}
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
      </div>

      <div className="mb-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-secondary">Gasto</span>
          <span className={`font-semibold ${isOverBudget ? 'text-danger' : 'text-foreground'}`}>
            {formatCurrency(budget.spent)}
          </span>
        </div>
        {hasBaseAmount && showSubcategoriesTotal && (
          <>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-secondary">Base</span>
              <span className="font-medium text-secondary">{formatCurrency(budget.baseAmount ?? 0)}</span>
            </div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-secondary">Subcategorias</span>
              <span className="font-medium text-secondary">{formatCurrency(budget.subcategoriesTotal ?? 0)}</span>
            </div>
            <div className="flex items-baseline justify-between text-sm border-t border-border pt-1 mt-1">
              <span className="text-secondary font-medium">Total</span>
              <span className="font-bold text-foreground">{formatCurrency(budget.amount)}</span>
            </div>
          </>
        )}
        {hasBaseAmount && !showSubcategoriesTotal && (
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-secondary">Orçamento</span>
            <span className="font-medium text-foreground">{formatCurrency(budget.amount)}</span>
          </div>
        )}
        {!hasBaseAmount && (
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-secondary">Orçamento</span>
            <span className="font-medium text-foreground">{formatCurrency(budget.amount)}</span>
          </div>
        )}
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

      <div className="mt-3 flex items-center justify-between">
        {budget.isRecurring && (
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 text-xs ${budget.isActive ? 'text-secondary hover:text-danger' : 'text-success hover:text-success'}`}
            onClick={handleToggleActive}
            disabled={toggleActive.isPending}
          >
            <Power className="mr-1 h-3 w-3" />
            {budget.isActive ? 'Desativar' : 'Ativar'}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={`ml-auto ${!budget.isRecurring ? '' : ''}`}
          onClick={() => onEdit(budget)}
        >
          Editar
        </Button>
      </div>
    </div>
  )
}

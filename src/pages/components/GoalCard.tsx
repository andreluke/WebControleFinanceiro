import { Edit, Trash2, Plus } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import type { Goal } from '@/types/goal'
import { formatBRL } from '@/utils/currency'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface GoalCardProps {
  goal: Goal
  onEdit: () => void
  onDelete: () => void
  onContribute: () => void
}

export function GoalCard({ goal, onEdit, onDelete, onContribute }: GoalCardProps) {
  const progress = Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100)
  const isCompleted = Number(goal.currentAmount) >= Number(goal.targetAmount)

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: goal.color || '#3B82F6' }}
            >
              <span className="text-xs font-bold text-white">
                {goal.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{goal.name}</h3>
              {goal.description && (
                <p className="text-xs text-secondary line-clamp-1">{goal.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-danger" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Progresso</span>
            <span className="font-medium text-foreground">
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary/20">
            <div
              className={`h-full transition-all ${isCompleted ? 'bg-success' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-secondary">Guardado</p>
            <p className={`font-semibold ${isCompleted ? 'text-success' : 'text-foreground'}`}>
              {formatBRL(Number(goal.currentAmount))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-secondary">Meta</p>
            <p className="font-semibold text-foreground">
              {formatBRL(Number(goal.targetAmount))}
            </p>
          </div>
        </div>

        {goal.deadline && (
          <div className="mt-2 border-t border-border pt-2">
            <p className="text-xs text-secondary">
              Prazo: {format(new Date(goal.deadline), "dd MMM yyyy", { locale: ptBR })}
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="mt-2 rounded bg-success/10 px-2 py-1 text-center text-xs font-medium text-success">
            Meta alcançada!
          </div>
        )}

        {!isCompleted && (
          <Button
            className="mt-3 w-full"
            size="sm"
            onClick={onContribute}
          >
            <Plus className="h-4 w-4" />
            Contribuir
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

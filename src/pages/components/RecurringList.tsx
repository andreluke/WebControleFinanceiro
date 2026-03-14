import { Edit, Loader2, Play, Power, Trash2 } from 'lucide-react'
import type { RecurringTransaction } from '@/types/recurring'
import { formatBRL } from '@/utils/currency'
import { getErrorMessage } from '@/utils/apiError'
import { Button } from '@/components/ui'
import type { UseRecurringActionsReturn } from '@/hooks/useRecurringActions'

interface RecurringListProps {
  recurrings: RecurringTransaction[]
  isLoading: boolean
  isError: boolean
  error: unknown
  actions: UseRecurringActionsReturn
  onEdit: (r: RecurringTransaction) => void
}

export function RecurringList({ recurrings, isLoading, isError, error, actions, onEdit }: RecurringListProps) {
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState error={error} />
  if (recurrings.length === 0) return <EmptyState />

  return (
    <RecurringTable
      recurrings={recurrings}
      onToggle={actions.toggle}
      onProcess={actions.process}
      onEdit={onEdit}
      onDelete={actions.remove}
    />
  )
}

function LoadingState() {
  return (
    <div className="flex h-[320px] items-center justify-center gap-2 text-secondary">
      <Loader2 className="h-4 w-4 animate-spin" />
      Carregando transacoes...
    </div>
  )
}

function ErrorState({ error }: { error: unknown }) {
  return (
    <div className="flex h-[320px] flex-col items-center justify-center gap-2 text-center text-secondary">
      <p>Falha ao carregar transacoes.</p>
      <p className="text-xs text-danger">{getErrorMessage(error, 'Erro inesperado')}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-md border border-dashed border-border text-secondary">
      Nenhuma transacao recorrente encontrada. Crie uma nova para comecar.
    </div>
  )
}

function RecurringTable({
  recurrings,
  onToggle,
  onProcess,
  onEdit,
  onDelete,
}: {
  recurrings: RecurringTransaction[]
  onToggle: (r: RecurringTransaction) => void
  onProcess: (r: RecurringTransaction) => void
  onEdit: (r: RecurringTransaction) => void
  onDelete: (r: RecurringTransaction) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-secondary">
            <th className="px-3 py-3">Descricao</th>
            <th className="px-3 py-3">Frequencia</th>
            <th className="px-3 py-3">Valor</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3 text-right">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {recurrings.map((recurring) => (
            <RecurringRow
              key={recurring.id}
              recurring={recurring}
              onToggle={onToggle}
              onProcess={onProcess}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecurringRow({
  recurring,
  onToggle,
  onProcess,
  onEdit,
  onDelete,
}: {
  recurring: RecurringTransaction
  onToggle: (r: RecurringTransaction) => void
  onProcess: (r: RecurringTransaction) => void
  onEdit: (r: RecurringTransaction) => void
  onDelete: (r: RecurringTransaction) => void
}) {
  const frequencyLabel = recurring.frequency === 'custom' && recurring.customIntervalDays
    ? `A cada ${recurring.customIntervalDays} dias`
    : frequencyLabels[recurring.frequency] ?? recurring.frequency

  return (
    <tr className="border-b border-border/60 last:border-b-0">
      <td className="px-3 py-4">
        <p className="font-medium text-foreground">{recurring.description}</p>
        {recurring.subDescription && <p className="text-xs text-secondary">{recurring.subDescription}</p>}
      </td>
      <td className="px-3 py-4 text-secondary">{frequencyLabel}</td>
      <td className={`px-3 py-4 font-semibold ${recurring.type === 'income' ? 'text-success' : 'text-danger'}`}>
        {recurring.type === 'income' ? '+' : '-'} {formatBRL(Number(recurring.amount))}
      </td>
      <td className="px-3 py-4">
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            recurring.isActive ? 'bg-success/20 text-success' : 'bg-secondary/20 text-secondary'
          }`}
        >
          {recurring.isActive ? 'Ativo' : 'Pausado'}
        </span>
      </td>
      <td className="px-3 py-4">
        <div className="flex justify-end gap-2">
          {recurring.isActive && (
            <Button variant="outline" size="sm" onClick={() => onProcess(recurring)}>
              <Play className="h-4 w-4" />
              Gerar
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onToggle(recurring)}>
            <Power className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(recurring)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(recurring)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

const frequencyLabels: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
}

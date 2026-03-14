import type { RecurringTransaction } from '@/types/recurring'
import { useToast } from '@/hooks/use-toast'
import { useDeleteRecurringTransaction, useToggleRecurringTransaction, useProcessRecurringTransaction } from '@/hooks/useRecurringTransactions'

export interface UseRecurringActionsReturn {
  toggle: (recurring: RecurringTransaction) => Promise<void>
  process: (recurring: RecurringTransaction) => Promise<void>
  remove: (recurring: RecurringTransaction) => Promise<void>
}

export function useRecurringActions(): UseRecurringActionsReturn {
  const { toast } = useToast()
  const deleteRecurring = useDeleteRecurringTransaction()
  const toggleRecurring = useToggleRecurringTransaction()
  const processRecurring = useProcessRecurringTransaction()

  async function toggle(recurring: RecurringTransaction) {
    try {
      await toggleRecurring.mutateAsync(recurring.id)
      toast({
        title: recurring.isActive ? 'Transacao pausada' : 'Transacao ativada',
        description: recurring.isActive ? 'A transacao foi pausada.' : 'A transacao foi ativada.',
      })
    } catch {
      toast({ title: 'Erro ao alternar', description: 'Nao foi possivel alterar o status.', variant: 'destructive' })
    }
  }

  async function process(recurring: RecurringTransaction) {
    try {
      await processRecurring.mutateAsync(recurring.id)
      toast({ title: 'Transacao gerada', description: 'A transacao foi criada com sucesso.' })
    } catch {
      toast({ title: 'Erro ao processar', description: 'Nao foi possivel gerar a transacao.', variant: 'destructive' })
    }
  }

  async function remove(recurring: RecurringTransaction) {
    if (!window.confirm(`Tem certeza que deseja excluir "${recurring.description}"?`)) {
      return
    }

    try {
      await deleteRecurring.mutateAsync(recurring.id)
      toast({ title: 'Transacao removida', description: 'A transacao foi excluida com sucesso.' })
    } catch {
      toast({ title: 'Erro ao excluir', description: 'Nao foi possivel excluir a transacao.', variant: 'destructive' })
    }
  }

  return { toggle, process, remove }
}

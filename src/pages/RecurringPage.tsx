import { Plus } from 'lucide-react'
import { Button, Card, CardContent, Dialog, Toaster } from '@/components/ui'
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions'
import { useRecurringModals } from '@/hooks/useRecurringModals'
import { useRecurringActions } from '@/hooks/useRecurringActions'
import { RecurringModal, RecurringList } from './components'

export default function RecurringPage() {
  const modals = useRecurringModals()
  const actions = useRecurringActions()
  const { data: recurrings = [], isLoading, isError, error } = useRecurringTransactions()

  return (
    <>
      <div>
        <Header onCreateClick={modals.openCreate} />

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <RecurringList
              recurrings={recurrings}
              isLoading={isLoading}
              isError={isError}
              error={error}
              actions={actions}
              onEdit={modals.openEdit}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={modals.isOpen} onOpenChange={modals.setOpen}>
        <RecurringModal
          isOpen={modals.isOpen}
          onClose={modals.close}
          recurring={modals.editingRecurring}
        />
      </Dialog>

      <Toaster />
    </>
  )
}

function Header({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Transacoes Recorrentes</h1>
        <p className="text-sm text-secondary">Gerencie suas receitas e despesas automaticas</p>
      </div>
      <Button className="bg-primary text-white shadow-cta hover:bg-primary/90" onClick={onCreateClick}>
        <Plus className="h-4 w-4" />
        Nova Recorrencia
      </Button>
    </div>
  )
}

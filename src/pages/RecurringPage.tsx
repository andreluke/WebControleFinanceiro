import { Plus, TrendingUp, TrendingDown, CheckCircle2, XCircle } from 'lucide-react'
import { Button, Card, CardContent, Dialog, Toaster } from '@/components/ui'
import { KpiCard } from '@/components/kpi/KpiCard'
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions'
import { useRecurringModals } from '@/hooks/useRecurringModals'
import { useRecurringActions } from '@/hooks/useRecurringActions'
import { RecurringModal, RecurringList } from './components'
import { formatBRL } from '@/utils/currency'

export default function RecurringPage() {
  const modals = useRecurringModals()
  const actions = useRecurringActions()
  const { data: recurrings = [], isLoading, isError, error } = useRecurringTransactions()

  const activeRecurrings = recurrings.filter(r => r.isActive)
  const inactiveRecurrings = recurrings.filter(r => !r.isActive)

  const getMonthlyAmount = (recurring: typeof recurrings[0]) => {
    switch (recurring.frequency) {
      case 'daily':
        return recurring.amount * 30
      case 'weekly':
        return recurring.amount * 4
      case 'monthly':
        return recurring.amount
      case 'yearly':
        return recurring.amount / 12
      case 'custom':
        return recurring.customIntervalDays ? (recurring.amount * 30) / recurring.customIntervalDays : recurring.amount
      default:
        return recurring.amount
    }
  }

  const totalMonthlyIncome = activeRecurrings
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + getMonthlyAmount(r), 0)

  const totalMonthlyExpense = activeRecurrings
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + getMonthlyAmount(r), 0)

  return (
    <>
      <div>
        <Header onCreateClick={modals.openCreate} />

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Receitas Recorrentes"
            value={formatBRL(totalMonthlyIncome)}
            change="Valor mensal"
            isPositive
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KpiCard
            label="Despesas Recorrentes"
            value={formatBRL(totalMonthlyExpense)}
            change="Valor mensal"
            isPositive={false}
            icon={<TrendingDown className="h-5 w-5" />}
          />
          <KpiCard
            label="Ativas"
            value={String(activeRecurrings.length)}
            change="Recorrências ativas"
            isPositive
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <KpiCard
            label="Inativas"
            value={String(inactiveRecurrings.length)}
            change="Recorrências pausadas"
            isPositive={false}
            icon={<XCircle className="h-5 w-5" />}
          />
        </div>

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

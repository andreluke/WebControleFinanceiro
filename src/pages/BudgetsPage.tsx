import { useState } from 'react'
import { Plus, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react'
import { Button, Card, CardContent, Dialog, Toaster } from '@/components/ui'
import { useBudgets } from '@/hooks/useBudgets'
import { BudgetCard } from './components/BudgetCard'
import { BudgetModal } from './components/BudgetModal'
import type { Budget } from '@/types/budget'

const currentDate = new Date()
const currentMonth = currentDate.getMonth() + 1
const currentYear = currentDate.getFullYear()

export default function BudgetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const { data: summary, isLoading, isError, error } = useBudgets({ month: selectedMonth, year: selectedYear })

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBudget(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ]

  return (
    <>
      <div>
        <Header onCreateClick={() => setIsModalOpen(true)} />

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {summary && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Total orçado"
              value={formatCurrency(summary.totalBudgeted)}
              icon={<DollarSign className="h-4 w-4" />}
              variant="default"
            />
            <SummaryCard
              title="Total gasto"
              value={formatCurrency(summary.totalSpent)}
              icon={<TrendingDown className="h-4 w-4" />}
              variant={summary.overBudgetCount > 0 ? 'danger' : 'default'}
            />
            <SummaryCard
              title="Total restante"
              value={formatCurrency(summary.totalRemaining)}
              icon={<DollarSign className="h-4 w-4" />}
              variant={summary.totalRemaining < 0 ? 'danger' : 'success'}
            />
            <SummaryCard
              title="Atenção"
              value={`${summary.nearLimitCount} próximo(s) | ${summary.overBudgetCount} acima(s)`}
              icon={<AlertTriangle className="h-4 w-4" />}
              variant={summary.overBudgetCount > 0 ? 'warning' : 'default'}
            />
          </div>
        )}

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-secondary">Carregando orçamentos...</p>
              </div>
            ) : isError ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-danger">Erro ao carregar orçamentos: {String(error)}</p>
              </div>
            ) : summary?.budgets.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <p className="text-secondary">Nenhum orçamento encontrado.</p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Criar orçamento
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {summary?.budgets.map((budget) => (
                  <BudgetCard key={budget.id} budget={budget} onEdit={handleEdit} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <BudgetModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          budget={editingBudget}
          month={selectedMonth}
          year={selectedYear}
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
        <h1 className="mb-2 text-2xl font-bold text-foreground">Metas e Orçamentos</h1>
        <p className="text-sm text-secondary">Defina limites de gastos por categoria e acompanhe seu progresso</p>
      </div>
      <Button className="bg-primary text-white shadow-cta hover:bg-primary/90" onClick={onCreateClick}>
        <Plus className="h-4 w-4" />
        Novo Orçamento
      </Button>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: string
  icon: React.ReactNode
  variant?: 'default' | 'success' | 'danger' | 'warning'
}

function SummaryCard({ title, value, icon, variant = 'default' }: SummaryCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'text-success'
      case 'danger':
        return 'text-danger'
      case 'warning':
        return 'text-warning'
      default:
        return 'text-primary'
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`rounded-full bg-secondary/10 p-2 ${getVariantStyles()}`}>{icon}</div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-secondary">{title}</p>
          <p className={`text-lg font-bold ${getVariantStyles()}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

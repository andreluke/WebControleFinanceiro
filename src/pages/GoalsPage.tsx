import { Plus, Target, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react'
import { Button, Card, CardContent, Dialog, Toaster } from '@/components/ui'
import { KpiCard } from '@/components/kpi/KpiCard'
import { useGoals, useDeleteGoal } from '@/hooks/useGoals'
import { useToast } from '@/hooks/use-toast'
import { GoalCard } from './components/GoalCard'
import { GoalModal } from './components/GoalModal'
import { formatBRL } from '@/utils/currency'
import { useState } from 'react'

export default function GoalsPage() {
  const { data: goals = [], isLoading, isError, error } = useGoals()
  const deleteGoal = useDeleteGoal()
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<typeof goals[0] | null>(null)
  const [contributeMode, setContributeMode] = useState(false)

  const activeGoals = goals.filter(g => g.isActive)
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount)

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0)
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0)
  const totalRemaining = totalTarget - totalSaved

  const handleEdit = (goal: typeof goals[0]) => {
    setEditingGoal(goal)
    setContributeMode(false)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingGoal(null)
    setContributeMode(false)
  }

  const handleDelete = async (goal: typeof goals[0]) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${goal.name}"?`)) {
      return
    }

    try {
      await deleteGoal.mutateAsync(goal.id)
      toast({ title: 'Meta removida', description: 'A meta foi excluída com sucesso.' })
    } catch {
      toast({ title: 'Erro ao excluir', description: 'Não foi possível excluir a meta.', variant: 'destructive' })
    }
  }

  return (
    <>
      <div>
        <Header onCreateClick={() => { setEditingGoal(null); setContributeMode(false); setIsModalOpen(true) }} />

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total Economizado"
            value={formatBRL(totalSaved)}
            change="Valor guardado"
            isPositive
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KpiCard
            label="Total Faltante"
            value={formatBRL(totalRemaining)}
            change="Quanto falta"
            isPositive={totalRemaining <= 0}
            icon={<TrendingDown className="h-5 w-5" />}
          />
          <KpiCard
            label="Metas Concluídas"
            value={String(completedGoals.length)}
            change="Concluídas"
            isPositive
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <KpiCard
            label="Metas Ativas"
            value={String(activeGoals.length - completedGoals.length)}
            change="Em andamento"
            isPositive
            icon={<Target className="h-5 w-5" />}
          />
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-secondary">Carregando metas...</p>
              </div>
            ) : isError ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-danger">Erro ao carregar metas: {String(error)}</p>
              </div>
            ) : goals.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <p className="text-secondary">Nenhuma meta encontrada.</p>
                <Button onClick={() => { setEditingGoal(null); setContributeMode(false); setIsModalOpen(true) }}>
                  <Plus className="h-4 w-4" />
                  Criar meta
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => handleEdit(goal)}
                    onDelete={() => handleDelete(goal)}
                    onContribute={() => {
                      setEditingGoal(goal)
                      setContributeMode(true)
                      setIsModalOpen(true)
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <GoalModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          goal={editingGoal}
          initialContributeMode={contributeMode}
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
        <h1 className="mb-2 text-2xl font-bold text-foreground">Metas de Economia</h1>
        <p className="text-sm text-secondary">Acompanhe suas metas de poupança</p>
      </div>
      <Button className="bg-primary text-white shadow-cta hover:bg-primary/90" onClick={onCreateClick}>
        <Plus className="h-4 w-4" />
        Nova Meta
      </Button>
    </div>
  )
}

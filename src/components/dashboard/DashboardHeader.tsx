import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

export function DashboardHeader() {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Resumo financeiro</h1>
        <p className="text-sm text-secondary">Visao geral de saldo, receita, despesa e tendencias do periodo.</p>
      </div>

      <Button asChild className="bg-primary text-white shadow-cta hover:bg-primary/90">
        <Link to="/transfers?new=1">
          <Plus className="h-4 w-4" />
          Nova transacao
        </Link>
      </Button>
    </div>
  )
}

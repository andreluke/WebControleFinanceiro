import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet } from 'lucide-react'
import { KpiCard } from '@/components/kpi/KpiCard'
import { Button, Card, CardContent, Skeleton } from '@/components/ui'
import type { Summary } from '@/types/summary'
import { formatBRL } from '@/utils/currency'

function KpiSkeletonCard() {
  return (
    <Card className="border-border bg-card shadow-card">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="mb-2 h-3 w-24" />
        <Skeleton className="h-7 w-36" />
      </CardContent>
    </Card>
  )
}

interface DashboardKpiSectionProps {
  isLoading: boolean
  isError: boolean
  summary?: Summary
  onRetry: () => void
}

export function DashboardKpiSection({ isLoading, isError, summary, onRetry }: DashboardKpiSectionProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {isLoading ? (
        <>
          <KpiSkeletonCard />
          <KpiSkeletonCard />
          <KpiSkeletonCard />
          <KpiSkeletonCard />
        </>
      ) : isError ? (
        <Card className="col-span-full border-danger/40 bg-danger/5">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <p className="text-sm text-foreground">Nao foi possivel carregar os indicadores do periodo.</p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <KpiCard
            label="Saldo Total"
            value={formatBRL(summary?.totalBalance ?? 0)}
            change="Saldo acumulado"
            isPositive
            icon={<Wallet className="h-5 w-5" />}
          />
          <KpiCard
            label="Receita no Mes"
            value={formatBRL(summary?.monthlyIncome ?? 0)}
            change="Entradas"
            isPositive
            icon={<ArrowUpRight className="h-5 w-5" />}
          />
          <KpiCard
            label="Despesa no Mes"
            value={formatBRL(summary?.monthlyExpense ?? 0)}
            change="Saidas"
            isPositive={false}
            icon={<ArrowDownRight className="h-5 w-5" />}
          />
          <KpiCard
            label="Variacao Mensal"
            value={`${summary?.monthlyChange ?? 0}%`}
            change={(summary?.monthlyChange ?? 0) <= 0 ? 'Queda nas despesas' : 'Aumento nas despesas'}
            isPositive={(summary?.monthlyChange ?? 0) <= 0}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </>
      )}
    </div>
  )
}

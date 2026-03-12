import { BalanceLineChart } from '@/components/charts/BalanceLineChart'
import { CategoryDonutChart } from '@/components/charts/CategoryDonutChart'
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import type { CategorySummary, MonthlySummary } from '@/types/summary'

function QueryErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-[340px] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-danger/40 bg-danger/5 px-6 text-center">
      <p className="text-sm text-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  )
}

function ChartSkeleton({ label }: { label: string }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full" />
      </CardContent>
    </Card>
  )
}

interface DashboardChartsSectionProps {
  monthly: {
    isLoading: boolean
    isError: boolean
    data?: MonthlySummary[]
    refetch: () => void
  }
  category: {
    isLoading: boolean
    isError: boolean
    data?: CategorySummary[]
    refetch: () => void
  }
}

export function DashboardChartsSection({ monthly, category }: DashboardChartsSectionProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
      {monthly.isLoading ? (
        <ChartSkeleton label="Evolucao do saldo" />
      ) : monthly.isError ? (
        <Card className="border-border bg-card">
          <CardContent>
            <QueryErrorState message="Falha ao carregar o grafico de evolucao do saldo." onRetry={monthly.refetch} />
          </CardContent>
        </Card>
      ) : (
        <BalanceLineChart data={monthly.data ?? []} />
      )}

      {category.isLoading ? (
        <ChartSkeleton label="Gastos por categoria" />
      ) : category.isError ? (
        <Card className="border-border bg-card">
          <CardContent>
            <QueryErrorState message="Falha ao carregar o resumo por categoria." onRetry={category.refetch} />
          </CardContent>
        </Card>
      ) : (
        <CategoryDonutChart data={category.data ?? []} />
      )}
    </div>
  )
}

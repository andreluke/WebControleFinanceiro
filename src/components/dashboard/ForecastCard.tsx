import { CalendarDays, TrendingDown, TrendingUp } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Skeleton } from '@/components/ui'
import type { Forecast, RecurringUpcoming } from '@/types/summary'
import { formatBRL } from '@/utils/currency'
import { formatDate } from '@/utils/date'

function ForecastSkeleton() {
  return (
    <div className="space-y-4">
      <div className="gap-4 grid grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-28 h-8" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-28 h-8" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-20" />
      </div>
    </div>
  )
}

function QueryErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col justify-center items-center gap-3 bg-danger/5 px-6 border border-danger/40 border-dashed rounded-md h-[200px] text-center">
      <p className="text-foreground text-sm">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  )
}

interface RecurringItemProps {
  item: RecurringUpcoming
}

function RecurringItem({ item }: RecurringItemProps) {
  return (
    <div className="flex justify-between items-center py-2 text-sm">
      <div className="flex items-center gap-2">
        <span className={`rounded-full p-1 ${item.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {item.type === 'income' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        </span>
        <span className="text-foreground">{item.description}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-secondary">{formatDate(item.expectedDate)}</span>
        <span className={`font-medium ${item.type === 'income' ? 'text-success' : 'text-danger'}`}>
          {item.type === 'income' ? '+' : '-'} {formatBRL(item.amount)}
        </span>
      </div>
    </div>
  )
}

interface ForecastCardProps {
  isLoading: boolean
  isError: boolean
  forecast?: Forecast
  onRetry: () => void
}

export function ForecastCard({ isLoading, isError, forecast, onRetry }: ForecastCardProps) {
  const incomeProgress = forecast 
    ? Math.min(100, (forecast.currentIncome / forecast.projectedIncome) * 100) 
    : 0
  const expenseProgress = forecast 
    ? Math.min(100, (forecast.currentExpense / forecast.projectedExpense) * 100) 
    : 0

  return (
    <Card className="bg-card mb-4 border-border">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-foreground text-lg">
          <span className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary-light" />
            Previsao de Fechamento
          </span>
          {forecast && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              forecast.confidence === 'high' 
                ? 'bg-success/10 text-success' 
                : 'bg-warning/10 text-warning'
            }`}>
              {forecast.confidence === 'high' ? 'Alta confiança' : 'Baixa confiança'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ForecastSkeleton />
        ) : isError ? (
          <QueryErrorState message="Falha ao carregar a previsao." onRetry={onRetry} />
        ) : (
          <div className="space-y-4">
            <div className="gap-4 grid grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-secondary text-sm">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span>Receitas</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-success text-lg">
                    {formatBRL(forecast?.currentIncome ?? 0)}
                  </span>
                  <span className="text-secondary text-sm">/ {formatBRL(forecast?.projectedIncome ?? 0)}</span>
                </div>
                <Progress value={incomeProgress} className="bg-border h-1.5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-secondary text-sm">
                  <TrendingDown className="w-4 h-4 text-danger" />
                  <span>Despesas</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-danger text-lg">
                    {formatBRL(forecast?.currentExpense ?? 0)}
                  </span>
                  <span className="text-secondary text-sm">/ {formatBRL(forecast?.projectedExpense ?? 0)}</span>
                </div>
                <Progress value={expenseProgress} className="bg-border h-1.5" />
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">Saldo projetado no fim do mes</span>
                <span className={`text-lg font-bold ${(forecast?.projectedBalance ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatBRL(forecast?.projectedBalance ?? 0)}
                </span>
              </div>
            </div>

            {forecast && forecast.recurringUpcoming.length > 0 && (
              <div className="pt-3 border-border border-t">
                <h4 className="mb-2 font-medium text-secondary text-xs uppercase tracking-wide">
                  Proximas recorrentes ({forecast.recurringUpcoming.length})
                </h4>
                <div className="divide-y divide-border/60">
                  {forecast.recurringUpcoming.slice(0, 5).map((item, index) => (
                    <RecurringItem key={index} item={item} />
                  ))}
                  {forecast.recurringUpcoming.length > 5 && (
                    <p className="py-2 text-secondary text-xs text-center">
                      +{forecast.recurringUpcoming.length - 5} mais
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

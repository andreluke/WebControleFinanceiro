import { Landmark } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import type { Transaction } from '@/types/transaction'
import { formatBRL } from '@/utils/currency'
import { formatDate } from '@/utils/date'

function LatestTransactionsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid grid-cols-5 gap-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      ))}
    </div>
  )
}

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

interface DashboardLatestTransactionsCardProps {
  isLoading: boolean
  isError: boolean
  transactions: Transaction[]
  onRetry: () => void
}

export function DashboardLatestTransactionsCard({ isLoading, isError, transactions, onRetry }: DashboardLatestTransactionsCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Landmark className="h-5 w-5 text-primary-light" />
          Ultimas transacoes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LatestTransactionsSkeleton />
        ) : isError ? (
          <QueryErrorState message="Falha ao carregar as ultimas transacoes." onRetry={onRetry} />
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-secondary">Sem transacoes neste periodo.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-secondary">
                  <th className="px-3 py-3">Data</th>
                  <th className="px-3 py-3">Descricao</th>
                  <th className="px-3 py-3">Categoria</th>
                  <th className="px-3 py-3">Metodo</th>
                  <th className="px-3 py-3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-3 py-3 text-secondary">{formatDate(transaction.date)}</td>
                    <td className="px-3 py-3 text-foreground">{transaction.description}</td>
                    <td className="px-3 py-3 text-secondary">{transaction.category?.name ?? '-'}</td>
                    <td className="px-3 py-3 text-secondary">{transaction.paymentMethod?.name ?? '-'}</td>
                    <td className={`px-3 py-3 font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatBRL(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

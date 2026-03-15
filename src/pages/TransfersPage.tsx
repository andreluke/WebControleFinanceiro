import { useEffect } from 'react'
import { format, subMonths } from 'date-fns'
import { Edit, Loader2, Plus, Search, Trash2 } from 'lucide-react'
import type { Transaction, TransactionType } from '@/types/transaction'
import { formatBRL } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { getErrorMessage } from '@/utils/apiError'
import { Button, Card, CardContent, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Toaster } from '@/components/ui'
import { useToast } from '@/hooks/use-toast'
import { useCategories } from '@/hooks/useCategories'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions'
import { useTransactionFilters, useTransactionModals, useFilteredTransactions, usePagination } from '@/hooks/useTransactionHooks'
import { TransfersModals } from './components'

const pageSize = 10

const monthFilterOptions = [
  { value: 'all', label: 'Todo periodo' },
  { value: 'current', label: 'Este mes' },
  { value: 'previous', label: 'Mes passado' },
  { value: 'two_months_ago', label: '2 meses atras' },
] as const

function monthParamFromFilter(filter: string) {
  if (filter === 'all') return undefined
  if (filter === 'current') return format(new Date(), 'yyyy-MM')
  if (filter === 'previous') return format(subMonths(new Date(), 1), 'yyyy-MM')
  return format(subMonths(new Date(), 2), 'yyyy-MM')
}

export default function TransfersPage() {
  const { toast } = useToast()

  const { filters, update } = useTransactionFilters()
  const modals = useTransactionModals(filters.new)

  useEffect(() => {
    if (filters.new) {
      update({ new: null })
    }
  }, [filters.new, update])

  const transactionType = filters.type === 'all' ? undefined : filters.type as TransactionType

  const { data: transactionsResponse, isLoading, isError, error } = useTransactions({
    page: filters.page,
    limit: pageSize,
    month: monthParamFromFilter(filters.period),
    type: transactionType,
  })

  const { data: categories = [] } = useCategories()
  const { data: paymentMethods = [] } = usePaymentMethods()
  const deleteTransaction = useDeleteTransaction()

  const filteredTransactions = useFilteredTransactions(
    transactionsResponse?.data ?? [],
    filters.query
  )

  const { totalPages, effectivePage } = usePagination(
    transactionsResponse?.total ?? 0,
    filters.page,
    pageSize
  )

  const handleDelete = async (transaction: Transaction) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${transaction.description}"?`)) {
      return
    }

    try {
      await deleteTransaction.mutateAsync(transaction.id)
      toast({ title: 'Transacao removida', description: 'A transacao foi excluida com sucesso.' })
    } catch {
      toast({ title: 'Erro ao excluir', description: 'Nao foi possivel excluir a transacao.', variant: 'destructive' })
    }
  }

  return (
    <>
      <div>
        <Header
          onCreateClick={modals.openCreate}
          onCategoryClick={() => modals.setCategoryModal(true)}
          onPaymentMethodClick={() => modals.setPaymentModal(true)}
          onSubcategoryClick={() => modals.setSubcategoryModal(true)}
        />

        <CardFilters
          query={filters.query}
          type={filters.type}
          period={filters.period}
          onQueryChange={(q) => update({ q, page: 1 })}
          onTypeChange={(t) => update({ type: t, page: 1 })}
          onPeriodChange={(p) => update({ period: p, page: 1 })}
        />

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            {isLoading ? (
              <LoadingState />
            ) : isError ? (
              <ErrorState error={error} />
            ) : filteredTransactions.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <TransactionTable
                  transactions={filteredTransactions}
                  onEdit={modals.openEdit}
                  onDelete={handleDelete}
                />
                <Pagination
                  currentPage={effectivePage}
                  totalPages={totalPages}
                  totalItems={transactionsResponse?.total ?? 0}
                  onPageChange={(p) => update({ page: p })}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <TransfersModals
        transactionOpen={modals.transactionModal}
        categoryOpen={modals.categoryModal}
        subcategoryOpen={modals.subcategoryModal}
        paymentOpen={modals.paymentModal}
        transaction={modals.editingTransaction}
        categories={categories}
        paymentMethods={paymentMethods}
        selectedCategoryId={modals.selectedCategoryId}
        initialCategoryId={modals.initialCategoryId}
        initialPaymentMethodId={modals.initialPaymentMethodId}
        onCloseTransaction={modals.closeTransaction}
        onCloseCategory={() => modals.setCategoryModal(false)}
        onCloseSubcategory={() => modals.setSubcategoryModal(false)}
        onClosePayment={() => modals.setPaymentModal(false)}
        onCategorySelect={modals.openCategorySelect}
        onPaymentMethodSelect={modals.openPaymentMethodSelect}
        onOpenCategory={() => {
          modals.closeTransaction()
          modals.setCategoryModal(true)
        }}
        onOpenSubcategory={() => {
          modals.closeTransaction()
          modals.setSubcategoryModal(true)
        }}
        onOpenPayment={() => {
          modals.closeTransaction()
          modals.setPaymentModal(true)
        }}
      />

      <Toaster />
    </>
  )
}

function Header({ onCreateClick, onCategoryClick, onPaymentMethodClick, onSubcategoryClick }: {
  onCreateClick: () => void
  onCategoryClick: () => void
  onPaymentMethodClick: () => void
  onSubcategoryClick: () => void
}) {
  return (
    <div className="flex md:flex-row flex-col md:justify-between md:items-start gap-4 mb-8">
      <div>
        <h1 className="mb-2 font-bold text-foreground text-2xl">Transferencias</h1>
        <p className="text-secondary text-sm">Acompanhe seu historico de transacoes</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onCategoryClick}>+ Categoria</Button>
        <Button variant="outline" onClick={onSubcategoryClick}>+ Subcategoria</Button>
        <Button variant="outline" onClick={onPaymentMethodClick}>+ Metodo</Button>
        <Button className="bg-primary hover:bg-primary/90 shadow-cta text-white" onClick={onCreateClick}>
          <Plus className="w-4 h-4" />
          Nova Transferencia
        </Button>
      </div>
    </div>
  )
}

function CardFilters({ query, type, period, onQueryChange, onTypeChange, onPeriodChange }: {
  query: string
  type: string
  period: string
  onQueryChange: (q: string) => void
  onTypeChange: (t: string) => void
  onPeriodChange: (p: string) => void
}) {
  return (
    <Card className="bg-card mb-6 border-border">
      <CardContent className="p-4">
        <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="top-1/2 left-3 absolute w-4 h-4 text-secondary -translate-y-1/2" />
            <Input
              placeholder="Buscar por descricao, observacao ou categoria"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="bg-background pl-10 border-border text-foreground"
            />
          </div>

          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              {monthFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="flex justify-center items-center gap-2 h-[320px] text-secondary">
      <Loader2 className="w-4 h-4 animate-spin" />
      Carregando transacoes...
    </div>
  )
}

function ErrorState({ error }: { error: unknown }) {
  return (
    <div className="flex flex-col justify-center items-center gap-2 h-[320px] text-secondary text-center">
      <p>Falha ao carregar transacoes.</p>
      <p className="text-danger text-xs">{getErrorMessage(error, 'Erro inesperado')}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex justify-center items-center border border-border border-dashed rounded-md h-[320px] text-secondary">
      Nenhuma transacao encontrada para os filtros atuais.
    </div>
  )
}

function TransactionTable({ transactions, onEdit, onDelete }: {
  transactions: Transaction[]
  onEdit: (t: Transaction) => void
  onDelete: (t: Transaction) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-border border-b text-secondary text-xs text-left uppercase tracking-wide">
            <th className="px-3 py-3">Data</th>
            <th className="px-3 py-3">Descricao</th>
            <th className="px-3 py-3">Categoria</th>
            <th className="px-3 py-3">Metodo</th>
            <th className="px-3 py-3">Valor</th>
            <th className="px-3 py-3 text-right">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-border/60 border-b last:border-b-0">
              <td className="px-3 py-4 text-secondary">{formatDate(transaction.date)}</td>
              <td className="px-3 py-4">
                <p className="font-medium text-foreground">{transaction.description}</p>
                {transaction.subDescription && <p className="text-secondary text-xs">{transaction.subDescription}</p>}
              </td>
              <td className="px-3 py-4">
                <div className="flex flex-wrap gap-2">
                  {transaction.category ? (
                    <span
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-md font-medium text-xs"
                      style={{ backgroundColor: `${transaction.category.color}22`, color: transaction.category.color }}
                    >
                      <span className="rounded-full w-2 h-2" style={{ backgroundColor: transaction.category.color }} />
                      {transaction.category.name}
                    </span>
                  ) : (
                    <span className="text-secondary">-</span>
                  )}
                  {transaction.subcategory && (
                    <span
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-md font-medium text-xs"
                      style={{ backgroundColor: `${transaction.subcategory.color}22`, color: transaction.subcategory.color }}
                    >
                      <span className="rounded-full w-2 h-2" style={{ backgroundColor: transaction.subcategory.color }} />
                      {transaction.subcategory.name}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-4 text-secondary">{transaction.paymentMethod?.name ?? '-'}</td>
              <td className={`px-3 py-4 font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                {transaction.type === 'income' ? '+' : '-'} {formatBRL(Number(transaction.amount))}
              </td>
              <td className="px-3 py-4">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(transaction)}>
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(transaction)}>
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Pagination({ currentPage, totalPages, totalItems, onPageChange }: {
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (p: number) => void
}) {
  return (
    <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-3 mt-4 pt-4 border-border border-t text-secondary text-sm">
      <span>Pagina {currentPage} de {totalPages} - {totalItems} registros</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}>
          Proxima
        </Button>
      </div>
    </div>
  )
}

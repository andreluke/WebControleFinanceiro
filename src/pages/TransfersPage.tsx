import { useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, subMonths } from 'date-fns'
import { CalendarDays, Edit, Loader2, Plus, Search, Trash2 } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Toaster,
} from '@/components/ui'
import { ToastAction } from '@/components/ui/Toast'
import { useCategories, useCreateCategory, useDeleteCategory, useRestoreCategory, useUpdateCategory } from '@/hooks/useCategories'
import {
  useCreatePaymentMethod,
  useDeletePaymentMethod,
  usePaymentMethods,
  useRestorePaymentMethod,
  useUpdatePaymentMethod,
} from '@/hooks/usePaymentMethods'
import { useToast } from '@/hooks/use-toast'
import { useCreateTransaction, useDeleteTransaction, useTransactions, useUpdateTransaction } from '@/hooks/useTransactions'
import type { Category, CreateCategoryInput } from '@/types/category'
import type { CreatePaymentMethodInput, PaymentMethod } from '@/types/paymentMethod'
import type { CreateTransactionInput, Transaction, TransactionType } from '@/types/transaction'
import { getErrorMessage } from '@/utils/apiError'
import { formatBRL } from '@/utils/currency'
import { formatDate } from '@/utils/date'

const pageSize = 10

const transactionSchema = z.object({
  description: z.string().min(2, 'Descricao precisa ter pelo menos 2 caracteres'),
  subDescription: z.string().max(120, 'Maximo de 120 caracteres').optional(),
  amount: z.number().positive('Valor deve ser maior que zero'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Informe a data'),
  categoryId: z.string().optional(),
  paymentMethodId: z.string().optional(),
})

const categorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria e obrigatorio'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor invalida'),
})

const paymentMethodSchema = z.object({
  name: z.string().min(1, 'Nome do metodo e obrigatorio'),
})

type TransactionFormData = z.infer<typeof transactionSchema>
type CategoryFormData = z.infer<typeof categorySchema>
type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>
type TypeFilter = TransactionType | 'all'
type MonthFilter = 'all' | 'current' | 'previous' | 'two_months_ago'

const monthFilterOptions: Array<{ value: MonthFilter; label: string }> = [
  { value: 'all', label: 'Todo periodo' },
  { value: 'current', label: 'Este mes' },
  { value: 'previous', label: 'Mes passado' },
  { value: 'two_months_ago', label: '2 meses atras' },
]

function monthParamFromFilter(filter: MonthFilter) {
  if (filter === 'all') return undefined
  if (filter === 'current') return format(new Date(), 'yyyy-MM')
  if (filter === 'previous') return format(subMonths(new Date(), 1), 'yyyy-MM')
  return format(subMonths(new Date(), 2), 'yyyy-MM')
}

function toInputDate(isoDate: string) {
  return format(new Date(isoDate), 'yyyy-MM-dd')
}

function toApiDate(inputDate: string) {
  return `${inputDate}T12:00:00.000Z`
}

function formatCurrencyMasked(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function parseCurrencyMasked(input: string) {
  const digits = input.replace(/\D/g, '')
  if (!digits) return 0
  return Number(digits) / 100
}

export default function TransfersPage() {
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const shouldOpenCreateOnLoad = searchParams.get('new') === '1'

  const searchQuery = searchParams.get('q') ?? ''
  const typeParam = searchParams.get('type')
  const monthParamFromUrl = searchParams.get('period')
  const pageParam = Number(searchParams.get('page') ?? '1')

  const typeFilter: TypeFilter = typeParam === 'income' || typeParam === 'expense' ? typeParam : 'all'
  const monthFilter: MonthFilter =
    monthParamFromUrl === 'all' || monthParamFromUrl === 'previous' || monthParamFromUrl === 'two_months_ago' || monthParamFromUrl === 'current'
      ? monthParamFromUrl
      : 'current'
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1
  const [isModalOpen, setIsModalOpen] = useState(shouldOpenCreateOnLoad)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null)
  const dateInputRef = useRef<HTMLInputElement | null>(null)

  const openDatePicker = () => {
    const input = dateInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null
    if (!input) return

    if (input.showPicker) {
      input.showPicker()
      return
    }

    input.focus()
  }

  const monthParam = monthParamFromFilter(monthFilter)
  const transactionType = typeFilter === 'all' ? undefined : typeFilter

  const updateUrlFilters = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) next.delete(key)
      else next.set(key, value)
    })

    setSearchParams(next, { replace: true })
  }

  const { data: transactionsResponse, isLoading, isError, error } = useTransactions({
    page: currentPage,
    limit: pageSize,
    month: monthParam,
    type: transactionType,
  })
  const { data: categories = [] } = useCategories()
  const { data: paymentMethods = [] } = usePaymentMethods()

  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const restoreCategory = useRestoreCategory()
  const createPaymentMethod = useCreatePaymentMethod()
  const updatePaymentMethod = useUpdatePaymentMethod()
  const deletePaymentMethod = useDeletePaymentMethod()
  const restorePaymentMethod = useRestorePaymentMethod()

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      subDescription: '',
      amount: 0,
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
      categoryId: 'none',
      paymentMethodId: 'none',
    },
  })

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      color: '#3B82F6',
    },
  })

  const paymentMethodForm = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: '',
    },
  })

  const filteredTransactions = useMemo(() => {
    const allTransactions = transactionsResponse?.data ?? []
    const query = searchQuery.trim().toLowerCase()
    if (!query) return allTransactions

    return allTransactions.filter((transaction) => {
      return (
        transaction.description.toLowerCase().includes(query) ||
        (transaction.subDescription?.toLowerCase().includes(query) ?? false) ||
        (transaction.category?.name.toLowerCase().includes(query) ?? false)
      )
    })
  }, [transactionsResponse?.data, searchQuery])

  const selectedType = useWatch({ control: form.control, name: 'type' })
  const selectedCategoryId = useWatch({ control: form.control, name: 'categoryId' })
  const selectedPaymentMethodId = useWatch({ control: form.control, name: 'paymentMethodId' })
  const { ref: dateFieldRef, ...dateField } = form.register('date')

  const totalItems = transactionsResponse?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const effectivePage = Math.min(currentPage, totalPages)

  const openCreateModal = () => {
    setEditingTransaction(null)
    form.reset({
      description: '',
      subDescription: '',
      amount: 0,
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
      categoryId: 'none',
      paymentMethodId: 'none',
    })
    setIsModalOpen(true)
  }

  useEffect(() => {
    if (shouldOpenCreateOnLoad) {
      setSearchParams({}, { replace: true })
    }
  }, [setSearchParams, shouldOpenCreateOnLoad])

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    form.reset({
      description: transaction.description,
      subDescription: transaction.subDescription ?? '',
      amount: Number(transaction.amount),
      type: transaction.type,
      date: toInputDate(transaction.date),
      categoryId: transaction.categoryId ?? 'none',
      paymentMethodId: transaction.paymentMethodId ?? 'none',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (transaction: Transaction) => {
    const shouldDelete = window.confirm(`Tem certeza que deseja excluir "${transaction.description}"?`)
    if (!shouldDelete) return

    try {
      await deleteTransaction.mutateAsync(transaction.id)
      toast({ title: 'Transacao removida', description: 'A transacao foi excluida com sucesso.' })
    } catch {
      toast({ title: 'Erro ao excluir', description: 'Nao foi possivel excluir a transacao.', variant: 'destructive' })
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: CreateTransactionInput = {
      description: values.description,
      subDescription: values.subDescription?.trim() || undefined,
      amount: values.amount,
      type: values.type,
      date: toApiDate(values.date),
      categoryId: values.categoryId && values.categoryId !== 'none' ? values.categoryId : undefined,
      paymentMethodId: values.paymentMethodId && values.paymentMethodId !== 'none' ? values.paymentMethodId : undefined,
    }

    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({ id: editingTransaction.id, body: payload })
        toast({ title: 'Transacao atualizada', description: 'As informacoes foram salvas.' })
      } else {
        await createTransaction.mutateAsync(payload)
        toast({ title: 'Transacao criada', description: 'A nova transacao foi adicionada.' })
      }

      setIsModalOpen(false)
      setEditingTransaction(null)
      form.reset()
    } catch {
      toast({ title: 'Erro ao salvar', description: 'Revise os dados e tente novamente.', variant: 'destructive' })
    }
  })

  const openCategoryCreateModal = () => {
    setEditingCategory(null)
    categoryForm.reset({ name: '', color: '#3B82F6' })
    setIsCategoryModalOpen(true)
  }

  const openCategoryEditModal = (category: Category) => {
    setEditingCategory(category)
    categoryForm.reset({
      name: category.name,
      color: category.color,
    })
    setIsCategoryModalOpen(true)
  }

  const openPaymentMethodCreateModal = () => {
    setEditingPaymentMethod(null)
    paymentMethodForm.reset({ name: '' })
    setIsPaymentMethodModalOpen(true)
  }

  const openPaymentMethodEditModal = (paymentMethod: PaymentMethod) => {
    setEditingPaymentMethod(paymentMethod)
    paymentMethodForm.reset({ name: paymentMethod.name })
    setIsPaymentMethodModalOpen(true)
  }

  const onSubmitCategory = categoryForm.handleSubmit(async (values) => {
    const payload: CreateCategoryInput = {
      name: values.name,
      color: values.color,
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, body: payload })
        toast({ title: 'Categoria atualizada', description: 'A categoria foi atualizada com sucesso.' })
      } else {
        const created = await createCategory.mutateAsync(payload)
        form.setValue('categoryId', created.id)
        toast({ title: 'Categoria criada', description: 'A categoria foi criada e selecionada na transacao.' })
      }
      setEditingCategory(null)
      categoryForm.reset({ name: '', color: '#3B82F6' })
      setIsCategoryModalOpen(false)
    } catch {
      toast({ title: 'Erro na categoria', description: 'Nao foi possivel salvar a categoria.', variant: 'destructive' })
    }
  })

  const onSubmitPaymentMethod = paymentMethodForm.handleSubmit(async (values) => {
    const payload: CreatePaymentMethodInput = {
      name: values.name,
    }

    try {
      if (editingPaymentMethod) {
        await updatePaymentMethod.mutateAsync({ id: editingPaymentMethod.id, body: payload })
        toast({ title: 'Metodo atualizado', description: 'Metodo de pagamento atualizado com sucesso.' })
      } else {
        const created = await createPaymentMethod.mutateAsync(payload)
        form.setValue('paymentMethodId', created.id)
        toast({ title: 'Metodo criado', description: 'Metodo criado e selecionado na transacao.' })
      }
      setEditingPaymentMethod(null)
      paymentMethodForm.reset({ name: '' })
      setIsPaymentMethodModalOpen(false)
    } catch {
      toast({ title: 'Erro no metodo', description: 'Nao foi possivel salvar o metodo de pagamento.', variant: 'destructive' })
    }
  })

  const handleDeleteCategory = async (category: Category) => {
    const shouldDelete = window.confirm(`Deseja excluir a categoria "${category.name}"?`)
    if (!shouldDelete) return

    try {
      await deleteCategory.mutateAsync(category.id)
      toast({
        title: 'Categoria removida',
        description: 'A categoria foi removida com sucesso.',
        action: (
          <ToastAction
            altText="Desfazer remocao"
            onClick={() => {
              void restoreCategory.mutateAsync(category.id)
            }}
          >
            Desfazer
          </ToastAction>
        ),
      })
      if (selectedCategoryId === category.id) {
        form.setValue('categoryId', 'none')
      }
    } catch {
      toast({ title: 'Erro ao remover', description: 'Nao foi possivel excluir a categoria.', variant: 'destructive' })
    }
  }

  const handleDeletePaymentMethod = async (paymentMethod: PaymentMethod) => {
    const shouldDelete = window.confirm(`Deseja excluir o metodo "${paymentMethod.name}"?`)
    if (!shouldDelete) return

    try {
      await deletePaymentMethod.mutateAsync(paymentMethod.id)
      toast({
        title: 'Metodo removido',
        description: 'O metodo de pagamento foi removido com sucesso.',
        action: (
          <ToastAction
            altText="Desfazer remocao"
            onClick={() => {
              void restorePaymentMethod.mutateAsync(paymentMethod.id)
            }}
          >
            Desfazer
          </ToastAction>
        ),
      })
      if (selectedPaymentMethodId === paymentMethod.id) {
        form.setValue('paymentMethodId', 'none')
      }
    } catch {
      toast({ title: 'Erro ao remover', description: 'Nao foi possivel excluir o metodo de pagamento.', variant: 'destructive' })
    }
  }

  return (
    <>
      <div>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">Transferencias</h1>
            <p className="text-sm text-secondary">Acompanhe seu historico de transacoes</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={openCategoryCreateModal}>
              + Categoria
            </Button>
            <Button variant="outline" onClick={openPaymentMethodCreateModal}>
              + Metodo
            </Button>
            <Button className="bg-primary text-white shadow-cta hover:bg-primary/90" onClick={openCreateModal}>
              <Plus className="h-4 w-4" />
              Nova Transferencia
            </Button>
          </div>
        </div>

        <Card className="mb-6 border-border bg-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
                <Input
                  placeholder="Buscar por descricao, observacao ou categoria"
                  value={searchQuery}
                  onChange={(e) =>
                    updateUrlFilters({
                      q: e.target.value || null,
                      page: '1',
                    })
                  }
                  className="border-border bg-background pl-10 text-foreground"
                />
              </div>

              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  updateUrlFilters({
                    type: value === 'all' ? null : value,
                    page: '1',
                  })
                }}
              >
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={monthFilter}
                onValueChange={(value) => {
                  updateUrlFilters({
                    period: value === 'current' ? null : value,
                    page: '1',
                  })
                }}
              >
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  {monthFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex h-[320px] items-center justify-center gap-2 text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando transacoes...
              </div>
            ) : isError ? (
              <div className="flex h-[320px] flex-col items-center justify-center gap-2 text-center text-secondary">
                <p>Falha ao carregar transacoes.</p>
                <p className="text-xs text-danger">{getErrorMessage(error, 'Erro inesperado')}</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center rounded-md border border-dashed border-border text-secondary">
                Nenhuma transacao encontrada para os filtros atuais.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-secondary">
                      <th className="px-3 py-3">Data</th>
                      <th className="px-3 py-3">Descricao</th>
                      <th className="px-3 py-3">Categoria</th>
                      <th className="px-3 py-3">Metodo</th>
                      <th className="px-3 py-3">Valor</th>
                      <th className="px-3 py-3 text-right">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-border/60 last:border-b-0">
                        <td className="px-3 py-4 text-secondary">{formatDate(transaction.date)}</td>
                        <td className="px-3 py-4">
                          <p className="font-medium text-foreground">{transaction.description}</p>
                          {transaction.subDescription ? <p className="text-xs text-secondary">{transaction.subDescription}</p> : null}
                        </td>
                        <td className="px-3 py-4">
                          {transaction.category ? (
                            <span
                              className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium"
                              style={{
                                backgroundColor: `${transaction.category.color}22`,
                                color: transaction.category.color,
                              }}
                            >
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: transaction.category.color }} />
                              {transaction.category.name}
                            </span>
                          ) : (
                            <span className="text-secondary">-</span>
                          )}
                        </td>
                        <td className="px-3 py-4 text-secondary">{transaction.paymentMethod?.name ?? '-'}</td>
                        <td className={`px-3 py-4 font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                          {transaction.type === 'income' ? '+' : '-'} {formatBRL(Number(transaction.amount))}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(transaction)} aria-label={`Editar transação ${transaction.description}`}>
                              <Edit className="h-4 w-4" />
                              Editar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(transaction)} aria-label={`Excluir transação ${transaction.description}`}>
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-border pt-4 text-sm text-secondary sm:flex-row sm:items-center">
              <span>
                Pagina {effectivePage} de {totalPages} - {totalItems} registros
              </span>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateUrlFilters({ page: String(Math.max(1, effectivePage - 1)) })}
                  disabled={effectivePage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateUrlFilters({ page: String(Math.min(totalPages, effectivePage + 1)) })}
                  disabled={effectivePage >= totalPages}
                >
                  Proxima
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Editar transacao' : 'Nova transacao'}</DialogTitle>
            <DialogDescription>Preencha os campos abaixo para salvar a transacao.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Input id="description" placeholder="Ex: Aluguel" {...form.register('description')} />
              {form.formState.errors.description ? <p className="text-xs text-danger">{form.formState.errors.description.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subDescription">Observacao (opcional)</Label>
              <Input id="subDescription" placeholder="Ex: Pagamento mensal" {...form.register('subDescription')} />
              {form.formState.errors.subDescription ? <p className="text-xs text-danger">{form.formState.errors.subDescription.message}</p> : null}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-secondary">R$</span>
                  <Controller
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <Input
                        id="amount"
                        type="text"
                        inputMode="numeric"
                        placeholder="0,00"
                        className="pl-10"
                        value={formatCurrencyMasked(Number(field.value) || 0)}
                        onChange={(event) => field.onChange(parseCurrencyMasked(event.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    )}
                  />
                </div>
                {form.formState.errors.amount ? <p className="text-xs text-danger">{form.formState.errors.amount.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={selectedType} onValueChange={(value) => form.setValue('type', value as TransactionType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    ref={(element) => {
                      dateInputRef.current = element
                      dateFieldRef(element)
                    }}
                    className="pr-10 [color-scheme:dark] [appearance:textfield] [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:opacity-0"
                    {...dateField}
                  />
                  <button
                    type="button"
                    aria-label="Abrir calendario"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-secondary hover:text-foreground"
                    onClick={openDatePicker}
                  >
                    <CalendarDays className="h-4 w-4" />
                  </button>
                </div>
                {form.formState.errors.date ? <p className="text-xs text-danger">{form.formState.errors.date.message}</p> : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Categoria</Label>
                  <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-primary" onClick={openCategoryCreateModal}>
                    Nova
                  </Button>
                </div>
                <Select value={selectedCategoryId || 'none'} onValueChange={(value) => form.setValue('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Metodo de pagamento</Label>
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-primary" onClick={openPaymentMethodCreateModal}>
                  Novo
                </Button>
              </div>
              <Select value={selectedPaymentMethodId || 'none'} onValueChange={(value) => form.setValue('paymentMethodId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nao informado</SelectItem>
                  {paymentMethods.map((paymentMethod) => (
                    <SelectItem key={paymentMethod.id} value={paymentMethod.id}>
                      {paymentMethod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingTransaction(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createTransaction.isPending || updateTransaction.isPending}>
                {createTransaction.isPending || updateTransaction.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingTransaction ? (
                  'Salvar alteracoes'
                ) : (
                  'Criar transacao'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
            <DialogDescription>Crie, edite ou remova categorias para organizar suas transacoes.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={onSubmitCategory}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
              <div className="space-y-2">
                <Label htmlFor="category-name">Nome</Label>
                <Input id="category-name" placeholder="Ex: Moradia" {...categoryForm.register('name')} />
                {categoryForm.formState.errors.name ? <p className="text-xs text-danger">{categoryForm.formState.errors.name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-color">Cor</Label>
                <Input id="category-color" type="color" className="h-10 p-1" {...categoryForm.register('color')} />
                {categoryForm.formState.errors.color ? <p className="text-xs text-danger">{categoryForm.formState.errors.color.message}</p> : null}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingCategory(null)
                  categoryForm.reset({ name: '', color: '#3B82F6' })
                }}
              >
                Limpar
              </Button>
              <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                {createCategory.isPending || updateCategory.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingCategory ? (
                  'Salvar categoria'
                ) : (
                  'Criar categoria'
                )}
              </Button>
            </DialogFooter>
          </form>

          <div className="space-y-2 rounded-md border border-border bg-background/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Categorias ativas</p>
            <div className="max-h-44 space-y-2 overflow-auto pr-1">
              {categories.length === 0 ? (
                <p className="text-sm text-secondary">Nenhuma categoria cadastrada.</p>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="text-sm text-foreground">{category.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => openCategoryEditModal(category)} aria-label={`Editar categoria ${category.name}`}>
                        Editar
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleDeleteCategory(category)} aria-label={`Excluir categoria ${category.name}`}>
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentMethodModalOpen} onOpenChange={setIsPaymentMethodModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPaymentMethod ? 'Editar metodo de pagamento' : 'Novo metodo de pagamento'}</DialogTitle>
            <DialogDescription>Crie, edite ou remova metodos para classificar suas transacoes.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={onSubmitPaymentMethod}>
            <div className="space-y-2">
              <Label htmlFor="payment-method-name">Nome</Label>
              <Input id="payment-method-name" placeholder="Ex: Cartao de credito" {...paymentMethodForm.register('name')} />
              {paymentMethodForm.formState.errors.name ? <p className="text-xs text-danger">{paymentMethodForm.formState.errors.name.message}</p> : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingPaymentMethod(null)
                  paymentMethodForm.reset({ name: '' })
                }}
              >
                Limpar
              </Button>
              <Button type="submit" disabled={createPaymentMethod.isPending || updatePaymentMethod.isPending}>
                {createPaymentMethod.isPending || updatePaymentMethod.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingPaymentMethod ? (
                  'Salvar metodo'
                ) : (
                  'Criar metodo'
                )}
              </Button>
            </DialogFooter>
          </form>

          <div className="space-y-2 rounded-md border border-border bg-background/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Metodos ativos</p>
            <div className="max-h-44 space-y-2 overflow-auto pr-1">
              {paymentMethods.length === 0 ? (
                <p className="text-sm text-secondary">Nenhum metodo cadastrado.</p>
              ) : (
                paymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id} className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2">
                    <span className="text-sm text-foreground">{paymentMethod.name}</span>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => openPaymentMethodEditModal(paymentMethod)} aria-label={`Editar método ${paymentMethod.name}`}>
                        Editar
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleDeletePaymentMethod(paymentMethod)} aria-label={`Excluir método ${paymentMethod.name}`}>
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  )
}

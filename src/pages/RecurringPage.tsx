import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Edit, Loader2, Play, Plus, Power, Trash2 } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
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
import { useToast } from '@/hooks/use-toast'
import {
  useCreateRecurringTransaction,
  useDeleteRecurringTransaction,
  useRecurringTransactions,
  useToggleRecurringTransaction,
  useUpdateRecurringTransaction,
  useProcessRecurringTransaction,
} from '@/hooks/useRecurringTransactions'
import type { CreateRecurringTransactionInput, FrequencyType, RecurringTransaction, TransactionType } from '@/types/recurring'

const recurringSchema = z.object({
  description: z.string().min(2, 'Descricao precisa ter pelo menos 2 caracteres'),
  subDescription: z.string().max(120, 'Maximo de 120 caracteres').optional(),
  amount: z.number().positive('Valor deve ser maior que zero'),
  type: z.enum(['income', 'expense']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  dayOfMonth: z.number().min(1).max(31),
  dayOfWeek: z.number().min(0).max(6).optional(),
  startDate: z.string().min(1, 'Informe a data inicial'),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
  paymentMethodId: z.string().optional(),
})

type RecurringFormData = z.infer<typeof recurringSchema>

const frequencyOptions: Array<{ value: FrequencyType; label: string }> = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
]

const dayOfWeekOptions = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terca' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sabado' },
]

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

export default function RecurringPage() {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null)

  const { data: recurrings = [], isLoading, isError, error } = useRecurringTransactions()

  const createRecurring = useCreateRecurringTransaction()
  const updateRecurring = useUpdateRecurringTransaction()
  const deleteRecurring = useDeleteRecurringTransaction()
  const toggleRecurring = useToggleRecurringTransaction()
  const processRecurring = useProcessRecurringTransaction()

  const form = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      description: '',
      subDescription: '',
      amount: 0,
      type: 'expense',
      frequency: 'monthly',
      dayOfMonth: 1,
      dayOfWeek: undefined,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      categoryId: '',
      paymentMethodId: '',
    },
  })

  const selectedType = useWatch({ control: form.control, name: 'type' })
  const selectedFrequency = useWatch({ control: form.control, name: 'frequency' })

  const openCreateModal = () => {
    setEditingRecurring(null)
    form.reset({
      description: '',
      subDescription: '',
      amount: 0,
      type: 'expense',
      frequency: 'monthly',
      dayOfMonth: 1,
      dayOfWeek: undefined,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      categoryId: '',
      paymentMethodId: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (recurring: RecurringTransaction) => {
    setEditingRecurring(recurring)
    form.reset({
      description: recurring.description,
      subDescription: recurring.subDescription ?? '',
      amount: Number(recurring.amount),
      type: recurring.type,
      frequency: recurring.frequency,
      dayOfMonth: recurring.dayOfMonth,
      dayOfWeek: recurring.dayOfWeek ?? undefined,
      startDate: toInputDate(recurring.startDate),
      endDate: recurring.endDate ? toInputDate(recurring.endDate) : '',
      categoryId: recurring.categoryId ?? '',
      paymentMethodId: recurring.paymentMethodId ?? '',
    })
    setIsModalOpen(true)
  }

  const handleToggle = async (recurring: RecurringTransaction) => {
    try {
      await toggleRecurring.mutateAsync(recurring.id)
      toast({
        title: recurring.isActive ? 'Transacao pausada' : 'Transacao ativada',
        description: recurring.isActive ? 'A transacao foi pausada.' : 'A transacao foi ativada.',
      })
    } catch {
      toast({ title: 'Erro ao alternar', description: 'Nao foi possivel alterar o status.', variant: 'destructive' })
    }
  }

  const handleProcess = async (recurring: RecurringTransaction) => {
    try {
      await processRecurring.mutateAsync(recurring.id)
      toast({ title: 'Transacao gerada', description: 'A transacao foi criada com sucesso.' })
    } catch {
      toast({ title: 'Erro ao processar', description: 'Nao foi possivel gerar a transacao.', variant: 'destructive' })
    }
  }

  const handleDelete = async (recurring: RecurringTransaction) => {
    const shouldDelete = window.confirm(`Tem certeza que deseja excluir "${recurring.description}"?`)
    if (!shouldDelete) return

    try {
      await deleteRecurring.mutateAsync(recurring.id)
      toast({ title: 'Transacao removida', description: 'A transacao foi excluida com sucesso.' })
    } catch {
      toast({ title: 'Erro ao excluir', description: 'Nao foi possivel excluir a transacao.', variant: 'destructive' })
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: CreateRecurringTransactionInput = {
      description: values.description,
      subDescription: values.subDescription?.trim() || undefined,
      amount: values.amount,
      type: values.type,
      frequency: values.frequency,
      dayOfMonth: values.dayOfMonth,
      dayOfWeek: values.dayOfWeek,
      startDate: toApiDate(values.startDate),
      endDate: values.endDate ? toApiDate(values.endDate) : undefined,
      categoryId: values.categoryId && values.categoryId !== 'none' ? values.categoryId : undefined,
      paymentMethodId: values.paymentMethodId && values.paymentMethodId !== 'none' ? values.paymentMethodId : undefined,
    }

    try {
      if (editingRecurring) {
        await updateRecurring.mutateAsync({ id: editingRecurring.id, body: payload })
        toast({ title: 'Transacao atualizada', description: 'As informacoes foram salvas.' })
      } else {
        await createRecurring.mutateAsync(payload)
        toast({ title: 'Transacao criada', description: 'A nova transacao recorrente foi adicionada.' })
      }

      setIsModalOpen(false)
      setEditingRecurring(null)
      form.reset()
    } catch {
      toast({ title: 'Erro ao salvar', description: 'Revise os dados e tente novamente.', variant: 'destructive' })
    }
  })

  const getFrequencyLabel = (freq: FrequencyType) => {
    return frequencyOptions.find((f) => f.value === freq)?.label ?? freq
  }

  return (
    <>
      <div>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">Transacoes Recorrentes</h1>
            <p className="text-sm text-secondary">Gerencie suas receitas e despesas automaticas</p>
          </div>
          <Button className="bg-primary text-white shadow-cta hover:bg-primary/90" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Nova Recorrencia
          </Button>
        </div>

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
                <p className="text-xs text-danger">{String(error)}</p>
              </div>
            ) : recurrings.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center rounded-md border border-dashed border-border text-secondary">
                Nenhuma transacao recorrente encontrada. Crie uma nova para comecar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-secondary">
                      <th className="px-3 py-3">Descricao</th>
                      <th className="px-3 py-3">Frequencia</th>
                      <th className="px-3 py-3">Valor</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 text-right">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurrings.map((recurring) => (
                      <tr key={recurring.id} className="border-b border-border/60 last:border-b-0">
                        <td className="px-3 py-4">
                          <p className="font-medium text-foreground">{recurring.description}</p>
                          {recurring.subDescription ? <p className="text-xs text-secondary">{recurring.subDescription}</p> : null}
                        </td>
                        <td className="px-3 py-4 text-secondary">{getFrequencyLabel(recurring.frequency)}</td>
                        <td className={`px-3 py-4 font-semibold ${recurring.type === 'income' ? 'text-success' : 'text-danger'}`}>
                          {recurring.type === 'income' ? '+' : '-'} {formatCurrencyMasked(Number(recurring.amount))}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              recurring.isActive ? 'bg-success/20 text-success' : 'bg-secondary/20 text-secondary'
                            }`}
                          >
                            {recurring.isActive ? 'Ativo' : 'Pausado'}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex justify-end gap-2">
                            {recurring.isActive && (
                              <Button variant="outline" size="sm" onClick={() => handleProcess(recurring)} aria-label="Gerar transacao agora">
                                <Play className="h-4 w-4" />
                                Gerar
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleToggle(recurring)} aria-label={recurring.isActive ? 'Pausar' : 'Ativar'}>
                              <Power className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEditModal(recurring)} aria-label="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(recurring)} aria-label="Excluir">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRecurring ? 'Editar transacao recorrente' : 'Nova transacao recorrente'}</DialogTitle>
            <DialogDescription>Defina os detalhes da transacao que se repetira automaticamente.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Input id="description" placeholder="Ex: Assinatura Netflix" {...form.register('description')} />
              {form.formState.errors.description ? <p className="text-xs text-danger">{form.formState.errors.description.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subDescription">Observacao (opcional)</Label>
              <Input id="subDescription" placeholder="Ex: Plano familiar" {...form.register('subDescription')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequencia</Label>
                <Select value={selectedFrequency} onValueChange={(value) => form.setValue('frequency', value as FrequencyType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dayOfMonth">Dia do mes (1-31)</Label>
                <Input
                  id="dayOfMonth"
                  type="number"
                  min={1}
                  max={31}
                  {...form.register('dayOfMonth', { valueAsNumber: true })}
                />
                {form.formState.errors.dayOfMonth ? <p className="text-xs text-danger">{form.formState.errors.dayOfMonth.message}</p> : null}
              </div>
            </div>

            {selectedFrequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Dia da semana</Label>
                <Select
                  value={form.watch('dayOfWeek')?.toString() ?? ''}
                  onValueChange={(value) => form.setValue('dayOfWeek', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOfWeekOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data inicial</Label>
                <Input id="startDate" type="date" {...form.register('startDate')} className="[color-scheme:dark]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data final (opcional)</Label>
                <Input id="endDate" type="date" {...form.register('endDate')} className="[color-scheme:dark]" />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingRecurring(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createRecurring.isPending || updateRecurring.isPending}>
                {createRecurring.isPending || updateRecurring.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingRecurring ? (
                  'Salvar alteracoes'
                ) : (
                  'Criar transacao'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  )
}

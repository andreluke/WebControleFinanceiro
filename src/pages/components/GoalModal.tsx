import { useEffect, useState, useRef } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Loader2, Trash2, Plus } from 'lucide-react'
import type { Goal } from '@/types/goal'
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label } from '@/components/ui'
import { useCreateGoal, useUpdateGoal, useContributeGoal, useGoalContributions, useRemoveContribution, useWithdrawGoal } from '@/hooks/useGoals'
import { useToast } from '@/hooks/use-toast'
import { formatBRL } from '@/utils/currency'

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

const goalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  description: z.string().max(500).optional(),
  targetAmount: z.number().positive('Valor deve ser positivo'),
  deadline: z.string().optional(),
  color: z.string().max(20).optional(),
})

const moneySchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
})

type GoalFormData = z.infer<typeof goalSchema>
type MoneyFormData = z.infer<typeof moneySchema>

type ModalMode = 'view' | 'deposit' | 'withdraw'

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  goal: Goal | null
  initialMode?: ModalMode
}

const defaultValues: GoalFormData = {
  name: '',
  description: '',
  targetAmount: 0,
  deadline: '',
  color: '#3B82F6',
}

export function GoalModal({ isOpen, onClose, goal, initialMode = 'view' }: GoalModalProps) {
  const { toast } = useToast()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const contributeGoal = useContributeGoal()
  const withdrawGoal = useWithdrawGoal()
  const [mode, setMode] = useState<ModalMode>('view')
  const deadlineInputRef = useRef<HTMLInputElement | null>(null)
  const prevIsOpenRef = useRef(isOpen)

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues,
  })

  const moneyForm = useForm<MoneyFormData>({
    resolver: zodResolver(moneySchema),
    defaultValues: { amount: 0 },
  })

  function openDeadlinePicker() {
    deadlineInputRef.current?.showPicker()
  }

  const [colorValue] = useWatch({
    control: form.control,
    name: ['color'],
  })

  const isLoading = createGoal.isPending || updateGoal.isPending

  useEffect(() => {
    if (isOpen) {
      if (goal) {
        form.reset({
          name: goal.name,
          description: goal.description || '',
          targetAmount: Number(goal.targetAmount),
          deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
          color: goal.color || '#3B82F6',
        })
      } else {
        form.reset(defaultValues)
      }
      moneyForm.reset({ amount: 0 })
    }
  }, [isOpen, goal, form, moneyForm])

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setMode(initialMode)
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, initialMode])

  const handleSave = form.handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
      }

      if (goal) {
        await updateGoal.mutateAsync({ id: goal.id, data: payload })
        toast({ title: 'Meta atualizada', description: 'A meta foi atualizada com sucesso.' })
      } else {
        await createGoal.mutateAsync(payload)
        toast({ title: 'Meta criada', description: 'A meta foi criada com sucesso.' })
      }
      form.reset(defaultValues)
      onClose()
    } catch {
      toast({ title: 'Erro na meta', description: 'Não foi possível salvar a meta.', variant: 'destructive' })
    }
  })

  const handleDeposit = moneyForm.handleSubmit(async (values) => {
    if (!goal) return

    try {
      await contributeGoal.mutateAsync({ id: goal.id, amount: values.amount })
      toast({ title: 'Deposito realizado', description: `R$ ${formatBRL(values.amount)} guardado na meta ${goal.name}.` })
      moneyForm.reset({ amount: 0 })
      setMode('view')
    } catch {
      toast({ title: 'Erro ao depositar', description: 'Não foi possível realizar o deposito.', variant: 'destructive' })
    }
  })

  const handleWithdraw = moneyForm.handleSubmit(async (values) => {
    if (!goal) return

    try {
      await withdrawGoal.mutateAsync({ id: goal.id, amount: values.amount })
      toast({ title: 'Saque realizado', description: `R$ ${formatBRL(values.amount)} sacado da meta ${goal.name}.` })
      moneyForm.reset({ amount: 0 })
      setMode('view')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Não foi possível realizar o saque.'
      toast({ title: 'Erro ao sacar', description: message, variant: 'destructive' })
    }
  })

  const renderGoalInfo = () => {
    if (!goal) return null
    const progress = Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100)
    const remaining = Number(goal.targetAmount) - Number(goal.currentAmount)

    return (
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground">Guardado</p>
            <p className="text-lg font-semibold text-primary">{formatBRL(Number(goal.currentAmount))}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Meta</p>
            <p className="text-lg font-semibold">{formatBRL(Number(goal.targetAmount))}</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
            <div
              className={`h-full ${progress >= 100 ? 'bg-success' : 'bg-primary'} transition-all`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {remaining > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Faltam {formatBRL(remaining)} para atingir a meta
          </p>
        )}
        {progress >= 100 && (
          <p className="text-xs text-success text-center font-medium">Meta atingida!</p>
        )}
      </div>
    )
  }

  const renderMoneyForm = (type: 'deposit' | 'withdraw') => {
    const isDeposit = type === 'deposit'
    const isPending = isDeposit ? contributeGoal.isPending : withdrawGoal.isPending
    const onSubmit = isDeposit ? handleDeposit : handleWithdraw
    const Icon = isDeposit ? ArrowUpRight : ArrowDownLeft
    const colorClass = isDeposit ? 'text-primary' : 'text-success'
    const bgClass = isDeposit ? 'bg-primary/10' : 'bg-success/10'

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className={`${bgClass} p-4 rounded-lg`}>
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`h-4 w-4 ${colorClass}`} />
            <p className={`font-medium text-sm ${colorClass}`}>
              {isDeposit ? 'Depositar na meta' : 'Sacar da meta'}
            </p>
          </div>
          {renderGoalInfo()}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <div className="relative">
            <span className="top-1/2 left-3 absolute font-medium text-secondary text-sm -translate-y-1/2 pointer-events-none">R$</span>
            <Controller
              control={moneyForm.control}
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
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => setMode('view')} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : isDeposit ? (
              <>
                <ArrowUpRight className="w-4 h-4" />
                Depositar
              </>
            ) : (
              <>
                <ArrowDownLeft className="w-4 h-4" />
                Sacar
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    )
  }

  const renderEditForm = () => (
    <form onSubmit={handleSave} className="space-y-4">
      {renderGoalInfo()}

      <div className="space-y-2">
        <Label htmlFor="name">Nome da meta</Label>
        <Input
          id="name"
          placeholder="Ex: Viagem para o Rio"
          {...form.register('name')}
        />
        {form.formState.errors.name && (
          <p className="text-danger text-xs">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descricao (opcional)</Label>
        <Input
          id="description"
          placeholder="Ex: Poupar para as ferias"
          {...form.register('description')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAmount">Valor alvo</Label>
        <div className="relative">
          <span className="top-1/2 left-3 absolute font-medium text-secondary text-sm -translate-y-1/2 pointer-events-none">R$</span>
          <Controller
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
              <Input
                id="targetAmount"
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
        {form.formState.errors.targetAmount && (
          <p className="text-danger text-xs">{form.formState.errors.targetAmount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Prazo (opcional)</Label>
        <div className="relative">
          <Controller
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <Input
                id="deadline"
                type="date"
                ref={(el) => {
                  deadlineInputRef.current = el
                  field.ref(el)
                }}
                className="[&::-webkit-calendar-picker-indicator]:opacity-0 pr-10 [&::-webkit-calendar-picker-indicator]:pointer-events-none [color-scheme:dark] [appearance:textfield]"
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <button
            type="button"
            aria-label="Abrir calendario"
            className="top-1/2 right-2 absolute p-1 rounded text-secondary hover:text-foreground -translate-y-1/2"
            onClick={openDeadlinePicker}
          >
            <CalendarDays className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Cor</Label>
        <div className="flex gap-2">
          {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
            <button
              key={color}
              type="button"
              className={`h-8 w-8 rounded-full border-2 ${colorValue && colorValue[0] === color ? 'border-foreground' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
              onClick={() => form.setValue('color', color)}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => setMode('deposit')} className="flex-1">
          <ArrowUpRight className="w-4 h-4" />
          Depositar
        </Button>
        {goal && Number(goal.currentAmount) > 0 && (
          <Button type="button" variant="outline" onClick={() => setMode('withdraw')} className="flex-1">
            <ArrowDownLeft className="w-4 h-4" />
            Sacar
          </Button>
        )}
      </div>

      <DialogFooter className="pt-2">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : 'Salvar alteracoes'}
        </Button>
      </DialogFooter>
    </form>
  )

  return (
    <DialogContent className="max-h-[85vh] flex flex-col overflow-hidden">
      <DialogHeader className="shrink-0">
        <DialogTitle>
          {!goal ? 'Nova meta' : mode === 'deposit' ? 'Depositar' : mode === 'withdraw' ? 'Sacar' : 'Editar meta'}
        </DialogTitle>
        <DialogDescription>
          {!goal ? 'Defina uma nova meta de economia.' : 
           mode === 'deposit' ? 'Guarde dinheiro nesta meta.' :
           mode === 'withdraw' ? 'Retire dinheiro da meta para sua conta.' :
           'Atualize os dados da sua meta.'}
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto min-h-0">
        {!goal ? (
          <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da meta</Label>
            <Input id="name" placeholder="Ex: Viagem para o Rio" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-danger text-xs">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao (opcional)</Label>
            <Input id="description" placeholder="Ex: Poupar para as ferias" {...form.register('description')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Valor alvo</Label>
            <div className="relative">
              <span className="top-1/2 left-3 absolute font-medium text-secondary text-sm -translate-y-1/2 pointer-events-none">R$</span>
              <Controller
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <Input
                    id="targetAmount"
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
            {form.formState.errors.targetAmount && (
              <p className="text-danger text-xs">{form.formState.errors.targetAmount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo (opcional)</Label>
            <div className="relative">
              <Controller
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <Input
                    id="deadline"
                    type="date"
                    ref={(el) => {
                      deadlineInputRef.current = el
                      field.ref(el)
                    }}
                    className="[&::-webkit-calendar-picker-indicator]:opacity-0 pr-10 [&::-webkit-calendar-picker-indicator]:pointer-events-none [color-scheme:dark] [appearance:textfield]"
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <button
                type="button"
                aria-label="Abrir calendario"
                className="top-1/2 right-2 absolute p-1 rounded text-secondary hover:text-foreground -translate-y-1/2"
                onClick={openDeadlinePicker}
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2">
              {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 ${colorValue && colorValue[0] === color ? 'border-foreground' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => form.setValue('color', color)}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Criar meta
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      ) : mode === 'deposit' ? (
        <>
          {renderMoneyForm('deposit')}
          {goal && <TransactionsList goalId={goal.id} onRemoved={() => {}} />}
        </>
      ) : mode === 'withdraw' ? (
        renderMoneyForm('withdraw')
      ) : (
        <>
          {renderEditForm()}
          {goal && <TransactionsList goalId={goal.id} onRemoved={() => {}} />}
        </>
      )}
      </div>
    </DialogContent>
  )
}

function TransactionsList({ goalId, onRemoved }: { goalId: string; onRemoved: () => void }) {
  const { toast } = useToast()
  const { data: transactions = [], isLoading } = useGoalContributions(goalId)
  const removeContribution = useRemoveContribution()

  const handleRemove = async (transactionId: string, type: string) => {
    const isDeposit = type === 'deposit'
    const message = isDeposit
      ? 'Tem certeza que deseja remover este deposito? A transacao sera excluida.'
      : 'Tem certeza que deseja remover este saque? A transacao sera excluida e o valor voltara para a meta.'

    if (!window.confirm(message)) {
      return
    }

    try {
      await removeContribution.mutateAsync(transactionId)
      toast({
        title: isDeposit ? 'Deposito removido' : 'Saque removido',
        description: isDeposit
          ? 'O deposito foi removido com sucesso.'
          : 'O saque foi removido e o valor voltou para a meta.',
      })
      onRemoved()
    } catch {
      toast({ title: 'Erro', description: 'Nao foi possivel remover.', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm py-2">Carregando historico...</p>
  }

  if (transactions.length === 0) {
    return (
      <div className="border-t pt-4 mt-4">
        <p className="text-xs text-muted-foreground text-center">Nenhuma transacao realizada ainda.</p>
      </div>
    )
  }

  const deposits = transactions.filter(t => t.type === 'deposit')
  const withdrawals = transactions.filter(t => t.type === 'withdrawal')

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Historico de transacoes</h4>
        <span className="text-xs text-muted-foreground">{transactions.length} transacao(oes)</span>
      </div>

      {withdrawals.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-success font-medium mb-1">Saques</p>
          <div className="space-y-1">
            {withdrawals.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between bg-success/10 p-2 rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="h-4 w-4 text-success" />
                  <div>
                    <p className="font-medium text-success">- {formatBRL(Number(tx.amount))}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-danger"
                  onClick={() => handleRemove(tx.id, tx.type)}
                  disabled={removeContribution.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {deposits.length > 0 && (
        <div>
          <p className="text-xs text-primary font-medium mb-1">Depositos</p>
          <div className="space-y-1">
            {deposits.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between bg-primary/10 p-2 rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-primary">+ {formatBRL(Number(tx.amount))}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-danger"
                  onClick={() => handleRemove(tx.id, tx.type)}
                  disabled={removeContribution.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

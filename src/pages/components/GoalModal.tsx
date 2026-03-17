import { useEffect, useState, useRef } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarDays, Loader2 } from 'lucide-react'
import type { Goal } from '@/types/goal'
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label } from '@/components/ui'
import { useCreateGoal, useUpdateGoal, useContributeGoal } from '@/hooks/useGoals'
import { useToast } from '@/hooks/use-toast'

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

const contributeSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
})

type GoalFormData = z.infer<typeof goalSchema>
type ContributeFormData = z.infer<typeof contributeSchema>

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  goal: Goal | null
  initialContributeMode?: boolean
}

const defaultValues: GoalFormData = {
  name: '',
  description: '',
  targetAmount: 0,
  deadline: '',
  color: '#3B82F6',
}

export function GoalModal({ isOpen, onClose, goal, initialContributeMode = false }: GoalModalProps) {
  const { toast } = useToast()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const contributeGoal = useContributeGoal()
  const [showContribute, setShowContribute] = useState(false)
  const deadlineInputRef = useRef<HTMLInputElement | null>(null)
  const prevIsOpenRef = useRef(isOpen)

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues,
  })

  const contributeForm = useForm<ContributeFormData>({
    resolver: zodResolver(contributeSchema),
    defaultValues: { amount: 0 },
  })

  function openDeadlinePicker() {
    deadlineInputRef.current?.showPicker()
  }

  const [colorValue] = useWatch({
    control: form.control,
    name: ['color'],
  })

  const isEditing = !!goal
  const isLoading = createGoal.isPending || updateGoal.isPending || contributeGoal.isPending

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
      contributeForm.reset({ amount: 0 })
    }
  }, [isOpen, goal, form, contributeForm])

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowContribute(initialContributeMode)
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, initialContributeMode])

  const onSubmit = form.handleSubmit(async (values) => {
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

  const onContribute = contributeForm.handleSubmit(async (values) => {
    if (!goal) return

    try {
      await contributeGoal.mutateAsync({ id: goal.id, amount: values.amount })
      toast({ title: 'Contribuição registrada', description: `Você adicionou R$ ${values.amount} à meta ${goal.name}.` })
      contributeForm.reset({ amount: 0 })
      setShowContribute(false)
    } catch {
      toast({ title: 'Erro ao contribuir', description: 'Não foi possível registrar a contribuição.', variant: 'destructive' })
    }
  })

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Editar meta' : 'Nova meta'}</DialogTitle>
        <DialogDescription>
          {isEditing ? 'Atualize os dados da sua meta.' : 'Defina uma nova meta de economia.'}
        </DialogDescription>
      </DialogHeader>

      {showContribute && goal ? (
        <form className="space-y-4" onSubmit={onContribute}>
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="font-medium text-primary text-sm">Contribuir para: {goal.name}</p>
            <p className="text-secondary text-xs">
              Atual: R$ {Number(goal.currentAmount).toFixed(2)} | Meta: R$ {Number(goal.targetAmount).toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor a adicionar</Label>
            <div className="relative">
              <span className="top-1/2 left-3 absolute font-medium text-secondary text-sm -translate-y-1/2 pointer-events-none">R$</span>
              <Controller
                control={contributeForm.control}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowContribute(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={contributeGoal.isPending}>
              {contributeGoal.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Adicionar'
              )}
            </Button>
          </DialogFooter>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
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
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              placeholder="Ex: Poupar para as férias"
              {...form.register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Valor alvo</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              {...form.register('targetAmount', { valueAsNumber: true })}
            />
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
                aria-label="Abrir calendário"
                className="top-1/2 right-2 absolute p-1 rounded text-secondary hover:text-foreground -translate-y-1/2"
                onClick={openDeadlinePicker}
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
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
            {isEditing && (
              <Button type="button" variant="outline" onClick={() => setShowContribute(true)}>
                <Loader2 className="w-4 h-4" />
                Contribuir
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                'Salvar'
              ) : (
                'Criar meta'
              )}
            </Button>
          </DialogFooter>
        </form>
      )}
    </DialogContent>
  )
}

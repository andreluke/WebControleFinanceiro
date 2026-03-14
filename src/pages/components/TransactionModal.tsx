import { useEffect, useRef } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarDays, Loader2 } from 'lucide-react'
import type { Category } from '@/types/category'
import type { PaymentMethod } from '@/types/paymentMethod'
import type { Transaction } from '@/types/transaction'
import type { TransactionFormData } from '../TransfersPage.schemas'
import { transactionSchema } from '../TransfersPage.schemas'
import {
  Button,
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
} from '@/components/ui'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import { useToast } from '@/hooks/use-toast'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
  categories: Category[]
  paymentMethods: PaymentMethod[]
  initialCategoryId?: string
  initialPaymentMethodId?: string
  onOpenCategoryModal?: () => void
  onOpenPaymentMethodModal?: () => void
  onSuccess?: () => void
}

const defaultValues: TransactionFormData = {
  description: '',
  subDescription: '',
  amount: 0,
  type: 'expense',
  date: format(new Date(), 'yyyy-MM-dd'),
  categoryId: 'none',
  paymentMethodId: 'none',
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

export function TransactionModal({
  isOpen,
  onClose,
  transaction,
  categories,
  paymentMethods,
  initialCategoryId,
  initialPaymentMethodId,
  onOpenCategoryModal,
  onOpenPaymentMethodModal,
}: TransactionModalProps) {
  const { toast } = useToast()
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const dateInputRef = useRef<HTMLInputElement | null>(null)

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  })

  const selectedType = useWatch({ control: form.control, name: 'type' })
  const selectedCategoryId = useWatch({ control: form.control, name: 'categoryId' })
  const selectedPaymentMethodId = useWatch({ control: form.control, name: 'paymentMethodId' })
  const { ref: dateFieldRef, ...dateField } = form.register('date')

  const isEditing = !!transaction
  const isLoading = createTransaction.isPending || updateTransaction.isPending

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        form.reset({
          description: transaction.description,
          subDescription: transaction.subDescription ?? '',
          amount: Number(transaction.amount),
          type: transaction.type,
          date: toInputDate(transaction.date),
          categoryId: transaction.categoryId ?? 'none',
          paymentMethodId: transaction.paymentMethodId ?? 'none',
        })
      } else {
        form.reset({
          ...defaultValues,
          categoryId: initialCategoryId ?? 'none',
          paymentMethodId: initialPaymentMethodId ?? 'none',
        })
      }
    }
  }, [isOpen, transaction, form, initialCategoryId, initialPaymentMethodId])

  const openDatePicker = () => {
    const input = dateInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null
    if (!input) return
    if (input.showPicker) {
      input.showPicker()
      return
    }
    input.focus()
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      description: values.description,
      subDescription: values.subDescription?.trim() || undefined,
      amount: values.amount,
      type: values.type,
      date: toApiDate(values.date),
      categoryId: values.categoryId && values.categoryId !== 'none' ? values.categoryId : undefined,
      paymentMethodId: values.paymentMethodId && values.paymentMethodId !== 'none' ? values.paymentMethodId : undefined,
    }

    try {
      if (transaction) {
        await updateTransaction.mutateAsync({ id: transaction.id, body: payload })
        toast({ title: 'Transacao atualizada', description: 'As informacoes foram salvas.' })
      } else {
        await createTransaction.mutateAsync(payload)
        toast({ title: 'Transacao criada', description: 'A nova transacao foi adicionada.' })
      }
      onClose()
      form.reset()
    } catch {
      toast({ title: 'Erro ao salvar', description: 'Revise os dados e tente novamente.', variant: 'destructive' })
    }
  })

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Editar transacao' : 'Nova transacao'}</DialogTitle>
        <DialogDescription>Preencha os campos abaixo para salvar a transacao.</DialogDescription>
      </DialogHeader>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="description">Descricao</Label>
          <Input id="description" placeholder="Ex: Aluguel" {...form.register('description')} />
          {form.formState.errors.description && (
            <p className="text-danger text-xs">{form.formState.errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subDescription">Observacao (opcional)</Label>
          <Input id="subDescription" placeholder="Ex: Pagamento mensal" {...form.register('subDescription')} />
          {form.formState.errors.subDescription && (
            <p className="text-danger text-xs">{form.formState.errors.subDescription.message}</p>
          )}
        </div>

        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <div className="relative">
              <span className="top-1/2 left-3 absolute font-medium text-secondary text-sm -translate-y-1/2 pointer-events-none">R$</span>
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
            {form.formState.errors.amount && (
              <p className="text-danger text-xs">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={selectedType} onValueChange={(value) => form.setValue('type', value as 'income' | 'expense')}>
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

        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
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
                className="[&::-webkit-calendar-picker-indicator]:opacity-0 pr-10 [&::-webkit-calendar-picker-indicator]:pointer-events-none [color-scheme:dark] [appearance:textfield]"
                {...dateField}  
              />
              <button
                type="button"
                aria-label="Abrir calendario"
                className="top-1/2 right-2 absolute p-1 rounded text-secondary hover:text-foreground -translate-y-1/2"
                onClick={openDatePicker}
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
            {form.formState.errors.date && (
              <p className="text-danger text-xs">{form.formState.errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Categoria</Label>
              <Button type="button" variant="ghost" size="sm" className="px-2 h-7 text-primary" onClick={onOpenCategoryModal}>
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
          <div className="flex justify-between items-center">
            <Label>Metodo de pagamento</Label>
            <Button type="button" variant="ghost" size="sm" className="px-2 h-7 text-primary" onClick={onOpenPaymentMethodModal}>
              Novo
            </Button>
          </div>
          <Select value={selectedPaymentMethodId || 'none'} onValueChange={(value) => form.setValue('paymentMethodId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nao informado</SelectItem>
              {paymentMethods.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? (
              'Salvar alteracoes'
            ) : (
              'Criar transacao'
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

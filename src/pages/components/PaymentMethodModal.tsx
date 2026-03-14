import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Trash2, Edit } from 'lucide-react'
import type { PaymentMethod } from '@/types/paymentMethod'
import type { PaymentMethodFormData } from '../TransfersPage.schemas'
import { paymentMethodSchema } from '../TransfersPage.schemas'
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label } from '@/components/ui'
import { ToastAction } from '@/components/ui/Toast'
import { useCreatePaymentMethod, useDeletePaymentMethod, useRestorePaymentMethod, useUpdatePaymentMethod } from '@/hooks/usePaymentMethods'
import { useToast } from '@/hooks/use-toast'

interface PaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  paymentMethod: PaymentMethod | null
  paymentMethods: PaymentMethod[]
  onPaymentMethodSelect?: (methodId: string) => void
}

const defaultValues: PaymentMethodFormData = {
  name: '',
}

export function PaymentMethodModal({ isOpen, onClose, paymentMethod, paymentMethods, onPaymentMethodSelect }: PaymentMethodModalProps) {
  const { toast } = useToast()
  const createPaymentMethod = useCreatePaymentMethod()
  const updatePaymentMethod = useUpdatePaymentMethod()
  const deletePaymentMethod = useDeletePaymentMethod()
  const restorePaymentMethod = useRestorePaymentMethod()

  const form = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues,
  })

  const isEditing = !!paymentMethod
  const isLoading = createPaymentMethod.isPending || updatePaymentMethod.isPending

  useEffect(() => {
    if (isOpen) {
      if (paymentMethod) {
        form.reset({ name: paymentMethod.name })
      } else {
        form.reset(defaultValues)
      }
    }
  }, [isOpen, paymentMethod, form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (paymentMethod) {
        await updatePaymentMethod.mutateAsync({ id: paymentMethod.id, body: values })
        toast({ title: 'Metodo atualizado', description: 'Metodo de pagamento atualizado com sucesso.' })
      } else {
        const created = await createPaymentMethod.mutateAsync(values)
        onPaymentMethodSelect?.(created.id)
        toast({ title: 'Metodo criado', description: 'Metodo criado e selecionado na transacao.' })
      }
      form.reset(defaultValues)
      onClose()
    } catch {
      toast({ title: 'Erro no metodo', description: 'Nao foi possivel salvar o metodo de pagamento.', variant: 'destructive' })
    }
  })

  const handleDelete = async (method: PaymentMethod) => {
    const shouldDelete = window.confirm(`Deseja excluir o metodo "${method.name}"?`)
    if (!shouldDelete) return

    try {
      await deletePaymentMethod.mutateAsync(method.id)
      toast({
        title: 'Metodo removido',
        description: 'O metodo de pagamento foi removido com sucesso.',
        action: (
          <ToastAction altText="Desfazer remocao" onClick={() => void restorePaymentMethod.mutateAsync(method.id)}>
            Desfazer
          </ToastAction>
        ),
      })
    } catch {
      toast({ title: 'Erro ao remover', description: 'Nao foi possivel excluir o metodo de pagamento.', variant: 'destructive' })
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Editar metodo de pagamento' : 'Novo metodo de pagamento'}</DialogTitle>
        <DialogDescription>Crie, edite ou remova metodos para classificar suas transacoes.</DialogDescription>
      </DialogHeader>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="payment-method-name">Nome</Label>
          <Input id="payment-method-name" placeholder="Ex: Cartao de credito" {...form.register('name')} />
          {form.formState.errors.name && (
            <p className="text-xs text-danger">{form.formState.errors.name.message}</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => form.reset(defaultValues)}>
            Limpar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? (
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
            paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2">
                <span className="text-sm text-foreground">{method.name}</span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => form.reset({ name: method.name })}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(method)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DialogContent>
  )
}

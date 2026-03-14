import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import type { Category } from '@/types/category'
import type { Budget, CreateBudgetInput } from '@/types/budget'
import { budgetSchema } from '../BudgetsPage.schemas'
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { useToast } from '@/hooks/use-toast'

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  budget: Budget | null
  month: number
  year: number
}

const defaultValues: CreateBudgetInput = {
  categoryId: '',
  amount: 0,
  month: 1,
  year: 2026,
}

export function BudgetModal({ isOpen, onClose, budget, month, year }: BudgetModalProps) {
  const { toast } = useToast()
  const { data: categories = [] } = useCategories()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()

  const form = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: { ...defaultValues, month, year },
  })

  const isEditing = !!budget
  const isLoading = createBudget.isPending || updateBudget.isPending

  useEffect(() => {
    if (isOpen) {
      if (budget) {
        form.reset({ categoryId: budget.categoryId, amount: budget.amount, month: budget.month, year: budget.year })
      } else {
        form.reset({ categoryId: '', amount: 0, month, year })
      }
    }
  }, [isOpen, budget, month, year, form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (budget) {
        await updateBudget.mutateAsync({ id: budget.id, body: { amount: values.amount } })
        toast({ title: 'Orçamento atualizado', description: 'O orçamento foi atualizado com sucesso.' })
      } else {
        await createBudget.mutateAsync(values)
        toast({ title: 'Orçamento criado', description: 'O orçamento foi criado com sucesso.' })
      }
      form.reset(defaultValues)
      onClose()
    } catch {
      toast({ title: 'Erro no orçamento', description: 'Não foi possível salvar o orçamento.', variant: 'destructive' })
    }
  })

  const handleDelete = async () => {
    if (!budget) return
    const shouldDelete = window.confirm(`Deseja excluir o orçamento de "${budget.categoryName}"?`)
    if (!shouldDelete) return

    try {
      await deleteBudget.mutateAsync(budget.id)
      toast({ title: 'Orçamento removido', description: 'O orçamento foi removido com sucesso.' })
      onClose()
    } catch {
      toast({ title: 'Erro ao remover', description: 'Não foi possível excluir o orçamento.', variant: 'destructive' })
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Editar orçamento' : 'Novo orçamento'}</DialogTitle>
        <DialogDescription>Defina um limite de gastos para uma categoria.</DialogDescription>
      </DialogHeader>

      <form className="space-y-4" onSubmit={onSubmit}>
        {!isEditing && (
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Controller
              name="categoryId"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: Category) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.categoryId && (
              <p className="text-xs text-danger">{form.formState.errors.categoryId.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="amount">Valor do orçamento</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            {...form.register('amount', { valueAsNumber: true })}
          />
          {form.formState.errors.amount && (
            <p className="text-xs text-danger">{form.formState.errors.amount.message}</p>
          )}
        </div>

        <DialogFooter>
          {isEditing && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          )}
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
              'Salvar orçamento'
            ) : (
              'Criar orçamento'
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

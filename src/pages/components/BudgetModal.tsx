import { useEffect, useState } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import type { Category } from '@/types/category'
import type { Budget, CreateBudgetInput } from '@/types/budget'
import { budgetSchema } from '../BudgetsPage.schemas'
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { useSubcategories } from '@/hooks/useSubcategories'
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

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  budget: Budget | null
  month: number
  year: number
}

const defaultValues: CreateBudgetInput = {
  categoryId: '',
  subcategoryId: '',
  amount: 0,
  month: 1,
  year: 2026,
}

export function BudgetModal({ isOpen, onClose, budget, month, year }: BudgetModalProps) {
  const { toast } = useToast()
  const { data: categories = [] } = useCategories()
  const { data: allSubcategories = [] } = useSubcategories()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()

  const [showTree, setShowTree] = useState(() => {
    if (budget?.subcategoryId) {
      return false
    }
    return true
  })

  const form = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: { ...defaultValues, month, year },
  })

  const selectedCategoryId = useWatch({ control: form.control, name: 'categoryId' })
  const selectedSubcategoryId = useWatch({ control: form.control, name: 'subcategoryId' })

  const categoriesWithSubcategories = categories.map((cat: Category) => ({
    ...cat,
    subcategories: allSubcategories.filter((s: { categoryId: string }) => s.categoryId === cat.id),
  }))

  const selectedCategory = categoriesWithSubcategories.find((c: Category & { subcategories: { id: string }[] }) => c.id === selectedCategoryId)
  const selectedSubcategory = selectedCategory?.subcategories?.find((s: { id: string }) => s.id === selectedSubcategoryId)

  const isEditing = !!budget
  const isLoading = createBudget.isPending || updateBudget.isPending

  useEffect(() => {
    if (isOpen) {
      if (budget) {
        form.reset({ categoryId: budget.categoryId, subcategoryId: budget.subcategoryId || '', amount: budget.amount, month: budget.month, year: budget.year })
      } else {
        form.reset({ categoryId: '', subcategoryId: '', amount: 0, month, year })
      }
    }
  }, [isOpen, budget, month, year, form])

  const handleCategoryChange = (value: string) => {
    let foundCategoryId: string | undefined
    let foundSubcategoryId: string | undefined

    for (const cat of categoriesWithSubcategories) {
      const sub = cat.subcategories?.find((s: { id: string }) => s.id === value)
      if (sub) {
        foundCategoryId = cat.id
        foundSubcategoryId = value
        break
      }
    }

    if (foundCategoryId && foundSubcategoryId) {
      form.setValue('categoryId', foundCategoryId)
      form.setValue('subcategoryId', foundSubcategoryId)
    } else {
      form.setValue('categoryId', value)
      form.setValue('subcategoryId', '')
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId && values.subcategoryId !== '' ? values.subcategoryId : undefined,
        amount: values.amount,
        month: values.month,
        year: values.year,
      }
      if (budget) {
        await updateBudget.mutateAsync({ id: budget.id, body: { amount: values.amount } })
        toast({ title: 'Orçamento atualizado', description: 'O orçamento foi atualizado com sucesso.' })
      } else {
        await createBudget.mutateAsync(payload)
        toast({ title: 'Orçamento criado', description: 'O orçamento foi criado com sucesso.' })
      }
      form.reset(defaultValues)
      onClose()
    } catch (err) {
      console.error('Error creating budget:', err)
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
          <>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value || ''} onValueChange={handleCategoryChange}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione uma categoria">
                        {selectedSubcategory ? (
                          <div className="flex items-center gap-2">
                            <span className="rounded-full w-2 h-2" style={{ backgroundColor: selectedSubcategory.color }} />
                            {selectedSubcategory.name}
                          </div>
                        ) : selectedCategory ? (
                          <div className="flex items-center gap-2">
                            <span className="rounded-full w-2 h-2" style={{ backgroundColor: selectedCategory.color }} />
                            {selectedCategory.name}
                          </div>
                        ) : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {!showTree && selectedSubcategory ? (
                        <SelectGroup>
                          <SelectItem value={selectedSubcategoryId || ''}>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full w-2.5 h-2.5" style={{ backgroundColor: selectedSubcategory.color }} />
                              {selectedSubcategory.name}
                            </div>
                          </SelectItem>
                          <div className="flex justify-center py-2">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary text-xs"
                              onClick={() => setShowTree(true)}
                            >
                              Mudar categoria
                            </Button>
                          </div>
                        </SelectGroup>
                      ) : (
                        categoriesWithSubcategories.map((cat: Category & { subcategories: { id: string; name: string; color: string }[] }) => (
                          <SelectGroup key={cat.id}>
                            <SelectItem value={cat.id}>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full w-2.5 h-2.5" style={{ backgroundColor: cat.color }} />
                                {cat.name}
                              </div>
                            </SelectItem>
                            {cat.subcategories.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                <div className="flex items-center gap-2 pl-4">
                                  <span className="text-secondary">└─</span>
                                  <span className="rounded-full w-2 h-2" style={{ backgroundColor: sub.color }} />
                                  {sub.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {selectedSubcategoryId && (
                <p className="text-muted-foreground text-xs">
                  Orçamentos de subcategoria servem como medidor e não são somados ao total.
                </p>
              )}
              {form.formState.errors.categoryId && (
                <p className="text-danger text-xs">{form.formState.errors.categoryId.message}</p>
              )}
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="amount">Valor do orçamento</Label>
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
                <Loader2 className="w-4 h-4 animate-spin" />
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

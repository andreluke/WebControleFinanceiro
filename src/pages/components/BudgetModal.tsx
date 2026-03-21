import { useEffect, useState } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, RefreshCw } from 'lucide-react'
import type { Category } from '@/types/category'
import type { Budget, CreateBudgetInput } from '@/types/budget'
import { budgetSchema } from '../BudgetsPage.schemas'
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, Switch } from '@/components/ui'
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
  isRecurring: false,
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
        form.reset({ 
          categoryId: budget.categoryId, 
          subcategoryId: budget.subcategoryId || '', 
          amount: budget.amount, 
          baseAmount: budget.baseAmount ?? budget.amount,
          month: budget.month, 
          year: budget.year,
          isRecurring: budget.isRecurring === true,
        })
      } else {
        form.reset({ categoryId: '', subcategoryId: '', amount: 0, baseAmount: 0, month, year, isRecurring: false })
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
      if (budget) {
        const isParentWithSubcategories = !budget.subcategoryId && (budget.subcategoriesTotal ?? 0) > 0
        
        await updateBudget.mutateAsync({ 
          id: budget.id, 
          body: { 
            baseAmount: isParentWithSubcategories ? values.baseAmount : undefined,
            amount: isParentWithSubcategories ? undefined : values.amount,
            isRecurring: values.isRecurring,
          } 
        })
        toast({ 
          title: 'Orçamento atualizado', 
          description: values.isRecurring
            ? 'Orçamento atualizado. As alterações serão aplicadas nos próximos meses.'
            : 'O orçamento foi atualizado com sucesso.',
        })
      } else {
        const isSubcategory = values.subcategoryId && values.subcategoryId !== ''
        const payload = {
          categoryId: values.categoryId,
          subcategoryId: isSubcategory ? values.subcategoryId : undefined,
          amount: values.amount,
          baseAmount: isSubcategory ? 0 : (values.baseAmount ?? values.amount),
          month: values.month,
          year: values.year,
          isRecurring: values.isRecurring,
        }
        await createBudget.mutateAsync(payload)
        toast({ 
          title: 'Orçamento criado', 
          description: values.isRecurring 
            ? 'O orçamento foi criado e será recriado automaticamente no próximo mês.'
            : 'O orçamento foi criado com sucesso.',
        })
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
    <DialogContent className="max-h-[85vh] flex flex-col overflow-hidden">
      <DialogHeader className="shrink-0">
        <DialogTitle>{isEditing ? 'Editar orçamento' : 'Novo orçamento'}</DialogTitle>
        <DialogDescription>Defina um limite de gastos para uma categoria.</DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto min-h-0">
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
          {isEditing && budget && !budget.subcategoryId && (budget.subcategoriesTotal ?? 0) > 0 ? (
            <>
              <Label htmlFor="baseAmount">Valor base</Label>
              <div className="relative">
                <span className="top-1/2 left-3 absolute font-medium text-secondary text-sm -translate-y-1/2 pointer-events-none">R$</span>
                <Controller
                  control={form.control}
                  name="baseAmount"
                  render={({ field }) => (
                    <Input
                      id="baseAmount"
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
              <p className="text-muted-foreground text-xs">
                O valor total é R$ {formatCurrencyMasked(Number(form.getValues('baseAmount') || 0) + (budget.subcategoriesTotal ?? 0))} (base + subcategorias) e é calculado automaticamente.
              </p>
            </>
          ) : (
            <>
              <Label htmlFor="amount">
                {selectedSubcategoryId ? 'Valor do orçamento' : 'Valor total (base + subcategorias)'}
              </Label>
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
              {!selectedSubcategoryId && !isEditing && (
                <p className="text-muted-foreground text-xs">
                  Este valor é a soma do valor base + total das subcategorias.
                </p>
              )}
            </>
          )}
        </div>

        {selectedSubcategoryId && (
          <p className="text-muted-foreground text-xs -mt-2">
            Orçamentos de subcategoria são somados ao orçamento da categoria pai.
          </p>
        )}

        {isEditing && (
          <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Controller
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <Switch
                    id="isRecurring"
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              <div className="space-y-1">
                <Label htmlFor="isRecurring" className="cursor-pointer font-medium">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-secondary" />
                    Orçamento Recorrente
                  </div>
                </Label>
                <p className="text-xs text-secondary">
                  {budget.isRecurring
                    ? 'Edite o valor aqui para atualizar em todos os meses futuros.'
                    : 'Ao ativar, este orçamento será automaticamente recriado no próximo mês.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Controller
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <Switch
                    id="isRecurring"
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              <div className="space-y-1">
                <Label htmlFor="isRecurring" className="cursor-pointer font-medium">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-secondary" />
                    Orçamento Recorrente
                  </div>
                </Label>
                <p className="text-xs text-secondary">
                  Ao ativar, este orçamento será automaticamente recriado no início de cada mês.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="shrink-0">
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
      </div>
    </DialogContent>
  )
}

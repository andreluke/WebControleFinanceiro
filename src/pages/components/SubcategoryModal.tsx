import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Trash2, Edit } from 'lucide-react'
import type { Category, Subcategory } from '@/types/category'
import type { CreateSubcategoryInput } from '@/types/category'
import { subcategorySchema } from '../TransfersPage.schemas'
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { ToastAction } from '@/components/ui/Toast'
import { useCreateSubcategory, useDeleteSubcategory, useRestoreSubcategory, useUpdateSubcategory, useSubcategories } from '@/hooks/useSubcategories'
import { useCategories } from '@/hooks/useCategories'
import { useToast } from '@/hooks/use-toast'

interface SubcategoryModalProps {
  isOpen: boolean
  onClose: () => void
  subcategory: Subcategory | null
  categoryId?: string
  onSubcategorySelect?: (subcategoryId: string) => void
}

const defaultValues: CreateSubcategoryInput = {
  name: '',
  color: '#3B82F6',
  categoryId: '',
}

export function SubcategoryModal({ isOpen, onClose, subcategory, categoryId, onSubcategorySelect }: SubcategoryModalProps) {
  const { toast } = useToast()
  const { data: categories = [] } = useCategories()
  const { data: subcategories = [] } = useSubcategories()
  const createSubcategory = useCreateSubcategory()
  const updateSubcategory = useUpdateSubcategory()
  const deleteSubcategory = useDeleteSubcategory()
  const restoreSubcategory = useRestoreSubcategory()

  const form = useForm<CreateSubcategoryInput>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: { ...defaultValues, categoryId: categoryId || '' },
  })

  const isEditing = !!subcategory
  const isLoading = createSubcategory.isPending || updateSubcategory.isPending

  useEffect(() => {
    if (isOpen) {
      if (subcategory) {
        form.reset({ name: subcategory.name, color: subcategory.color, categoryId: subcategory.categoryId })
      } else {
        form.reset({ ...defaultValues, categoryId: categoryId || '' })
      }
    }
  }, [isOpen, subcategory, categoryId, form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (subcategory) {
        await updateSubcategory.mutateAsync({ id: subcategory.id, body: values })
        toast({ title: 'Subcategoria atualizada', description: 'A subcategoria foi atualizada com sucesso.' })
      } else {
        const created = await createSubcategory.mutateAsync(values)
        onSubcategorySelect?.(created.id)
        toast({ title: 'Subcategoria criada', description: 'A subcategoria foi criada e selecionada.' })
      }
      form.reset(defaultValues)
      onClose()
    } catch {
      toast({ title: 'Erro na subcategoria', description: 'Nao foi possivel salvar a subcategoria.', variant: 'destructive' })
    }
  })

  const handleDelete = async (sub: Subcategory) => {
    const shouldDelete = window.confirm(`Deseja excluir a subcategoria "${sub.name}"?`)
    if (!shouldDelete) return

    try {
      await deleteSubcategory.mutateAsync(sub.id)
      toast({
        title: 'Subcategoria removida',
        description: 'A subcategoria foi removida com sucesso.',
        action: (
          <ToastAction altText="Desfazer remocao" onClick={() => void restoreSubcategory.mutateAsync(sub.id)}>
            Desfazer
          </ToastAction>
        ),
      })
    } catch {
      toast({ title: 'Erro ao remover', description: 'Nao foi possivel excluir a subcategoria.', variant: 'destructive' })
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Editar subcategoria' : 'Nova subcategoria'}</DialogTitle>
        <DialogDescription>Crie subcategorias para detalhar suas transacoes dentro de uma categoria.</DialogDescription>
      </DialogHeader>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="subcategory-category">Categoria</Label>
          <Controller
            name="categoryId"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="subcategory-category">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
          <div className="space-y-2">
            <Label htmlFor="subcategory-name">Nome</Label>
            <Input id="subcategory-name" placeholder="Ex: Restaurantes" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-danger">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcategory-color">Cor</Label>
            <Input id="subcategory-color" type="color" className="h-10 p-1" {...form.register('color')} />
          </div>
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
              'Salvar subcategoria'
            ) : (
              'Criar subcategoria'
            )}
          </Button>
        </DialogFooter>
      </form>

      <div className="space-y-2 rounded-md border border-border bg-background/40 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Subcategorias ativas</p>
        <div className="max-h-44 space-y-2 overflow-auto pr-1">
          {subcategories.length === 0 ? (
            <p className="text-sm text-secondary">Nenhuma subcategoria cadastrada.</p>
          ) : (
            subcategories.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                  <span className="text-sm text-foreground">{sub.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => form.reset({ name: sub.name, color: sub.color, categoryId: sub.categoryId })}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(sub)}>
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

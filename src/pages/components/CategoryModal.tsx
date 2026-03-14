import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Trash2, Edit } from 'lucide-react'
import type { Category } from '@/types/category'
import type { CategoryFormData } from '../TransfersPage.schemas'
import { categorySchema } from '../TransfersPage.schemas'
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label } from '@/components/ui'
import { ToastAction } from '@/components/ui/Toast'
import { useCreateCategory, useDeleteCategory, useRestoreCategory, useUpdateCategory } from '@/hooks/useCategories'
import { useToast } from '@/hooks/use-toast'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
  categories: Category[]
  onCategorySelect?: (categoryId: string) => void
}

const defaultValues: CategoryFormData = {
  name: '',
  color: '#3B82F6',
}

export function CategoryModal({ isOpen, onClose, category, categories, onCategorySelect }: CategoryModalProps) {
  const { toast } = useToast()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const restoreCategory = useRestoreCategory()

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  })

  const isEditing = !!category
  const isLoading = createCategory.isPending || updateCategory.isPending

  useEffect(() => {
    if (isOpen) {
      if (category) {
        form.reset({ name: category.name, color: category.color })
      } else {
        form.reset(defaultValues)
      }
    }
  }, [isOpen, category, form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, body: values })
        toast({ title: 'Categoria atualizada', description: 'A categoria foi atualizada com sucesso.' })
      } else {
        const created = await createCategory.mutateAsync(values)
        onCategorySelect?.(created.id)
        toast({ title: 'Categoria criada', description: 'A categoria foi criada e selecionada na transacao.' })
      }
      form.reset(defaultValues)
      onClose()
    } catch {
      toast({ title: 'Erro na categoria', description: 'Nao foi possivel salvar a categoria.', variant: 'destructive' })
    }
  })

  const handleDelete = async (cat: Category) => {
    const shouldDelete = window.confirm(`Deseja excluir a categoria "${cat.name}"?`)
    if (!shouldDelete) return

    try {
      await deleteCategory.mutateAsync(cat.id)
      toast({
        title: 'Categoria removida',
        description: 'A categoria foi removida com sucesso.',
        action: (
          <ToastAction altText="Desfazer remocao" onClick={() => void restoreCategory.mutateAsync(cat.id)}>
            Desfazer
          </ToastAction>
        ),
      })
    } catch {
      toast({ title: 'Erro ao remover', description: 'Nao foi possivel excluir a categoria.', variant: 'destructive' })
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
        <DialogDescription>Crie, edite ou remova categorias para organizar suas transacoes.</DialogDescription>
      </DialogHeader>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
          <div className="space-y-2">
            <Label htmlFor="category-name">Nome</Label>
            <Input id="category-name" placeholder="Ex: Moradia" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-danger">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-color">Cor</Label>
            <Input id="category-color" type="color" className="h-10 p-1" {...form.register('color')} />
            {form.formState.errors.color && (
              <p className="text-xs text-danger">{form.formState.errors.color.message}</p>
            )}
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
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-foreground">{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => form.reset({ name: cat.name, color: cat.color })}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(cat)}>
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

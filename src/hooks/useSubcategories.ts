import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SubcategoriesService, type SubcategoryQueryParams } from '@/services/subcategories'
import type { CreateSubcategoryInput } from '@/types/category'

export function useSubcategories(params?: SubcategoryQueryParams) {
  return useQuery({
    queryKey: ['subcategories', params],
    queryFn: () => SubcategoriesService.list(params),
  })
}

export function useCreateSubcategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateSubcategoryInput) => SubcategoriesService.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] })
    },
  })
}

export function useUpdateSubcategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CreateSubcategoryInput> }) =>
      SubcategoriesService.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] })
    },
  })
}

export function useDeleteSubcategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => SubcategoriesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] })
    },
  })
}

export function useRestoreSubcategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => SubcategoriesService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] })
    },
  })
}

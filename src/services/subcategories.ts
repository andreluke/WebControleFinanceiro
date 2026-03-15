import { api } from '@/services/api'
import type { Subcategory, CreateSubcategoryInput } from '@/types/category'

export interface SubcategoryQueryParams {
  categoryId?: string
}

export const SubcategoriesService = {
  list: async (params?: SubcategoryQueryParams) => {
    const response = await api.get<Subcategory[]>('/subcategories', { params })
    return response.data
  },

  create: async (body: CreateSubcategoryInput) => {
    const response = await api.post<Subcategory>('/subcategories', body)
    return response.data
  },

  update: async (id: string, body: Partial<CreateSubcategoryInput>) => {
    const response = await api.put<Subcategory>(`/subcategories/${id}`, body)
    return response.data
  },

  remove: async (id: string) => {
    await api.delete(`/subcategories/${id}`)
  },

  restore: async (id: string) => {
    const response = await api.patch<Subcategory>(`/subcategories/${id}/restore`)
    return response.data
  },
}

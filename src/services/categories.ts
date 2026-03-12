import { api } from '@/services/api'
import type { Category, CreateCategoryInput } from '@/types/category'

export const CategoriesService = {
  list: async () => {
    const response = await api.get<Category[]>('/categories')
    return response.data
  },

  create: async (body: CreateCategoryInput) => {
    const response = await api.post<Category>('/categories', body)
    return response.data
  },

  update: async (id: string, body: Partial<CreateCategoryInput>) => {
    const response = await api.put<Category>(`/categories/${id}`, body)
    return response.data
  },

  remove: async (id: string) => {
    await api.delete(`/categories/${id}`)
  },

  restore: async (id: string) => {
    const response = await api.patch<Category>(`/categories/${id}/restore`)
    return response.data
  },
}

export interface Category {
  id: string
  name: string
  color: string
  icon?: string | null
}

export interface Subcategory {
  id: string
  name: string
  color: string
  icon?: string | null
  categoryId: string
}

export interface CreateCategoryInput {
  name: string
  color?: string
  icon?: string
}

export interface CreateSubcategoryInput {
  name: string
  color?: string
  icon?: string
  categoryId: string
}

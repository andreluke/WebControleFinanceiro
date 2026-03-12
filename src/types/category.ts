export interface Category {
  id: string
  name: string
  color: string
  icon?: string | null
}

export interface CreateCategoryInput {
  name: string
  color?: string
  icon?: string
}

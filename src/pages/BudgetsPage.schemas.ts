import { z } from 'zod'

export const budgetSchema = z.object({
  categoryId: z.string().uuid('Categoria inválida'),
  amount: z.number({ invalid_type_error: 'Valor deve ser um número' }).positive('Valor deve ser positivo'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
})

export const updateBudgetSchema = z.object({
  amount: z.number({ invalid_type_error: 'Valor deve ser um número' }).positive('Valor deve ser positivo'),
})

export type BudgetFormData = z.infer<typeof budgetSchema>
export type UpdateBudgetFormData = z.infer<typeof updateBudgetSchema>

import { z } from 'zod'

export const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  subcategoryId: z.string().optional(),
  amount: z.number({ invalid_type_error: 'Valor deve ser um número' }).positive('Valor deve ser positivo'),
  baseAmount: z.number().optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  isRecurring: z.boolean().optional(),
})

export const updateBudgetSchema = z.object({
  amount: z.number({ invalid_type_error: 'Valor deve ser um número' }).positive('Valor deve ser positivo').optional(),
  baseAmount: z.number().optional(),
  isRecurring: z.boolean().optional(),
})

export type BudgetFormData = z.infer<typeof budgetSchema>
export type UpdateBudgetFormData = z.infer<typeof updateBudgetSchema>

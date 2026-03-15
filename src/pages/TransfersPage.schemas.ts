import { z } from 'zod'

export const transactionSchema = z.object({
  description: z.string().min(2, 'Descricao precisa ter pelo menos 2 caracteres'),
  subDescription: z.string().max(120, 'Maximo de 120 caracteres').optional(),
  amount: z.number().positive('Valor deve ser maior que zero'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Informe a data'),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  paymentMethodId: z.string().optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria e obrigatorio'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor invalida').optional(),
})

export const subcategorySchema = z.object({
  name: z.string().min(1, 'Nome da subcategoria e obrigatorio'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor invalida').optional(),
  categoryId: z.string().min(1, 'Categoria e obrigatoria'),
})

export const paymentMethodSchema = z.object({
  name: z.string().min(1, 'Nome do metodo e obrigatorio'),
})

export type TransactionFormData = z.infer<typeof transactionSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
export type SubcategoryFormData = z.infer<typeof subcategorySchema>
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>

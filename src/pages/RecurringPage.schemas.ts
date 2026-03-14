import { z } from 'zod'
import type { FrequencyType } from '@/types/recurring'

export const recurringSchema = z.object({
  description: z.string().min(2, 'Descricao precisa ter pelo menos 2 caracteres'),
  subDescription: z.string().max(120, 'Maximo de 120 caracteres').optional(),
  amount: z.number().positive('Valor deve ser maior que zero'),
  type: z.enum(['income', 'expense']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']),
  customIntervalDays: z.number().min(1, 'Intervalo deve ser pelo menos 1 dia').max(365, 'Intervalo maximo e 365 dias').optional(),
  dayOfMonth: z.number().min(1).max(31),
  dayOfWeek: z.number().min(0).max(6).optional(),
  startDate: z.string().min(1, 'Informe a data inicial'),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
  paymentMethodId: z.string().optional(),
}).refine(
  (data) => {
    if (data.frequency === 'custom') {
      return data.customIntervalDays !== undefined && data.customIntervalDays > 0
    }
    return true
  },
  {
    message: 'Intervalo personalizado e obrigatorio para frequencia custom',
    path: ['customIntervalDays'],
  }
)

export type RecurringFormData = z.infer<typeof recurringSchema>

export const frequencyOptions: Array<{ value: FrequencyType; label: string }> = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
  { value: 'custom', label: 'Personalizado' },
]

export const dayOfWeekOptions = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terca' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sabado' },
]

export function getFrequencyLabel(freq: FrequencyType): string {
  return frequencyOptions.find((f) => f.value === freq)?.label ?? freq
}

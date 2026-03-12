import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(date: string) {
  return format(parseISO(date), 'dd/MM/yyyy', { locale: ptBR })
}

export function toMonthParam(date = new Date()) {
  return format(date, 'yyyy-MM')
}

export function monthToLabel(month: string) {
  const [year, m] = month.split('-')
  const d = new Date(Number(year), Number(m) - 1, 1)
  return format(d, 'MMM', { locale: ptBR }).toUpperCase()
}

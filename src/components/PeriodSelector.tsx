import { useState, useEffect } from 'react'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'

export type PeriodKey = '7d' | '30d' | 'month' | 'previous' | 'specific'

interface PeriodSelectorProps {
  activePeriod: PeriodKey
  specificMonth?: string
  onPeriodChange: (period: PeriodKey, specificMonth?: string) => void
}

const periodOptions: Array<{ key: PeriodKey; label: string }> = [
  { key: '7d', label: '7 Dias' },
  { key: '30d', label: '30 Dias' },
  { key: 'month', label: 'Este Mês' },
  { key: 'previous', label: 'Mês Passado' },
  { key: 'specific', label: 'Período Específico' },
]

export function PeriodSelector({ activePeriod, specificMonth, onPeriodChange }: PeriodSelectorProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (specificMonth) {
      const [year, month] = specificMonth.split('-')
      return new Date(parseInt(year), parseInt(month) - 1, 1)
    }
    return new Date()
  })

  useEffect(() => {
    if (specificMonth) {
      const [year, month] = specificMonth.split('-')
      setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1))
    }
  }, [specificMonth])

  const handlePreviousMonth = () => {
    const newMonth = subMonths(selectedMonth, 1)
    setSelectedMonth(newMonth)
    onPeriodChange('specific', format(newMonth, 'yyyy-MM'))
  }

  const handleNextMonth = () => {
    const newMonth = new Date(selectedMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    
    const now = new Date()
    if (newMonth <= now) {
      setSelectedMonth(newMonth)
      onPeriodChange('specific', format(newMonth, 'yyyy-MM'))
    }
  }

  const canGoNext = () => {
    const nextMonth = new Date(selectedMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const now = new Date()
    return nextMonth <= now
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {periodOptions.map((period) => (
        <Button
          key={period.key}
          variant={activePeriod === period.key ? 'default' : 'outline'}
          onClick={() => {
            if (period.key === 'specific') {
              const now = new Date()
              onPeriodChange('specific', format(now, 'yyyy-MM'))
            } else {
              onPeriodChange(period.key)
            }
          }}
          className={activePeriod === period.key ? 'bg-primary text-white' : 'border-border text-secondary'}
        >
          {period.label}
        </Button>
      ))}
      
      {activePeriod === 'specific' && (
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[100px] text-center">
            {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            disabled={!canGoNext()}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export function monthFromPeriod(period: PeriodKey, specificMonth?: string): string | undefined {
  const now = new Date()
  
  if (period === 'specific' && specificMonth) {
    return specificMonth
  }
  
  if (period === 'previous') {
    return format(subMonths(now, 1), 'yyyy-MM')
  }
  
  if (period === 'month') {
    return format(now, 'yyyy-MM')
  }
  
  return undefined
}

export function periodFromParam(periodParam: string | null): PeriodKey {
  if (periodParam === '7d' || periodParam === '30d' || periodParam === 'previous' || periodParam === 'month') {
    return periodParam
  }
  if (periodParam?.includes('-')) {
    return 'specific'
  }
  return 'month'
}

export function extractMonthYearFromParam(periodParam: string | null): { month?: string } {
  if (periodParam && periodParam.includes('-')) {
    return { month: periodParam }
  }
  return {}
}

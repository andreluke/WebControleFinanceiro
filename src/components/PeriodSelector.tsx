import { useState, useEffect, useCallback } from 'react'
import { format, subMonths, isSameMonth } from 'date-fns'
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

function parseMonthFromString(monthStr: string): Date {
  const [year, month] = monthStr.split('-')
  return new Date(parseInt(year), parseInt(month) - 1, 1)
}

export function PeriodSelector({ activePeriod, specificMonth, onPeriodChange }: PeriodSelectorProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (specificMonth) {
      return parseMonthFromString(specificMonth)
    }
    return new Date()
  })

  const updateSelectedMonth = useCallback((newMonth: Date) => {
    setSelectedMonth((prev) => {
      if (!isSameMonth(prev, newMonth)) {
        return newMonth
      }
      return prev
    })
  }, [])

  useEffect(() => {
    if (specificMonth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      updateSelectedMonth(parseMonthFromString(specificMonth))
    }
  }, [specificMonth, updateSelectedMonth])

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
    <div className="flex flex-wrap gap-2 mb-6">
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
            className="w-8 h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="min-w-[100px] font-medium text-sm text-center">
            {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            disabled={!canGoNext()}
            className="w-8 h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

import { Button } from '@/components/ui'

export type PeriodKey = '7d' | '30d' | 'month' | 'previous'

const periodOptions: Array<{ key: PeriodKey; label: string }> = [
  { key: '7d', label: '7 Dias' },
  { key: '30d', label: '30 Dias' },
  { key: 'month', label: 'Este Mes' },
  { key: 'previous', label: 'Mes Passado' },
]

interface DashboardPeriodTabsProps {
  activePeriod: PeriodKey
  onChange: (period: PeriodKey) => void
}

export function DashboardPeriodTabs({ activePeriod, onChange }: DashboardPeriodTabsProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {periodOptions.map((period) => (
        <Button
          key={period.key}
          variant={activePeriod === period.key ? 'default' : 'outline'}
          onClick={() => onChange(period.key)}
          className={activePeriod === period.key ? 'bg-primary text-white' : 'border-border text-secondary'}
        >
          {period.label}
        </Button>
      ))}
    </div>
  )
}

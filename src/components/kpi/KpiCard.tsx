import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui'

interface KpiCardProps {
  label: string
  value: string
  change: string
  isPositive: boolean
  icon: ReactNode
}

export function KpiCard({ label, value, change, isPositive, icon }: KpiCardProps) {
  return (
    <Card className="border-border bg-card shadow-card">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="text-primary-light">{icon}</div>
          <span className={`text-xs font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>{change}</span>
        </div>
        <p className="mb-1 text-xs text-secondary">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { MonthlySummary } from '@/types/summary'
import { formatBRL } from '@/utils/currency'
import { monthToLabel } from '@/utils/date'

interface BalanceLineChartProps {
  data: MonthlySummary[]
}

export function BalanceLineChart({ data }: BalanceLineChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    monthLabel: monthToLabel(item.month),
  }))

  return (
    <Card className="border-border bg-card shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground">Evolucao do saldo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="monthLabel" tick={{ fill: 'hsl(var(--secondary))', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value) => formatBRL(Number(value))}
                labelStyle={{ color: 'hsl(var(--secondary))' }}
              />
              <Area type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2.5} fill="url(#balanceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

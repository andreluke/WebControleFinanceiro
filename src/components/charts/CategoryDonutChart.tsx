import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { CategorySummary } from '@/types/summary'
import { formatBRL } from '@/utils/currency'

interface CategoryDonutChartProps {
  data: CategorySummary[]
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const total = data.reduce((acc, item) => acc + item.total, 0)

  return (
    <Card className="border-border bg-card shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-foreground">Gastos por categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="total" nameKey="categoryName" innerRadius={58} outerRadius={82} paddingAngle={3}>
                {data.map((item) => (
                  <Cell key={item.categoryId} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value) => formatBRL(Number(value))}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 rounded-lg border border-border/70 bg-background/50 p-3 text-center">
          <p className="text-xs text-secondary">Total do mes</p>
          <p className="text-lg font-semibold text-foreground">{formatBRL(total)}</p>
        </div>

        <ul className="mt-4 space-y-2">
          {data.map((item) => (
            <li key={item.categoryId} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-secondary">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.categoryName}
              </span>
              <span className="font-medium text-foreground">{item.percentage}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'

const periods = ['7 Dias', '30 Dias', 'Este Mes', 'Personalizado']

export default function DashboardPage() {
  const [activePeriod, setActivePeriod] = useState('Este Mes')

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Resumo Financeiro</h1>
        <p className="text-sm text-secondary">Bem-vindo de volta</p>
      </div>

      <div className="mb-6 flex space-x-2">
        {periods.map((period) => (
          <Button
            key={period}
            variant={activePeriod === period ? 'default' : 'outline'}
            onClick={() => setActivePeriod(period)}
            className={activePeriod === period ? 'bg-primary text-white' : 'border-border text-secondary'}
          >
            {period}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Evolucao do Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[260px] items-center justify-center rounded-md border border-dashed border-border text-secondary">
              Chart placeholder
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[260px] items-center justify-center rounded-md border border-dashed border-border text-secondary">
              Donut placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

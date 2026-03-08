import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button, Card, CardContent, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'

export default function TransfersPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Transferencias</h1>
          <p className="text-sm text-secondary">Acompanhe seu historico de transacoes</p>
        </div>
        <Button className="bg-primary text-white hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nova Transferencia
        </Button>
      </div>

      <Card className="mb-6 border-border bg-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <Input
                placeholder="Buscar por descricao..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-border bg-background pl-10 text-foreground"
              />
            </div>

            <Select defaultValue="all">
              <SelectTrigger className="border-border bg-background text-foreground">
                <SelectValue placeholder="Tipo: Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tipo: Todos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="30days">
              <SelectTrigger className="border-border bg-background text-foreground">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Ultimos 7 dias</SelectItem>
                <SelectItem value="30days">Ultimos 30 dias</SelectItem>
                <SelectItem value="90days">Ultimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex h-[360px] items-center justify-center rounded-md border border-dashed border-border text-secondary">
            Tabela de transferencias (em implementacao)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { Button } from '@/components/ui'
import { api } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

interface ExportFilters {
  startDate: string
  endDate: string
}

export function SeedExportPanel() {
  const { toast } = useToast()
  const [filters, setFilters] = useState<ExportFilters>({
    startDate: '',
    endDate: '',
  })
  const [isExporting, setIsExporting] = useState<string | null>(null)

  function buildQueryParams() {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    const query = params.toString()
    return query ? `?${query}` : ''
  }

  async function downloadExcel() {
    setIsExporting('excel')
    try {
      const res = await api.get(`/seed/dashboard/export/excel${buildQueryParams()}`, {
        responseType: 'arraybuffer',
      })
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'relatorio_financeiro.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({
        title: 'Sucesso',
        description: 'Relatório Excel exportado com sucesso',
        variant: 'default',
      })
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao exportar relatório Excel',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(null)
    }
  }

  async function downloadPdf() {
    setIsExporting('pdf')
    try {
      const res = await api.get(`/seed/dashboard/export/pdf${buildQueryParams()}`, {
        responseType: 'arraybuffer',
      })
      const blob = new Blob([res.data], {
        type: 'application/pdf',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'relatorio_financeiro.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({
        title: 'Sucesso',
        description: 'Relatório PDF exportado com sucesso',
        variant: 'default',
      })
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao exportar relatório PDF',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(null)
    }
  }

  async function downloadCsv() {
    setIsExporting('csv')
    try {
      const res = await api.get(`/seed/dashboard/export/csv${buildQueryParams()}`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transacoes.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({
        title: 'Sucesso',
        description: 'CSV exportado com sucesso',
        variant: 'default',
      })
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao exportar CSV',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <section className="bg-card mt-6 mb-6 p-4 border border-border rounded-lg">
      <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-4 mb-4">
        <div>
          <h2 className="font-semibold text-foreground text-lg">Exportar Relatório</h2>
          <p className="mt-1 text-muted-foreground text-xs">
            Exporte seus dados financeiros em Excel, PDF ou CSV
          </p>
        </div>
      </div>

      <div className="gap-3 grid grid-cols-1 sm:grid-cols-3 mb-4">
        <div>
          <label className="block mb-1 text-muted-foreground text-xs">Data Inicial</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            className="bg-background px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-full text-sm"
          />
        </div>
        <div>
          <label className="block mb-1 text-muted-foreground text-xs">Data Final</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
            className="bg-background px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-full text-sm"
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ startDate: '', endDate: '' })}
            className="text-xs"
          >
            Limpar filtros
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={downloadExcel}
          disabled={isExporting !== null}
          className="gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {isExporting === 'excel' ? 'Exportando...' : 'Excel'}
        </Button>
        <Button
          variant="outline"
          onClick={downloadPdf}
          disabled={isExporting !== null}
          className="gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          {isExporting === 'pdf' ? 'Exportando...' : 'PDF'}
        </Button>
        <Button
          variant="outline"
          onClick={downloadCsv}
          disabled={isExporting !== null}
          className="gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {isExporting === 'csv' ? 'Exportando...' : 'CSV'}
        </Button>
      </div>

      <p className="mt-3 text-muted-foreground text-xs">
        O relatório incluirá: resumo geral, gastos por categoria, evolução mensal e lista de transações.
      </p>
    </section>
  )
}

export default SeedExportPanel

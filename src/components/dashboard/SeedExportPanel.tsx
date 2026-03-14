import { Button } from '@/components/ui'
import { api } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

export function SeedExportPanel() {
  const { toast } = useToast()

  async function downloadExcel() {
    try {
      const res = await api.get('/seed/dashboard/export/excel', {
        responseType: 'arraybuffer',
        withCredentials: true,
      })
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dashboard_seed.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({ title: 'ExportExcel', description: 'Excel exportado com sucesso', variant: 'default' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao exportar Excel', variant: 'destructive' })
    }
  }

  async function downloadPdf() {
    try {
      const res = await api.get('/seed/dashboard/export/pdf', {
        responseType: 'arraybuffer',
        withCredentials: true,
      })
      const blob = new Blob([res.data], {
        type: 'application/pdf',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dashboard_seed.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({ title: 'ExportPdf', description: 'PDF exportado com sucesso', variant: 'default' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao exportar PDF', variant: 'destructive' })
    }
  }

  return (
    <section className="mb-6 p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-foreground">Seed / Export</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadExcel}>Export Excel</Button>
          <Button variant="outline" onClick={downloadPdf}>Export PDF</Button>
        </div>
      </div>
      <p className="text-xs text-secondary">Use the seed data to bootstrap the dashboard with predefined entries. Exported files follow the same visual style as the in-app dashboard.</p>
    </section>
  )
}

export default SeedExportPanel

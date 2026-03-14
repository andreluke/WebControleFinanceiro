import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DashboardChartsSection } from '@/components/dashboard/DashboardChartsSection'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardKpiSection } from '@/components/dashboard/DashboardKpiSection'
import { DashboardLatestTransactionsCard } from '@/components/dashboard/DashboardLatestTransactionsCard'
import { SeedExportPanel } from '@/components/dashboard/SeedExportPanel'
import { DashboardPeriodTabs, type PeriodKey } from '@/components/dashboard/DashboardPeriodTabs'
import { useCategorySummary } from '@/hooks/useCategorySummary'
import { useMonthlySummary } from '@/hooks/useMonthlySummary'
import { useSummary } from '@/hooks/useSummary'
import { useTransactions } from '@/hooks/useTransactions'
import type { ListTransactionsParams } from '@/types/transaction'
import { toMonthParam } from '@/utils/date'

function monthFromPeriod(period: PeriodKey) {
  const now = new Date()
  if (period === 'previous') {
    now.setMonth(now.getMonth() - 1)
  }
  return toMonthParam(now)
}

function transactionFiltersFromPeriod(period: PeriodKey): ListTransactionsParams {
  if (period === '7d' || period === '30d') {
    const days = period === '7d' ? 7 : 30
    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() - (days - 1))
    start.setHours(0, 0, 0, 0)
    return {
      startDate: start.toISOString(),
      endDate: now.toISOString(),
      page: 1,
      limit: 5,
    }
  }

  return {
    month: monthFromPeriod(period),
    page: 1,
    limit: 5,
  }
}

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const periodParam = searchParams.get('period')
  const activePeriod: PeriodKey = periodParam === '7d' || periodParam === '30d' || periodParam === 'previous' || periodParam === 'month' ? periodParam : 'month'

  const transactionsFilters = useMemo(() => transactionFiltersFromPeriod(activePeriod), [activePeriod])

  const summaryQuery = useSummary({ period: activePeriod })
  const monthlyQuery = useMonthlySummary()
  const categoryQuery = useCategorySummary({ period: activePeriod })
  const latestTransactionsQuery = useTransactions(transactionsFilters)

  const summary = summaryQuery.data
  const latestTransactions = latestTransactionsQuery.data?.data ?? []
  const handlePeriodChange = (period: PeriodKey) => {
    const next = new URLSearchParams(searchParams)
    next.set('period', period)
    setSearchParams(next, { replace: true })
  }

  return (
    <div>
      <DashboardHeader />
      <DashboardPeriodTabs activePeriod={activePeriod} onChange={handlePeriodChange} />
      <DashboardKpiSection isLoading={summaryQuery.isLoading} isError={summaryQuery.isError} summary={summary} onRetry={summaryQuery.refetch} />
      <DashboardChartsSection
        monthly={{ isLoading: monthlyQuery.isLoading, isError: monthlyQuery.isError, data: monthlyQuery.data, refetch: monthlyQuery.refetch }}
        category={{ isLoading: categoryQuery.isLoading, isError: categoryQuery.isError, data: categoryQuery.data, refetch: categoryQuery.refetch }}
      />
      <DashboardLatestTransactionsCard
        isLoading={latestTransactionsQuery.isLoading}
        isError={latestTransactionsQuery.isError}
        transactions={latestTransactions}
        onRetry={latestTransactionsQuery.refetch}
      />
      <SeedExportPanel />
    </div>
  )
}

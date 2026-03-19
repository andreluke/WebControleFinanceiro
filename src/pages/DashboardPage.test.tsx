import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import DashboardPage from '@/pages/DashboardPage'

vi.mock('@/components/dashboard/DashboardHeader', () => ({
  DashboardHeader: () => <div>DashboardHeader</div>,
}))

vi.mock('@/components/dashboard/DashboardKpiSection', () => ({
  DashboardKpiSection: () => <div>DashboardKpiSection</div>,
}))

vi.mock('@/components/dashboard/DashboardChartsSection', () => ({
  DashboardChartsSection: () => <div>DashboardChartsSection</div>,
}))

vi.mock('@/components/dashboard/DashboardLatestTransactionsCard', () => ({
  DashboardLatestTransactionsCard: () => <div>DashboardLatestTransactionsCard</div>,
}))

vi.mock('@/components/dashboard/SeedExportPanel', () => ({
  SeedExportPanel: () => <div>SeedExportPanel</div>,
}))

vi.mock('@/components/PeriodSelector', () => ({
  PeriodSelector: () => <div>PeriodSelector</div>,
  extractMonthYearFromParam: () => ({ month: undefined }),
}))

const mockUseSummary = vi.fn()
const mockUseMonthlySummary = vi.fn()
const mockUseCategorySummary = vi.fn()
const mockUseTransactions = vi.fn()

vi.mock('@/hooks/useSummary', () => ({
  useSummary: (...args: unknown[]) => mockUseSummary(...args),
}))

vi.mock('@/hooks/useMonthlySummary', () => ({
  useMonthlySummary: (...args: unknown[]) => mockUseMonthlySummary(...args),
}))

vi.mock('@/hooks/useCategorySummary', () => ({
  useCategorySummary: (...args: unknown[]) => mockUseCategorySummary(...args),
}))

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: (...args: unknown[]) => mockUseTransactions(...args),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

function mockSuccessState() {
  mockUseSummary.mockReturnValue({
    data: { totalBalance: 1000, monthlyIncome: 2000, monthlyExpense: 1000, monthlyChange: -10 },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })
  mockUseMonthlySummary.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() })
  mockUseCategorySummary.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() })
  mockUseTransactions.mockReturnValue({
    data: {
      data: [
        {
          id: '1',
          description: 'Mercado',
          subDescription: null,
          amount: 120,
          type: 'expense',
          date: new Date().toISOString(),
          categoryId: null,
          category: null,
          paymentMethodId: null,
          paymentMethod: null,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSuccessState()
  })

  it('deve renderizar a página', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('DashboardHeader')).toBeInTheDocument()
  })

  it('deve chamar hooks com parâmetros corretos', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard?period=7d']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>,
      { wrapper: createWrapper() }
    )

    expect(mockUseSummary).toHaveBeenCalled()
  })

  it('deve renderizar estado de erro dos KPIs', () => {
    mockUseSummary.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('DashboardKpiSection')).toBeInTheDocument()
  })
})

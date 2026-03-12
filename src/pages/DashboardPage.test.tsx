import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import DashboardPage from '@/pages/DashboardPage'
import { useCategorySummary } from '@/hooks/useCategorySummary'
import { useMonthlySummary } from '@/hooks/useMonthlySummary'
import { useSummary } from '@/hooks/useSummary'
import { useTransactions } from '@/hooks/useTransactions'

vi.mock('@/hooks/useSummary', () => ({ useSummary: vi.fn() }))
vi.mock('@/hooks/useMonthlySummary', () => ({ useMonthlySummary: vi.fn() }))
vi.mock('@/hooks/useCategorySummary', () => ({ useCategorySummary: vi.fn() }))
vi.mock('@/hooks/useTransactions', () => ({ useTransactions: vi.fn() }))

const useSummaryMock = vi.mocked(useSummary)
const useMonthlySummaryMock = vi.mocked(useMonthlySummary)
const useCategorySummaryMock = vi.mocked(useCategorySummary)
const useTransactionsMock = vi.mocked(useTransactions)

function mockSuccessState() {
  useSummaryMock.mockReturnValue({
    data: { totalBalance: 1000, monthlyIncome: 2000, monthlyExpense: 1000, monthlyChange: -10 },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as never)
  useMonthlySummaryMock.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() } as never)
  useCategorySummaryMock.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() } as never)
  useTransactionsMock.mockReturnValue({
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
  } as never)
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSuccessState()
  })

  it('usa periodo da URL para queries', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard?period=7d']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(useSummaryMock).toHaveBeenCalledWith({ period: '7d' })
    expect(useCategorySummaryMock).toHaveBeenCalledWith({ period: '7d' })
    expect(screen.getByRole('link', { name: /nova transacao/i })).toHaveAttribute('href', '/transfers?new=1')
  })

  it('renderiza estado de erro dos KPIs', () => {
    useSummaryMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() } as never)

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/nao foi possivel carregar os indicadores/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /tentar novamente/i }).length).toBeGreaterThan(0)
  })
})

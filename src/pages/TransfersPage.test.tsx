import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TransfersPage from '@/pages/TransfersPage'
import { useCategories } from '@/hooks/useCategories'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import { useToast } from '@/hooks/use-toast'
import { useTransactions } from '@/hooks/useTransactions'

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: vi.fn(),
  useCreateTransaction: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdateTransaction: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteTransaction: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: vi.fn(),
  useCreateCategory: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdateCategory: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteCategory: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useRestoreCategory: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))

vi.mock('@/hooks/usePaymentMethods', () => ({
  usePaymentMethods: vi.fn(),
  useCreatePaymentMethod: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdatePaymentMethod: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeletePaymentMethod: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useRestorePaymentMethod: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}))

const useTransactionsMock = vi.mocked(useTransactions)
const useCategoriesMock = vi.mocked(useCategories)
const usePaymentMethodsMock = vi.mocked(usePaymentMethods)
const useToastMock = vi.mocked(useToast)

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

describe('TransfersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    useToastMock.mockReturnValue({ toast: vi.fn(), toasts: [], dismiss: vi.fn() } as never)
    useCategoriesMock.mockReturnValue({ data: [{ id: 'c1', name: 'Moradia', color: '#3B82F6' }] } as never)
    usePaymentMethodsMock.mockReturnValue({ data: [{ id: 'p1', name: 'Pix' }] } as never)
    useTransactionsMock.mockReturnValue({
      data: {
        data: [
          {
            id: '1',
            description: 'Aluguel',
            subDescription: null,
            amount: 1200,
            type: 'expense',
            date: new Date().toISOString(),
            categoryId: 'c1',
            category: { id: 'c1', name: 'Moradia', color: '#3B82F6', icon: null },
            paymentMethodId: 'p1',
            paymentMethod: { id: 'p1', name: 'Pix' },
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as never)
  })

  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={['/transfers']}>
        <Routes>
          <Route path="/transfers" element={<TransfersPage />} />
        </Routes>
      </MemoryRouter>,
      { wrapper: createWrapper() }
    )
  }

  it('renderiza lista de transações', () => {
    renderPage()

    expect(screen.getByText('Aluguel')).toBeInTheDocument()
  })

  it('renderiza estado de erro na listagem', () => {
    useTransactionsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: new Error('Falha') } as never)

    renderPage()

    expect(screen.getByText(/falha ao carregar transacoes/i)).toBeInTheDocument()
  })
})

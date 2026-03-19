import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RecurringPage from '@/pages/RecurringPage'
import { useToast } from '@/hooks/use-toast'
import {
  useRecurringTransactions,
  useCreateRecurringTransaction,
  useUpdateRecurringTransaction,
  useDeleteRecurringTransaction,
  useToggleRecurringTransaction,
  useProcessRecurringTransaction,
} from '@/hooks/useRecurringTransactions'

vi.mock('@/hooks/useRecurringTransactions', () => ({
  useRecurringTransactions: vi.fn(),
  useCreateRecurringTransaction: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdateRecurringTransaction: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteRecurringTransaction: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useToggleRecurringTransaction: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useProcessRecurringTransaction: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}))

const useRecurringTransactionsMock = vi.mocked(useRecurringTransactions)
const useCreateRecurringMock = vi.mocked(useCreateRecurringTransaction)
const useUpdateRecurringMock = vi.mocked(useUpdateRecurringTransaction)
const useDeleteRecurringMock = vi.mocked(useDeleteRecurringTransaction)
const useToggleRecurringMock = vi.mocked(useToggleRecurringTransaction)
const useProcessRecurringMock = vi.mocked(useProcessRecurringTransaction)
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

const mockRecurrings = [
  {
    id: 'r1',
    description: 'Netflix',
    subDescription: 'Plano familiar',
    amount: 55.90,
    type: 'expense' as const,
    frequency: 'monthly' as const,
    dayOfMonth: 15,
    dayOfWeek: null,
    startDate: new Date().toISOString(),
    endDate: null,
    isActive: true,
    lastGeneratedAt: null,
    createdAt: new Date().toISOString(),
    categoryId: 'c1',
    category: { id: 'c1', name: 'Entretenimento', color: '#F59E0B', icon: null },
    paymentMethodId: 'p1',
    paymentMethod: { id: 'p1', name: 'Cartão de Crédito' },
  },
  {
    id: 'r2',
    description: 'Salário',
    subDescription: null,
    amount: 5000,
    type: 'income' as const,
    frequency: 'monthly' as const,
    dayOfMonth: 5,
    dayOfWeek: null,
    startDate: new Date().toISOString(),
    endDate: null,
    isActive: true,
    lastGeneratedAt: null,
    createdAt: new Date().toISOString(),
    categoryId: null,
    category: null,
    paymentMethodId: 'p2',
    paymentMethod: { id: 'p2', name: 'Conta Corrente' },
  },
  {
    id: 'r3',
    description: 'Assinatura Antiga',
    subDescription: null,
    amount: 10,
    type: 'expense' as const,
    frequency: 'monthly' as const,
    dayOfMonth: 1,
    dayOfWeek: null,
    startDate: new Date().toISOString(),
    endDate: null,
    isActive: false,
    lastGeneratedAt: null,
    createdAt: new Date().toISOString(),
    categoryId: null,
    category: null,
    paymentMethodId: null,
    paymentMethod: null,
  },
]

describe('RecurringPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    useToastMock.mockReturnValue({ toast: vi.fn(), toasts: [], dismiss: vi.fn() } as never)

    useRecurringTransactionsMock.mockReturnValue({
      data: mockRecurrings,
      isLoading: false,
      isError: false,
      error: null,
    } as never)

    useCreateRecurringMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never)
    useUpdateRecurringMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never)
    useDeleteRecurringMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never)
    useToggleRecurringMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never)
    useProcessRecurringMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as never)
  })

  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={['/recurring']}>
        <Routes>
          <Route path="/recurring" element={<RecurringPage />} />
        </Routes>
      </MemoryRouter>,
      { wrapper: createWrapper() }
    )
  }

  it('renderiza título da página', () => {
    renderPage()

    expect(screen.getByText('Transacoes Recorrentes')).toBeInTheDocument()
    expect(screen.getByText('Gerencie suas receitas e despesas automaticas')).toBeInTheDocument()
  })

  it('renderiza lista de transações recorrentes', () => {
    renderPage()

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Salário')).toBeInTheDocument()
  })

  it('renderiza botão Nova Recorrência', () => {
    renderPage()

    expect(screen.getByText('Nova Recorrencia')).toBeInTheDocument()
  })

  it('renderiza estado de carregamento', () => {
    useRecurringTransactionsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as never)

    renderPage()

    expect(screen.getByText(/carregando transacoes/i)).toBeInTheDocument()
  })

  it('renderiza estado de erro', () => {
    useRecurringTransactionsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Erro de rede'),
    } as never)

    renderPage()

    expect(screen.getByText(/falha ao carregar transacoes/i)).toBeInTheDocument()
  })

  it('renderiza estado vazio quando não há transações', () => {
    useRecurringTransactionsMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as never)

    renderPage()

    expect(screen.getByText(/nenhuma transacao recorrente encontrada/i)).toBeInTheDocument()
  })

  it('chama useRecurringTransactions ao renderizar', () => {
    renderPage()

    expect(useRecurringTransactionsMock).toHaveBeenCalled()
  })
})

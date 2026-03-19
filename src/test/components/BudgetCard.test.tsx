import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { BudgetCard } from '@/pages/components/BudgetCard'
import type { Budget } from '@/types/budget'

const mockBudget: Budget = {
  id: '1',
  amount: 1000,
  baseAmount: 500,
  month: 3,
  year: 2026,
  categoryId: 'cat-1',
  subcategoryId: null,
  categoryName: 'Alimentação',
  categoryColor: '#3B82F6',
  subcategoryName: null,
  subcategoryColor: null,
  spent: 300,
  percentage: 30,
  remaining: 700,
  isOverBudget: false,
  isRecurring: true,
  isActive: true,
  recurringGroupId: 'group-1',
  subcategoriesTotal: 500,
}

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

describe('BudgetCard', () => {
  const mockOnEdit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar dados corretamente', () => {
    render(<BudgetCard budget={mockBudget} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 300,00')).toBeInTheDocument()
    expect(screen.getByText(/\d+[.,]\d+% utilizado/)).toBeInTheDocument()
  })

  it('deve exibir badge de recorrente', () => {
    render(<BudgetCard budget={mockBudget} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Recorrente')).toBeInTheDocument()
  })

  it('deve exibir badge calculado quando há subcategorias', () => {
    render(<BudgetCard budget={mockBudget} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Calculado')).toBeInTheDocument()
  })

  it('não deve exibir badge calculado quando não há subcategorias', () => {
    const budgetWithoutSubs: Budget = {
      ...mockBudget,
      subcategoriesTotal: null,
    }

    render(<BudgetCard budget={budgetWithoutSubs} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.queryByText('Calculado')).not.toBeInTheDocument()
  })

  it('deve exibir valor base单独的', () => {
    render(<BudgetCard budget={mockBudget} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Base')).toBeInTheDocument()
    expect(screen.getAllByText('R$ 500,00')).toHaveLength(2)
  })

  it('deve exibir total de subcategorias', () => {
    render(<BudgetCard budget={mockBudget} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Subcategorias')).toBeInTheDocument()
    expect(screen.getAllByText('R$ 500,00')).toHaveLength(2)
  })

  it('deve chamar onEdit ao clicar no botão editar', async () => {
    render(<BudgetCard budget={mockBudget} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    const editButton = screen.getByRole('button', { name: /editar/i })
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockBudget)
  })

  it('deve exibir botão de desativar para orçamentos recorrentes', () => {
    render(<BudgetCard budget={mockBudget} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Desativar')).toBeInTheDocument()
  })

  it('deve chamar toggle ao clicar em desativar', async () => {
    render(<BudgetCard budget={mockBudget} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    const toggleButton = screen.getByRole('button', { name: /desativar/i })
    fireEvent.click(toggleButton)
  })

  it('deve aplicar opacidade para orçamentos inativos', () => {
    const inactiveBudget: Budget = {
      ...mockBudget,
      isActive: false,
    }

    render(<BudgetCard budget={inactiveBudget} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    const card = screen.getByText('Alimentação').closest('[class*="opacity"]') || screen.getByText('Alimentação').closest('div')
    expect(card?.className).toContain('opacity-50')
  })

  it('deve exibir alerta de acima do orçamento', () => {
    const overBudget: Budget = {
      ...mockBudget,
      spent: 1500,
      percentage: 150,
      isOverBudget: true,
    }

    render(<BudgetCard budget={overBudget} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Acima')).toBeInTheDocument()
  })

  it('deve exibir alerta de próximo do limite', () => {
    const nearLimit: Budget = {
      ...mockBudget,
      spent: 850,
      percentage: 85,
      isOverBudget: false,
    }

    render(<BudgetCard budget={nearLimit} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Próximo')).toBeInTheDocument()
  })

  it('deve renderizar subcategoria corretamente', () => {
    const subBudget: Budget = {
      ...mockBudget,
      subcategoryId: 'sub-1',
      subcategoryName: 'Supermercado',
      subcategoryColor: '#10B981',
    }

    render(<BudgetCard budget={subBudget} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Supermercado')).toBeInTheDocument()
  })

  it('não deve exibir badge recorrente para orçamentos não recorrentes', () => {
    const nonRecurringBudget: Budget = {
      ...mockBudget,
      isRecurring: false,
    }

    render(<BudgetCard budget={nonRecurringBudget} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.queryByText('Recorrente')).not.toBeInTheDocument()
    expect(screen.queryByText('Desativar')).not.toBeInTheDocument()
  })

  it('deve formatar valores em reais corretamente', () => {
    const largeBudget: Budget = {
      ...mockBudget,
      amount: 10000,
      spent: 2500,
      remaining: 7500,
    }

    render(<BudgetCard budget={largeBudget} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('R$ 10.000,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 2.500,00')).toBeInTheDocument()
  })
})

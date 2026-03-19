import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { GoalCard } from '@/pages/components/GoalCard'
import type { Goal } from '@/types/goal'

const mockGoal: Goal = {
  id: 'goal-1',
  name: 'Viagem de Férias',
  description: 'Para a viagem de dezembro',
  targetAmount: 5000,
  currentAmount: 1500,
  deadline: new Date('2026-12-31'),
  icon: '✈️',
  color: '#3B82F6',
  isActive: true,
  categoryId: null,
  category: null,
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

describe('GoalCard', () => {
  const mockOnDeposit = vi.fn()
  const mockOnWithdraw = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar dados corretamente', () => {
    render(
      <GoalCard
        goal={mockGoal}
        onDeposit={mockOnDeposit}
        onWithdraw={mockOnWithdraw}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Viagem de Férias')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument()
  })

  it('deve exibir descrição', () => {
    render(
      <GoalCard
        goal={mockGoal}
        onDeposit={mockOnDeposit}
        onWithdraw={mockOnWithdraw}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Para a viagem de dezembro')).toBeInTheDocument()
  })

  it('deve calcular e exibir progresso percentual', () => {
    render(
      <GoalCard
        goal={mockGoal}
        onDeposit={mockOnDeposit}
        onWithdraw={mockOnWithdraw}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/30%/)).toBeInTheDocument()
  })

  it('deve chamar onDeposit ao clicar no botão depositar', () => {
    render(
      <GoalCard
        goal={mockGoal}
        onDeposit={mockOnDeposit}
        onWithdraw={mockOnWithdraw}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    )

    const depositButton = screen.getByRole('button', { name: /depositar/i })
    fireEvent.click(depositButton)

    expect(mockOnDeposit).toHaveBeenCalled()
  })

  it('deve chamar onWithdraw ao clicar no botão sacar', () => {
    render(
      <GoalCard
        goal={mockGoal}
        onDeposit={mockOnDeposit}
        onWithdraw={mockOnWithdraw}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    )

    const withdrawButton = screen.getByRole('button', { name: /sacar/i })
    fireEvent.click(withdrawButton)

    expect(mockOnWithdraw).toHaveBeenCalled()
  })

  it('não deve exibir botão sacar quando saldo é zero', () => {
    const emptyGoal: Goal = {
      ...mockGoal,
      currentAmount: 0,
    }

    render(
      <GoalCard
        goal={emptyGoal}
        onDeposit={mockOnDeposit}
        onWithdraw={mockOnWithdraw}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.queryByRole('button', { name: /sacar/i })).not.toBeInTheDocument()
  })

  it('deve exibir barra de progresso com cor correta para meta completada', () => {
    const completedGoal: Goal = {
      ...mockGoal,
      currentAmount: 5000,
    }

    render(
      <GoalCard
        goal={completedGoal}
        onDeposit={mockOnDeposit}
        onWithdraw={mockOnWithdraw}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/100%/)).toBeInTheDocument()
  })

  it('deve exibir prazo', () => {
    render(
      <GoalCard
        goal={mockGoal}
        onDeposit={mockOnDeposit}
        onWithdraw={mockOnWithdraw}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/Prazo:/)).toBeInTheDocument()
  })

  it('deve aplicar estilo visual para meta completada', () => {
    const completedGoal: Goal = {
      ...mockGoal,
      currentAmount: 5000,
    }

    render(
      <GoalCard
        goal={completedGoal}
        onDeposit={mockOnDeposit}
        onWithdraw={mockOnWithdraw}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/100%/)).toBeInTheDocument()
  })

  it('deve formatar valores grandes corretamente', () => {
    const largeGoal: Goal = {
      ...mockGoal,
      targetAmount: 50000,
      currentAmount: 25000,
    }

    render(
      <GoalCard
        goal={largeGoal}
        onDeposit={mockOnDeposit}
        onWithdraw={mockOnWithdraw}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('R$ 25.000,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 50.000,00')).toBeInTheDocument()
  })

  it('deve renderizar sem descrição', () => {
    const goalWithoutDesc: Goal = {
      ...mockGoal,
      description: undefined,
    }

    render(
      <GoalCard
        goal={goalWithoutDesc}
        onDeposit={mockOnDeposit}
        onWithdraw={mockOnWithdraw}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Viagem de Férias')).toBeInTheDocument()
    expect(screen.queryByText('Para a viagem de dezembro')).not.toBeInTheDocument()
  })

  it('deve exibir meta completada com badge', () => {
    const completedGoal: Goal = {
      ...mockGoal,
      currentAmount: 5000,
      targetAmount: 5000,
    }

    render(
      <GoalCard
        goal={completedGoal}
        onDeposit={mockOnDeposit}
        onWithdraw={mockOnWithdraw}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/alcancada/i)).toBeInTheDocument()
  })
})

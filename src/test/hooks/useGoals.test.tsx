import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import {
  useGoals,
  useGoal,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useContributeGoal,
  useWithdrawGoal,
} from '@/hooks/useGoals'

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

describe('useGoals', () => {
  it('deve retornar goals do query', async () => {
    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeInstanceOf(Array)
  })

  it('deve lidar com estado de loading', () => {
    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('deve filtrar apenas metas ativas', async () => {
    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    if (result.current.data) {
      result.current.data.forEach((goal) => {
        expect(goal.isActive).toBe(true)
      })
    }
  })
})

describe('useGoal', () => {
  it('deve retornar meta pelo ID', async () => {
    const { result } = renderHook(() => useGoal('goal-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.id).toBe('goal-1')
  })
})

describe('useCreateGoal', () => {
  it('deve criar meta com sucesso', async () => {
    const { result } = renderHook(() => useCreateGoal(), {
      wrapper: createWrapper(),
    })

    let createdId: string | undefined

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        name: 'Nova Meta de Teste',
        targetAmount: 5000,
        color: '#3B82F6',
      })
      createdId = response.id
    })

    expect(createdId).toBeDefined()
  })

  it('deve criar meta com categoria', async () => {
    const { result } = renderHook(() => useCreateGoal(), {
      wrapper: createWrapper(),
    })

    let createdId: string | undefined

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        name: 'Meta com Categoria',
        targetAmount: 3000,
        categoryId: 'cat-1',
        color: '#10B981',
      })
      createdId = response.id
    })

    expect(createdId).toBeDefined()
  })

  it('deve criar meta com deadline', async () => {
    const { result } = renderHook(() => useCreateGoal(), {
      wrapper: createWrapper(),
    })

    let createdId: string | undefined
    const deadline = new Date('2026-12-31')

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        name: 'Meta com Deadline',
        targetAmount: 10000,
        deadline,
        color: '#F59E0B',
      })
      createdId = response.id
    })

    expect(createdId).toBeDefined()
  })

  it('deve iniciar criação corretamente', async () => {
    const { result } = renderHook(() => useCreateGoal(), {
      wrapper: createWrapper(),
    })

    expect(() => result.current.mutate({
      name: 'Meta Pending',
      targetAmount: 1000,
      color: '#3B82F6',
    })).not.toThrow()
  })
})

describe('useUpdateGoal', () => {
  it('deve atualizar meta com sucesso', async () => {
    const { result } = renderHook(() => useUpdateGoal(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      id: 'goal-1',
      data: {
        name: 'Meta Atualizada',
        targetAmount: 6000,
      },
    })
  })

  it('deve atualizar descrição', async () => {
    const { result } = renderHook(() => useUpdateGoal(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      id: 'goal-1',
      data: {
        description: 'Nova descrição da meta',
      },
    })
  })

  it('deve atualizar cor', async () => {
    const { result } = renderHook(() => useUpdateGoal(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      id: 'goal-1',
      data: {
        color: '#EF4444',
      },
    })
  })
})

describe('useDeleteGoal', () => {
  it('deve deletar meta com sucesso', async () => {
    const { result } = renderHook(() => useDeleteGoal(), {
      wrapper: createWrapper(),
    })

    let deleteSuccess = false

    await waitFor(async () => {
      await result.current.mutateAsync('goal-to-delete')
      deleteSuccess = true
    })

    expect(deleteSuccess).toBe(true)
  })
})

describe('useContributeGoal', () => {
  it('deve contribuir com meta', async () => {
    const { result } = renderHook(() => useContributeGoal(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      id: 'goal-1',
      amount: 500,
    })
  })

  it('deve iniciar contribuição corretamente', async () => {
    const { result } = renderHook(() => useContributeGoal(), {
      wrapper: createWrapper(),
    })

    expect(() => result.current.mutate({
      id: 'goal-1',
      amount: 100,
    })).not.toThrow()
  })
})

describe('useWithdrawGoal', () => {
  it('deve sacar de meta', async () => {
    const { result } = renderHook(() => useWithdrawGoal(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      id: 'goal-1',
      amount: 200,
    })
  })

  it('deve iniciar saque corretamente', async () => {
    const { result } = renderHook(() => useWithdrawGoal(), {
      wrapper: createWrapper(),
    })

    expect(() => result.current.mutate({
      id: 'goal-1',
      amount: 50,
    })).not.toThrow()
  })
})

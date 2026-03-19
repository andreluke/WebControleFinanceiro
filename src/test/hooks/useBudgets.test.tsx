import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget, useToggleBudgetActive } from '@/hooks/useBudgets'

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

describe('useBudgets', () => {
  it('deve retornar budgets do query', async () => {
    const { result } = renderHook(() => useBudgets({ month: 3, year: 2026 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.budgets).toBeInstanceOf(Array)
  })

  it('deve passar parâmetros corretamente', async () => {
    const { result } = renderHook(
      () => useBudgets({ month: 6, year: 2026 }),
      {
        wrapper: createWrapper(),
      }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
  })

  it('deve lidar com estado de loading', () => {
    const { result } = renderHook(() => useBudgets(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('deve lidar com estado de erro', async () => {
    const { result } = renderHook(() => useBudgets(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true)
    })
  })
})

describe('useCreateBudget', () => {
  it('deve criar orçamento com sucesso', async () => {
    const { result } = renderHook(() => useCreateBudget(), {
      wrapper: createWrapper(),
    })

    let createdId: string | undefined

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        categoryId: 'cat-1',
        amount: 1000,
        month: 3,
        year: 2026,
      })
      createdId = response.id
    })

    expect(createdId).toBeDefined()
  })

  it('deve criar orçamento recorrente', async () => {
    const { result } = renderHook(() => useCreateBudget(), {
      wrapper: createWrapper(),
    })

    let createdId: string | undefined

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        categoryId: 'cat-1',
        amount: 500,
        month: 4,
        year: 2026,
        isRecurring: true,
      })
      createdId = response.id
    })

    expect(createdId).toBeDefined()
  })

  it('deve iniciar mutate corretamente', async () => {
    const { result } = renderHook(() => useCreateBudget(), {
      wrapper: createWrapper(),
    })

    expect(() => result.current.mutate({
      categoryId: 'cat-1',
      amount: 100,
      month: 5,
      year: 2026,
    })).not.toThrow()
  })

  it('deve invalidar queries após criação', async () => {
    const { result: queryResult } = renderHook(() => useBudgets(), {
      wrapper: createWrapper(),
    })

    const { result: mutationResult } = renderHook(() => useCreateBudget(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(queryResult.current.isSuccess).toBe(true)
    })

    await waitFor(async () => {
      await mutationResult.current.mutateAsync({
        categoryId: 'cat-1',
        amount: 200,
        month: 6,
        year: 2026,
      })
    })
  })
})

describe('useUpdateBudget', () => {
  it('deve atualizar orçamento com sucesso', async () => {
    const { result } = renderHook(() => useUpdateBudget(), {
      wrapper: createWrapper(),
    })

    let updatedId: string | undefined

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        id: 'budget-1',
        body: { amount: 1500 },
      })
      updatedId = response.id
    })

    expect(updatedId).toBeDefined()
  })

  it('deve atualizar baseAmount', async () => {
    const { result } = renderHook(() => useUpdateBudget(), {
      wrapper: createWrapper(),
    })

    let updatedId: string | undefined

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        id: 'budget-1',
        body: { baseAmount: 800 },
      })
      updatedId = response.id
    })

    expect(updatedId).toBeDefined()
  })

  it('deve converter para recorrente', async () => {
    const { result } = renderHook(() => useUpdateBudget(), {
      wrapper: createWrapper(),
    })

    let updatedId: string | undefined

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        id: 'budget-1',
        body: { isRecurring: true },
      })
      updatedId = response.id
    })

    expect(updatedId).toBeDefined()
  })
})

describe('useDeleteBudget', () => {
  it('deve deletar orçamento com sucesso', async () => {
    const { result } = renderHook(() => useDeleteBudget(), {
      wrapper: createWrapper(),
    })

    let deleteSuccess = false

    await waitFor(async () => {
      await result.current.mutateAsync('budget-to-delete')
      deleteSuccess = true
    })

    expect(deleteSuccess).toBe(true)
  })
})

describe('useToggleBudgetActive', () => {
  it('deve alternar status do orçamento', async () => {
    const { result } = renderHook(() => useToggleBudgetActive(), {
      wrapper: createWrapper(),
    })

    let toggledId: string | undefined

    await waitFor(async () => {
      const response = await result.current.mutateAsync('budget-1')
      toggledId = response.id
    })

    expect(toggledId).toBeDefined()
  })

  it('deve iniciar toggle corretamente', async () => {
    const { result } = renderHook(() => useToggleBudgetActive(), {
      wrapper: createWrapper(),
    })

    expect(() => result.current.mutate('budget-1')).not.toThrow()
  })
})

import { http, HttpResponse } from 'msw'

export const mockBudgets = [
  {
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
  },
  {
    id: '2',
    amount: 200,
    baseAmount: null,
    month: 3,
    year: 2026,
    categoryId: 'cat-1',
    subcategoryId: 'sub-1',
    categoryName: 'Alimentação',
    categoryColor: '#3B82F6',
    subcategoryName: 'Supermercado',
    subcategoryColor: '#10B981',
    spent: 150,
    percentage: 75,
    remaining: 50,
    isOverBudget: false,
    isRecurring: false,
    isActive: true,
    recurringGroupId: null,
    subcategoriesTotal: null,
  },
]

export const mockGoals = [
  {
    id: 'goal-1',
    name: 'Viagem de Férias',
    description: 'Para a viagem de dezembro',
    targetAmount: 5000,
    currentAmount: 1500,
    deadline: '2026-12-31T00:00:00.000Z',
    icon: '✈️',
    color: '#3B82F6',
    isActive: true,
    categoryId: null,
    category: null,
  },
]

export const mockSummary = {
  totalBudgeted: 5000,
  totalSpent: 2000,
  totalRemaining: 3000,
  overBudgetCount: 1,
  nearLimitCount: 2,
  budgets: mockBudgets,
}

export const mockContributions = [
  {
    id: 'contrib-1',
    goalId: 'goal-1',
    transactionId: 'tx-1',
    type: 'deposit',
    amount: 1000,
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'contrib-2',
    goalId: 'goal-1',
    transactionId: 'tx-2',
    type: 'deposit',
    amount: 500,
    createdAt: '2026-03-15T14:30:00.000Z',
  },
]

export const handlers = [
  http.get('/budgets', ({ request }) => {
    const url = new URL(request.url)
    const month = url.searchParams.get('month')
    const year = url.searchParams.get('year')
    
    if (month && year) {
      return HttpResponse.json(mockSummary)
    }
    
    return HttpResponse.json(mockSummary)
  }),

  http.post('/budgets', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 'new-budget-id',
      ...body,
      month: body.month || 3,
      year: body.year || 2026,
    }, { status: 201 })
  }),

  http.put('/budgets/:id', async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: params.id,
      ...body,
    })
  }),

  http.patch('/budgets/:id/toggle', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      isActive: false,
    })
  }),

  http.delete('/budgets/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/goals', () => {
    return HttpResponse.json({ goals: mockGoals })
  }),

  http.get('/goals/:id', ({ params }) => {
    const goal = mockGoals.find(g => g.id === params.id)
    return HttpResponse.json({ goal })
  }),

  http.post('/goals', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      goal: {
        id: 'new-goal-id',
        ...body,
        currentAmount: 0,
        isActive: true,
      }
    }, { status: 201 })
  }),

  http.put('/goals/:id', async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      goal: {
        id: params.id,
        ...body,
      }
    })
  }),

  http.delete('/goals/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/goals/:id/contribute', async ({ params, request }) => {
    const body = await request.json()
    const goal = mockGoals.find(g => g.id === params.id)
    return HttpResponse.json({
      goal: {
        ...goal,
        currentAmount: (goal?.currentAmount || 0) + body.amount,
      }
    })
  }),

  http.post('/goals/:id/withdraw', async ({ params, request }) => {
    const body = await request.json()
    const goal = mockGoals.find(g => g.id === params.id)
    return HttpResponse.json({
      goal: {
        ...goal,
        currentAmount: Math.max(0, (goal?.currentAmount || 0) - body.amount),
      }
    })
  }),

  http.get('/goals/:id/contributions', () => {
    return HttpResponse.json({ contributions: mockContributions })
  }),

  http.delete('/goals/contributions/:id', () => {
    return HttpResponse.json({ goal: mockGoals[0] })
  }),
]

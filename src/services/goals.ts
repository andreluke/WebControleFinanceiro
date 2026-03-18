import { api } from '@/services/api'
import type { Goal, CreateGoalInput, UpdateGoalInput, ContributeGoalInput, GoalContribution } from '@/types/goal'

export const GoalsService = {
  getAll: async () => {
    const response = await api.get<{ goals: Goal[] }>('/goals')
    return response.data.goals
  },

  getById: async (id: string) => {
    const response = await api.get<{ goal: Goal }>(`/goals/${id}`)
    return response.data.goal
  },

  create: async (data: CreateGoalInput) => {
    const response = await api.post<{ goal: Goal }>('/goals', data)
    return response.data.goal
  },

  update: async (id: string, data: UpdateGoalInput) => {
    const response = await api.put<{ goal: Goal }>(`/goals/${id}`, data)
    return response.data.goal
  },

  contribute: async (id: string, data: ContributeGoalInput) => {
    const response = await api.post<{ goal: Goal }>(`/goals/${id}/contribute`, data)
    return response.data.goal
  },

  withdraw: async (id: string, data: ContributeGoalInput) => {
    const response = await api.post<{ goal: Goal }>(`/goals/${id}/withdraw`, data)
    return response.data.goal
  },

  delete: async (id: string) => {
    await api.delete(`/goals/${id}`)
  },

  getContributions: async (goalId: string) => {
    const response = await api.get<{ contributions: GoalContribution[] }>(`/goals/${goalId}/contributions`)
    return response.data.contributions
  },

  removeContribution: async (contributionId: string) => {
    const response = await api.delete<{ goal: Goal }>(`/goals/contributions/${contributionId}`)
    return response.data.goal
  },
}

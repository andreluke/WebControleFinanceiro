import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth'
import { api } from '@/services/api'

export const AuthService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  logout: async () => {
    await api.post('/auth/logout')
  },

  me: async () => {
    const response = await api.get<{ user: User }>('/auth/me')
    return response.data
  },
}

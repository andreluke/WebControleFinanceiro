import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth'
import { api } from '@/services/api'

export interface UpdateNameInput {
  name: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

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

  updateName: async (data: UpdateNameInput) => {
    const response = await api.put<{ user: User }>('/auth/me', data)
    return response.data
  },

  changePassword: async (data: ChangePasswordInput) => {
    const response = await api.put('/auth/me/password', data)
    return response.data
  },
}

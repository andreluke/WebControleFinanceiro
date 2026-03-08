import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { User } from '@/types/auth'

interface AuthState {
  token: string | null
  user: User | null
  isBootstrapping: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User | null) => void
  setBootstrapping: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isBootstrapping: true,
      login: (token, user) => set({ token, user, isBootstrapping: false }),
      logout: () => set({ token: null, user: null, isBootstrapping: false }),
      setUser: (user) => set({ user }),
      setBootstrapping: (value) => set({ isBootstrapping: value }),
    }),
    {
      name: 'finance-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)

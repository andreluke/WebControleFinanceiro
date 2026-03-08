import { useEffect } from 'react'
import { AuthService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'

export function useAuthBootstrap() {
  const token = useAuthStore((state) => state.token)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)
  const setBootstrapping = useAuthStore((state) => state.setBootstrapping)

  useEffect(() => {
    let isMounted = true

    async function bootstrap() {
      if (!token) {
        if (isMounted) setBootstrapping(false)
        return
      }

      try {
        const response = await AuthService.me()
        if (isMounted) {
          setUser(response.user)
          setBootstrapping(false)
        }
      } catch {
        if (isMounted) {
          logout()
        }
      }
    }

    void bootstrap()

    return () => {
      isMounted = false
    }
  }, [token, setUser, logout, setBootstrapping])
}

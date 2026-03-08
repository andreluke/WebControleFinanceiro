import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function HomePage() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping)

  useEffect(() => {
    if (isBootstrapping) return
    navigate(token ? '/dashboard' : '/login', { replace: true })
  }, [token, isBootstrapping, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-secondary">Loading...</p>
      </div>
    </div>
  )
}

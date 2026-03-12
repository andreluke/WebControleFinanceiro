import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button, Checkbox, Input, Label, Toaster } from '@/components/ui'
import { useToast } from '@/hooks/use-toast'
import { preloadAuthenticatedChunks } from '@/routing/lazyPages'
import { AuthService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/utils/apiError'

export default function LoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await AuthService.login({ email, password })
      login(response.token, response.user)
      void preloadAuthenticatedChunks()
      toast({ title: 'Welcome back!', description: 'You have successfully logged in.' })
      navigate('/dashboard')
    } catch (error) {
      const message = getErrorMessage(error, 'Login failed')
      toast({ title: 'Login failed', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-card p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-sm text-secondary">Securely access your financial dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-border bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-border bg-background pr-10 text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(value) => setRememberMe(Boolean(value))} />
                <Label htmlFor="remember" className="cursor-pointer text-xs text-secondary">
                  Remember this device for 30 days
                </Label>
              </div>
              <button type="button" className="text-xs text-primary hover:underline">
                Forgot Password?
              </button>
            </div>

            <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-2 text-center">
          <p className="text-xs text-secondary">© 2026 FinanceApp. All rights reserved.</p>
        </div>
      </div>

      <Toaster />
    </div>
  )
}

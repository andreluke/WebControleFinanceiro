import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button, Checkbox, Input, Label, Toaster } from '@/components/ui'
import { useToast } from '@/hooks/use-toast'
import { AuthService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'

export default function SignupPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const login = useAuthStore((state) => state.login)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) return 'Please enter your full name.'
    if (!formData.email.includes('@')) return 'Please enter a valid email address.'
    if (formData.password.length < 6) return 'Password must be at least 6 characters long.'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match.'
    if (!agreeToTerms) return 'Please agree to the Terms of Service and Privacy Policy.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      toast({ title: 'Validation error', description: validationError, variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const response = await AuthService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      login(response.token, response.user)
      toast({ title: 'Account created!', description: 'Welcome to FinanceApp.' })
      navigate('/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed'
      toast({ title: 'Signup failed', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-card p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-foreground">Create Account</h1>
            <p className="text-sm text-secondary">Join FinanceApp to start managing your wealth today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="border-border bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="border-border bg-background pr-10 text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(value) => setAgreeToTerms(Boolean(value))} className="mt-1" />
              <Label htmlFor="terms" className="cursor-pointer text-xs leading-relaxed text-secondary">
                I agree to the <span className="text-primary">Terms of Service</span> and <span className="text-primary">Privacy Policy</span>
              </Label>
            </div>

            <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
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

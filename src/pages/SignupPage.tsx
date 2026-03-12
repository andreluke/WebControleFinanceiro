import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button, Checkbox, Input, Label, Toaster } from '@/components/ui'
import { useToast } from '@/hooks/use-toast'
import { preloadAuthenticatedChunks } from '@/routing/lazyPages'
import { AuthService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/utils/apiError'

const signupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória').min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  agreeToTerms: z.boolean().refine((val) => val === true, 'Você deve aceitar os Termos de Serviço e Política de Privacidade'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const login = useAuthStore((state) => state.login)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  })

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true)
    try {
      const response = await AuthService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      login(response.token, response.user)
      void preloadAuthenticatedChunks()
      toast({ title: 'Conta criada!', description: 'Bem-vindo ao FinanceApp.' })
      navigate('/dashboard')
    } catch (error) {
      const message = getErrorMessage(error, 'Falha ao criar conta')
      toast({ title: 'Erro ao criar conta', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-card p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-foreground">Criar Conta</h1>
            <p className="text-sm text-secondary">Junte-se ao FinanceApp para começar a gerenciar suas finanças</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Nome Completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                {...register('name')}
                className="border-border bg-background text-foreground"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                className="border-border bg-background text-foreground"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crie uma senha forte"
                  {...register('password')}
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
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repita sua senha"
                  {...register('confirmPassword')}
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
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                onCheckedChange={(value) => setValue('agreeToTerms', Boolean(value))}
                className="mt-1"
              />
              <Label htmlFor="terms" className="cursor-pointer text-xs leading-relaxed text-secondary">
                Eu aceito os <span className="text-primary">Termos de Serviço</span> e <span className="text-primary">Política de Privacidade</span>
              </Label>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>}

            <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-secondary">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-2 text-center">
          <p className="text-xs text-secondary">© 2026 FinanceApp. Todos os direitos reservados.</p>
        </div>
      </div>

      <Toaster />
    </div>
  )
}

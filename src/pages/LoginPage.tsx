import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button, Checkbox, Input, Label, Toaster } from "@/components/ui";
import { useToast } from "@/hooks/use-toast";
import { preloadAuthenticatedChunks } from "@/routing/lazyPages";
import { AuthService } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/utils/apiError";

const loginSchema = z.object({
  email: z.string().min(6, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(8, "Senha é obrigatória"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const login = useAuthStore((state) => state.login);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await AuthService.login({
        email: data.email,
        password: data.password,
      });
      login(response.token, response.user);
      void preloadAuthenticatedChunks();
      toast({
        title: "Bem-vindo de volta!",
        description: "Login realizado com sucesso.",
      });
      navigate("/dashboard");
    } catch (error) {
      const message = getErrorMessage(error, "Falha ao fazer login");
      toast({
        title: "Erro ao fazer login",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-background p-4 min-h-screen">
      <div className="w-full max-w-md">
        <div className="bg-card shadow-lg p-8 rounded-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-bold text-foreground text-2xl">
              Bem-vindo de volta
            </h1>
            <p className="text-secondary text-sm">
              Acesse sua dashboard financeira
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
                className="bg-background border-border text-foreground"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  {...register("password")}
                  className="bg-background pr-10 border-border text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="top-1/2 right-3 absolute text-secondary hover:text-foreground -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  onCheckedChange={(value) =>
                    setValue("rememberMe", Boolean(value))
                  }
                />
                <Label
                  htmlFor="remember"
                  className="text-secondary text-xs cursor-pointer"
                >
                  Lembrar por 30 dias
                </Label>
              </div>
              <button
                type="button"
                className="text-primary text-xs hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 w-full text-white"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <p className="mt-6 text-secondary text-sm text-center">
            Não tem uma conta?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>

        <div className="space-y-2 mt-8 text-center">
          <p className="text-secondary text-xs">
            © 2026 FinanceApp. Todos os direitos reservados.
          </p>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

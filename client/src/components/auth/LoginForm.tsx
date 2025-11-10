import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      setIsLoading(true);
      await login(data.username, data.password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <LogIn className="h-5 w-5" />
          Entrar
        </CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar a área administrativa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nome de usuário</Label>
            <Input
              id="username"
              type="text"
              placeholder="Digite o nome de usuário do cadastro"
              data-testid="input-username"
              {...form.register("username")}
            />
            {form.formState.errors.username && (
              <p className="text-sm text-red-600">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                data-testid="input-password"
                {...form.register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-password"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription data-testid="text-error">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="button-submit"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
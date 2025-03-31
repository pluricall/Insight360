'use client'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthProvider";
import { User, Lock, Loader } from "lucide-react";
import { useRouter } from "next/navigation";

const SignInSchema = z.object({
  username: z.string().min(2, { message: "Deve conter mais de 2 caracteres" }),
  password: z.string().min(2, { message: "Deve conter mais de 2 caracteres" }),
});

export type SignInForm = z.infer<typeof SignInSchema>;

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
  });

  const router = useRouter()
  const { login } = useAuth();

  async function handleSignIn({ username, password }: SignInForm) {
    try {
      await login(username, password);
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || "Erro inesperado ao realizar login.");
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{
        background: `linear-gradient(-45deg, #001f54, #7fdbff, #ff0080, #001f54)`,
        backgroundSize: "400% 400%",
      }}
    >
      <img
        src="/logo.png"
        alt="Logo da Pluricall SA"
        className=" w-96 mb-20"
      />
      <form
        onSubmit={handleSubmit(handleSignIn)}
        className="space-y-4 rounded-lg shadow-2xl bg-background p-8 bg-opacity-90 backdrop-blur-sm w-96 transition-all"
      >
        <div>
          {errors.username && (
            <span className="text-red-600 text-sm">
              {errors.username.message}
            </span>
          )}
          {!errors.username && <Label>{"Nome de usuário"}</Label>}
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input
              {...register("username")}
              type="text"
              placeholder="Nome de usuário"
              className={`pl-10 ${errors.username && "border-red-600"}`}
              autoComplete="username"
              required
            />
          </div>
        </div>
        <div>
          {errors.password && (
            <span className="text-red-600 text-sm">
              {errors.password.message}
            </span>
          )}
          {!errors.password && <Label>{"Senha"}</Label>}
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input
              {...register("password")}
              type="password"
              placeholder="Senha do usuário"
              autoComplete="current-password"
              className={`pl-10 ${errors.password && "border-red-600"}`}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader className="animate-spin" size={16} />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>
    </div>
  );
}

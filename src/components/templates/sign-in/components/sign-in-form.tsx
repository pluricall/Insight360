'use client'

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthProvider";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SignInSchema = z.object({
  username: z.string().min(2, { message: "Deve conter mais de 2 caracteres" }),
  password: z.string().min(2, { message: "Deve conter mais de 2 caracteres" }),
});

export type SignInForm = z.infer<typeof SignInSchema>;

export const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signInAltitude } = useAuth();

  async function handleSignIn({ username, password }: SignInForm) {
    try {
      setLoading(true);
      await signInAltitude(username, password);
      router.push("/agents/create");
    } catch (error: any) {
      toast.error(error.message || "Erro inesperado ao realizar login.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleSignIn)}
      className="w-full max-w-sm space-y-4"
    >
      <Input
        {...register("username")}
        type="text"
        label="Usuário"
        placeholder="Nome de usuário"
        autoComplete="username"
        error={errors?.username?.message}
        className="text-white lg:text-black"
        classNameLabel="text-white lg:text-black"
      />
      <Input
        {...register("password")}
        type="password"
        label="Senha"
        placeholder="Senha do usuário"
        autoComplete="current-password"
        error={errors?.password?.message}
        className="text-white lg:text-black"
        classNameLabel="text-white lg:text-black"
      />

      <Button
        type="submit"
        variant="secondary"
        className="lg:!bg-primary lg:!text-primary-foreground w-full"
        disabled={loading}
      >
        {loading && <Loader className="animate-spin mr-2" size={16} />}
        {!loading && "Entrar"}
      </Button>
    </form>
  )
}

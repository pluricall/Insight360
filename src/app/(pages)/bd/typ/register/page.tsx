"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormattedTypData, TypForm } from "../components/TypForm";
import { Button } from "@/components/ui/button";

export default function TypPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleCreateTyp(data: FormattedTypData) {
    try {
      setIsLoading(true);
      const response = await fetch(
        "/Insight360/apiloader/bd/typ/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao criar typ!");
        return;
      }

      toast.success("Typ criado com sucesso!");
      router.push("/bd/typ");
    } catch (error: any) {
      toast.error("Erro inesperado.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="p-8 min-h-screen space-y-8">
      <div className="flex items-center justify-between">
        <Button />
        <h1 className="text-4xl font-extrabold text-gray-800">Novo Typ</h1>
      </div>
      <TypForm onSubmit={handleCreateTyp} isLoading={isLoading} />
    </div>
  );
}

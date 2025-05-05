"use client";

import { useRouter } from "next/navigation";
import { CampaignFormBody, FormCampaign } from "../_components/CampaignForm";
import { toast } from "sonner";
import { useState } from "react";
import { BackButton } from "@/components/BackButton";

export default function NewCampaignPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleCreateCampaign(data: CampaignFormBody) {
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:3333/api/bd/campaign/register",
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
        toast.error(errorData.error || "Erro ao criar campanha!");
        return;
      }

      toast.success("Campanha criada com sucesso!");
      router.push("/bd/campaign");
    } catch (error: any) {
      toast.error("Erro inesperado.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 space-y-8">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-2xl font-bold">Nova Campanha</h1>
      </div>
      <FormCampaign isLoading={isLoading} onSubmit={handleCreateCampaign} />
    </div>
  );
}

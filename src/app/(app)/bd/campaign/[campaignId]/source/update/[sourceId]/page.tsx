"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { BackButton } from "@/components/BackButton";
import {
  SourceForm,
  SourceFormData,
  TypDataResponseSourceCard,
} from "@/app/(app)/bd/campaign/_components/SourceForm";

export default function UpdateSourceByCampaign() {
  const { campaignId, sourceId } = useParams();
  const route = useRouter();

  const [sourceData, setSourceData] = useState<SourceFormData | null>(null);
  const [typData, setTypData] = useState<TypDataResponseSourceCard | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  async function fetchSourceData() {
    try {
      const response = await fetch(
        `http://localhost:3333/api/bd/campaign/${campaignId}/source/${sourceId}`,
        { method: "GET", cache: "no-store" }
      );

      if (!response.ok) {
        toast.error("Erro ao buscar dados da Source");
        return;
      }

      const data: SourceFormData = await response.json();
      setSourceData(data);
    } catch (error) {
      toast.error("Erro ao buscar dados da Source");
      console.error(error);
    }
  }

  async function fetchTyps() {
    try {
      const response = await fetch(`http://localhost:3333/api/bd/typ`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        toast.error("Erro ao buscar typ");
        return;
      }

      const data: TypDataResponseSourceCard = await response.json();
      setTypData(data);
    } catch (error) {
      toast.error("Erro ao buscar typ");
      console.error(error);
    }
  }

  useEffect(() => {
    if (!campaignId || !sourceId) {
      route.push("/");
    } else {
      fetchSourceData();
      fetchTyps();
    }
  }, [campaignId, sourceId]);

  const handleSubmit = async (data: SourceFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `http://localhost:3333/api/bd/campaign/${campaignId}/source/update/${sourceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao atualizar source!");
        return;
      }

      toast.success(`Source ${data.name} atualizada com sucesso!`);
      route.push(`/bd/campaign/update/${campaignId}`);
    } catch (error: any) {
      toast.error(error.message || "Erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!sourceData || !typData) {
    return <div className="text-center py-10 text-gray-500">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-3xl font-bold text-gray-900">Editar Source</h1>
      </div>

      <div>
        <SourceForm
          onSubmit={handleSubmit}
          campaignId={campaignId}
          typData={typData}
          sourceDataToUpdate={sourceData}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

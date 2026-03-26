"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CampaignDataResponse } from "../../../_components/CampaignForm";
import {
  SourceForm,
  SourceFormData,
  TypDataResponseSourceCard,
} from "../../../_components/SourceForm";
import { Button } from "@/components/ui/button";

export default function CreateSourceToCampaignPage() {
  const { campaignId } = useParams();
  const route = useRouter();
  const [campaignData, setCampaignData] = useState<CampaignDataResponse | null>(
    null
  );
  const [typData, setTypData] = useState<TypDataResponseSourceCard | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  async function fetchCampaignById() {
    try {
      const response = await fetch(
        `/Insight360/apiloader/bd/campaign/${campaignId}`,
        { method: "GET", cache: "no-store" }
      );

      if (!response.ok) {
        toast.error("Erro ao buscar campanha");
        return;
      }

      const data: CampaignDataResponse = await response.json();
      setCampaignData(data);
    } catch (error) {
      toast.error("Erro ao buscar campanha");
      console.error(error);
    }
  }

  async function fetchTyps() {
    try {
      const response = await fetch(`/api/bd/typ`, {
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
    if (!campaignId) {
      route.push("/");
    }
    fetchCampaignById();
    fetchTyps();
  }, [campaignId]);

  const handleSubmit = async (data: SourceFormData) => {
    try {
      setIsLoading(true);
      console.log(data);

      const response = await fetch(
        `/Insight360/apiloader/bd/campaign/${campaignId}/source/register`,
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

      toast.success(
        `Source ${data.name} cadastrado na campanha ${campaignData?.name} com sucesso!`
      );
      route.push(`/bd/campaign/update/${campaignId}`);
    } catch (error: any) {
      toast.error(error.message || "Erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!campaignData || !typData) {
    return <div className="text-center py-10 text-gray-500">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <Button />
        <h1 className="text-3xl font-bold text-gray-900">
          {campaignData.name}
        </h1>
      </div>

      <div className="self-centerl">
        {typData && campaignData && (
          <SourceForm
            onSubmit={handleSubmit}
            campaignId={campaignId}
            typData={typData}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

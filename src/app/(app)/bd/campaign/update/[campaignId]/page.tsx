"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CampaignDataResponse,
  CampaignFormBody,
  FormCampaign,
} from "../../_components/CampaignForm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { CardSource } from "../../_components/CardSource";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function UpdateCampaignPage() {
  const { campaignId } = useParams();
  const route = useRouter();
  const [campaignData, setCampaignData] = useState<CampaignDataResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  async function fetchCampaignById() {
    try {
      const response = await fetch(
        `http://localhost:3333/api/bd/campaign/${campaignId}`,
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

  useEffect(() => {
    if (!campaignId) return;
    fetchCampaignById();
  }, [campaignId]);

  async function handleDeleteCampaign(id: string) {
    const confirmDelete = confirm(
      "Tem certeza que deseja excluir essa campanha?"
    );
    if (!confirmDelete) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3333/api/bd/campaign/delete/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        toast.error("Erro ao excluir campanha.");
        return;
      }

      toast.success("Campanha excluída com sucesso!");
      route.push("/bd/campaign");
    } catch (error) {
      toast.error("Erro inesperado.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateCampaign(data: CampaignFormBody) {
    if (!campaignData) return;

    setIsLoading(true);

    try {
      if (
        data.name === campaignData.name &&
        data.expiration === campaignData.expiration &&
        data.campaignType === campaignData.campaign_type &&
        data.description === campaignData.description
      ) {
        toast.error("Não há alterações para atualizar.");
        return;
      }

      const response = await fetch(
        `http://localhost:3333/api/bd/campaign/update/${campaignId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao atualizar campanha!");
        return;
      }

      toast.success("Campanha atualizada com sucesso!");
      fetchCampaignById();
    } catch (error) {
      toast.error("Erro inesperado.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!campaignData) {
    return <div className="text-center py-10 text-gray-500">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-3xl font-bold text-gray-900">
          {campaignData.name}
        </h1>
      </div>

      <FormCampaign
        campaignData={campaignData}
        onSubmit={handleUpdateCampaign}
        onDelete={handleDeleteCampaign}
        isLoading={isLoading}
      />

      <div className="space-y-4">
        <Separator />
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Sources</h2>
          <Link href={`/bd/campaign/${campaignId}/source/register`}>
            <Button className="flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={18} /> Adicionar source
            </Button>
          </Link>
        </div>

        {campaignData.sources.length > 0 && (
          <Carousel className="w-full">
            <CarouselContent>
              {campaignData.sources.map((source) => (
                <CarouselItem
                  key={source.id}
                  className="sm:basis-1/2 md:basis-1/3"
                >
                  <CardSource sourceData={source} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
        
        {campaignData.sources.length <= 0 && (
          <p className="text-md text-muted-foreground">
            Nenhuma source vinculada.
          </p>
        )}
      </div>
    </div>
  );
}

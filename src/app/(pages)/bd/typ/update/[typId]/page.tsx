"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  FormattedTypData,
  TypDataResponse,
  TypForm,
} from "../../components/TypForm";
import { CardSourceTyp } from "../../components/CardSourceTyp";
import { BackButton } from "@/components/back-button";

export default function UpdateTypPage() {
  const { typId } = useParams();
  const route = useRouter();
  const [typData, setTypData] = useState<TypDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchTypById() {
    try {
      const response = await fetch(`/Insight360/apiloader/api/bd/typ/${typId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        toast.error("Erro ao buscar typ.");
        return;
      }

      const data: TypDataResponse = await response.json();
      setTypData(data);
    } catch (error) {
      toast.error("Erro ao buscar typ");
      console.error(error);
    }
  }

  useEffect(() => {
    if (!typId) return;
    fetchTypById();
  }, [typId]);

  async function handleDeleteCampaign(id: string) {
    const confirmDelete = confirm("Tem certeza que deseja excluir esse typ?");
    if (!confirmDelete) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/Insight360/apiloader/bd/typ/delete/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        toast.error("Erro ao excluir campanha.");
        return;
      }

      toast.success("Typ excluído com sucesso!");
      route.push("/bd/typ");
    } catch (error) {
      toast.error("Erro inesperado.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateCampaign(data: FormattedTypData) {
    if (!typData) return;

    setIsLoading(true);

    try {
      if (
        data.name === typData.name &&
        data.entityName === typData.entityName &&
        JSON.stringify(data.fields) === JSON.stringify(typData.fields) &&
        JSON.stringify(data.fixed_fields) === JSON.stringify(typData.fixed_fields) &&
        data.loadingMode === typData.loadingMode &&
        data.parserMode === typData.parserMode &&
        data.separator === typData.separator
      ) {
        return toast.error("Não há alterações para atualizar.");
      }

      console.log(data)

      const response = await fetch(
        `/Insight360/apiloader/bd/typ/update/${typId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao atualizar typ!");
        return;
      }

      toast.success("Typ atualizado com sucesso!");
      fetchTypById();
    } catch (error) {
      toast.error("Erro inesperado.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!typData) {
    return <div className="text-center py-10 text-gray-500">Carregando...</div>;
  }

  return (
    <div className="w-full mx-auto space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-3xl font-bold text-gray-900">{typData.name}</h1>
      </div>

      <TypForm
        typData={typData}
        onSubmit={handleUpdateCampaign}
        onDelete={handleDeleteCampaign}
        isLoading={isLoading}
      />

      <div className="space-y-4">
        <Separator />
        <h2 className="text-2xl font-semibold text-gray-800">Campanhas</h2>

        {typData.sources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {typData.sources.map((source) => (
              <CardSourceTyp key={source.id} source={source} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Nenhuma campanha vinculada a este typ.
            </p>
            <Link href="/bd/campaign/register">
              <Button className="flex items-center gap-2 px-4 py-2 text-sm">
                <Plus size={18} /> Adicionar source
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

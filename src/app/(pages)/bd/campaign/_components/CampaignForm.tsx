"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

export const CampaignSchema = z.object({
  name: z.string().min(1, "O nome da campanha é obrigatório."),
  expiration: z.string().min(1, "Data de expiração inválida."),
  campaignType: z.enum(["INBOUND", "OUTBOUND", "BLENDED"]),
  description: z.string().optional(),
});

type Typ = {
  id: string;
  name: string;
};

export type SourceData = {
  id: string;
  name: string;
  full_url: string;
  campaign_id: string
  typ: Typ;
};

export type CampaignDataResponse = {
  id: string;
  name: string;
  expiration: string;
  dataload: string;
  campaign_type: string;
  description: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  sources: SourceData[];
};

export type CampaignFormBody = z.infer<typeof CampaignSchema>;

type FormCampaignProps = {
  campaignData?: CampaignDataResponse;
  onSubmit: (data: CampaignFormBody) => void;
  isLoading: boolean;
  onDelete?: (id: string) => void;
};

export function FormCampaign({
  campaignData,
  onSubmit,
  isLoading,
  onDelete
}: FormCampaignProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignFormBody>({
    resolver: zodResolver(CampaignSchema),
    defaultValues: {
      name: campaignData ? campaignData.name : "",
      expiration: campaignData
        ? format(new Date(campaignData.expiration), "yyyy-MM-dd'T'HH:mm")
        : "",
      campaignType: campaignData
        ? (campaignData.campaign_type as "INBOUND" | "OUTBOUND" | "BLENDED")
        : "OUTBOUND",
      description: campaignData ? campaignData.description : "",
    },
  });

  const handleFormSubmit = (data: CampaignFormBody) => {
    const requestData = {
      ...data,
      expiration: new Date(data.expiration).toISOString(),
    };

    onSubmit(requestData);
  };

  return (
    <Card className="w-full shadow-lg p-6 bg-white">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            {...register("name")}
            label="Nome da Campanha"
            error={errors.name?.message}
            placeholder="Digite o nome da campanha"
          />

          <Input
            {...register("expiration")}
            label="Data de Expiração"
            type="datetime-local"
            error={errors.expiration?.message}
          />

          <Controller
            name="campaignType"
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Tipo de Campanha
                </label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INBOUND">Inbound</SelectItem>
                    <SelectItem value="OUTBOUND">Outbound</SelectItem>
                    <SelectItem value="BLENDED">Blended</SelectItem>
                  </SelectContent>
                </Select>
                {errors.campaignType && (
                  <p className="text-xs text-red-500">
                    {errors.campaignType.message}
                  </p>
                )}
              </div>
            )}
          />

          <Textarea
            {...register("description")}
            label="Descrição"
            error={errors.description?.message}
            rows={3}
            placeholder="Digite uma descrição da campanha"
          />

          <div className="flex items-center justify-between w-full gap-4">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading
                ? campaignData
                  ? "Atualizando..."
                  : "Salvando..."
                : campaignData
                ? "Atualizar Campanha"
                : "Salvar Campanha"}
            </Button>

            {campaignData && (
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={isLoading}
                onClick={() => onDelete && onDelete(campaignData.id)}
              >
                Excluir Campanha
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

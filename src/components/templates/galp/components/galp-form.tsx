"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { SelectField, SelectItem } from "@/components/select-field";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const reportSchema = z
  .object({
    startDate: z.string().min(1, "A data inicial é obrigatória"),
    endDate: z.string().min(1, "A data final é obrigatória"),
    ownerType: z
      .enum(["queue", "campaign", "sideBySide"])
      .optional()
      .refine((val) => val !== undefined, {
        message: "Selecione um tipo de campanha válido!",
      }),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "A data de início deve ser anterior à data de fim.",
    path: ["endDate"],
  });

type ReportFormData = z.infer<typeof reportSchema>;

export function GalpForm() {
   const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const today = new Date();
  const startOfDay = today
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setDate(endOfDay.getDate() + 1);
  endOfDay.setHours(0, 0, 0, 0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      startDate: startOfDay.toISOString().slice(0, 16),
      endDate: endOfDay.toISOString().slice(0, 16), 
    },
  });

  async function onGetGalpRelatory({
    endDate,
    ownerType,
    startDate,
  }: ReportFormData) {
    setIsDownloading(true);
    try {
      const response = await fetch("/Insight360/api/galp/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endDate, ownerType, startDate }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro ao gerar o relatório.");
      }

      const { fileName } = await response.json();
      console.log(fileName);
      if (!fileName) throw new Error("Nenhum arquivo retornado pela API.");

      const downloadUrl = `/Insight360/api/galp/report/${fileName}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao gerar/baixar relatório:", error);
      alert(
        error instanceof Error
          ? ` ${error.message}`
          : "Falha ao gerar o relatório. Verifique os dados e tente novamente."
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
        <form onSubmit={handleSubmit(onGetGalpRelatory)} className="w-full max-w-md">
          <Input
            error={errors?.startDate?.message}
            title="Data inicial"
            type="datetime-local"
            {...register("startDate")}
            label="Data de início"
          />

          <Input
            error={errors?.endDate?.message}
            title="Data final"
            type="datetime-local"
            {...register("endDate")}
            label="Data de fim"
          />

          <Controller
          control={control}
          name="ownerType"
          render={({ field }) => (
            <SelectField
            label="Tipo de campanha"
              placeholder="Selecione o ambiente"
              value={field.value}
              onValueChange={field.onChange}
              error={errors?.ownerType?.message}
            >
              <SelectItem value="queue">Inbound</SelectItem>
              <SelectItem value="campaign">Outbound</SelectItem>
              <SelectItem value="sideBySide">SideBySide</SelectItem>
            </SelectField>
          )}
        />

          <Button
            type="submit"
            className={`bg-orange-600 text-white w-full mt-2 ${
              isDownloading && "opacity-50 cursor-not-allowed"
            } ${
              !isDownloading && "cursor-pointer hover:bg-orange-700"
            } transition-all duration-300`}
            disabled={isDownloading}
          >
            {isDownloading ? "Baixando..." : "Baixar relatório"}
          </Button>
        </form>
  );
}

"use client";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { InputGalp } from "./components/InputGalp";
import { SelectGalp } from "./components/SelectGalp";

const reportSchema = z
  .object({
    startDate: z.string().min(1, "A data inicial é obrigatória"),
    endDate: z.string().min(1, "A data final é obrigatória"),
    ownerType: z
      .enum(["queue", "campaign"])
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

export default function Home() {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(0, 0, 0, 0);

  const {
    register,
    handleSubmit,
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
      console.log(startDate, endDate);
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

  /*async function testSendEmail() {
    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
      });
      console.log(response)
      if (!response.ok) throw new Error("Erro ao gerar o relatório.");
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
    }
  }*/

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-xl text-center">
        <div className="text-3xl font-bold text-orange-600 mb-6 flex gap-2 items-center justify-center">
          <h1>Relatórios <strong className="text-[#FF5F00]">
            Galp
            </strong></h1>

        </div>

        <form onSubmit={handleSubmit(onGetGalpRelatory)} className="space-y-6">
          <InputGalp
            errors={{ message: errors.startDate?.message }}
            title="Data inicial"
            type="datetime-local"
            {...register("startDate")}
          />

          <InputGalp
            errors={{ message: errors.endDate?.message }}
            title="Data final"
            type="datetime-local"
            {...register("endDate")}
          />

          <SelectGalp
            id="ownerType"
            title="Tipo de campanha"
            {...register("ownerType", {
              required: "Este campo é obrigatório",
            })}
            errors={{ message: errors.ownerType?.message }}
          >
            <option value="queue">Inbound</option>
            <option value="campaign">Outbound</option>
          </SelectGalp>

          <button
            type="submit"
            className={`bg-orange-600 text-white font-semibold py-2 px-6 rounded-xl w-full ${
              isDownloading && "opacity-50 cursor-not-allowed"
            } ${
              !isDownloading && "cursor-pointer hover:bg-orange-700"
            } transition-all duration-300`}
            disabled={isDownloading}
          >
            {isDownloading ? "Baixando..." : "Baixar relatório"}
          </button>
        </form>
      </div>
    </div>
  );
}

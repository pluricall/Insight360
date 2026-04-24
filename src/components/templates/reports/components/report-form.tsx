"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/select-field";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FolderPathBuilder } from "./folder-tree-picker";

const schema = z.object({
  clientName: z.string().min(3),
  siteId: z.string(),
  driveId: z.string(),
  folderPath: z.string().optional(),
  status: z.enum(["ACTIVO", "INACTIVO"]),
});

type FormData = z.infer<typeof schema>;

export function ReportForm({ onSuccess }: { onSuccess?: () => void }) {
  const [sites, setSites] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [drivesLoading, setDrivesLoading] = useState(false);

  const { register, handleSubmit, control, watch, resetField, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: { siteId: "", driveId: "", status: "ACTIVO" },
    });

  const selectedSite = watch("siteId");
  const selectedDrive = watch("driveId");

  useEffect(() => {
    setSitesLoading(true);
    fetch("https://lince.centrocontacto.cc/sharepoint/sites")
      .then((res) => res.json())
      .then(setSites)
      .finally(() => setSitesLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSite) return;
    resetField("driveId");
    resetField("folderPath");
    setDrives([]);
    setDrivesLoading(true);
    fetch(`https://lince.centrocontacto.cc/sharepoint/sites/${selectedSite}/drives`)
      .then((res) => res.json())
      .then(setDrives)
      .finally(() => setDrivesLoading(false));
  }, [selectedSite]);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("https://lince.centrocontacto.cc/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        return toast.error(error.message);
      }
      toast.success("Criado com sucesso!");
      onSuccess?.();
    } catch {
      toast.error("Erro");
    }
  };

  return (
    <Card className="w-full p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register("clientName")}
          placeholder="Ex: Securitas"
          label="Nome do Cliente"
          error={errors.clientName?.message}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <Controller
            control={control}
            name="siteId"
            render={({ field }) => (
              <SelectField
                label={sitesLoading ? "Carregando sites..." : "Site"}
                onValueChange={field.onChange}
                value={field.value}
                disabled={sitesLoading}
              >
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>{site.displayName}</SelectItem>
                ))}
              </SelectField>
            )}
          />

          <Controller
            control={control}
            name="driveId"
            render={({ field }) => (
              <SelectField
                label={drivesLoading ? "Carregando drives..." : "Drive"}
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedSite || drivesLoading}
              >
                {drives.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectField>
            )}
          />
        </div>

        {selectedDrive && (
          <Controller
            control={control}
            name="folderPath"
            render={({ field }) => (
              <FolderPathBuilder
                driveId={selectedDrive}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Guardar"}
        </Button>
      </form>
    </Card>
  );
}
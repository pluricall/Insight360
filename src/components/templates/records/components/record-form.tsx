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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FolderTree {
  name: string;
  path: string;
  children?: FolderTree[];
}

const clientRecordSchema = z.object({
  clientName: z.string().min(3, "Nome do cliente obrigatório"),
  ctName: z.string().min(3, "Nome da ct obrigatório"),
  percentDifferentsResult: z.coerce.number().min(0).max(100),
  startTime: z.string().min(1, "Hora de início obrigatória"),
  siteId: z.string().nonempty("Selecione um site"),
  driveId: z.string().nonempty("Selecione um drive"),
  folderPath: z.string().optional(),
  isBd: z.boolean().optional(),
  isHistorical: z.boolean(),
  resultsNotInFivePercent: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(3),
});

type FormData = z.infer<typeof clientRecordSchema>;

interface Props {
  onSuccess?: () => void;
}

export function RecordForm({ onSuccess }: Props) {
  const [sites, setSites] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [folders, setFolders] = useState<FolderTree[]>([]);


  const [sitesLoading, setSitesLoading] = useState(true);
  const [drivesLoading, setDrivesLoading] = useState(false);
  const [foldersLoading, setFoldersLoading] = useState(false);

  const [clientRecords, setClientRecords] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(clientRecordSchema),
    defaultValues: {
      percentDifferentsResult: 5,
      startTime: "00:00",
      siteId: "",
      driveId: "",
      isHistorical: false,
      isBd: false
    },
  });

  const selectedSite = watch("siteId");
  const selectedDrive = watch("driveId");

  useEffect(() => {
    setSitesLoading(true);

    fetch("http://localhost:3332/sharepoint/sites")
      .then((res) => res.json())
      .then(setSites)
      .finally(() => setSitesLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSite) return;

    resetField("driveId");
    resetField("folderPath");

    setDrives([]);
    setFolders([]);

    setDrivesLoading(true);

    fetch(`http://localhost:3332/sharepoint/sites/${selectedSite}/drives`)
      .then((res) => res.json())
      .then(setDrives)
      .finally(() => setDrivesLoading(false));
  }, [selectedSite]);

  useEffect(() => {
    if (!selectedDrive) return;

    resetField("folderPath");

    setFolders([]);
    setFoldersLoading(true);

    fetch(`http://localhost:3332/sharepoint/drives/${selectedDrive}/folders`)
      .then((res) => res.json())
      .then(setFolders)
      .finally(() => setFoldersLoading(false));
  }, [selectedDrive]);

  const renderFolderOptions = (folders: FolderTree[], prefix = ""): JSX.Element[] => {
    return folders.flatMap((f) => [
      <SelectItem key={f.path} value={f.path}>
        {prefix + f.name}
      </SelectItem>,
      ...(f.children ? renderFolderOptions(f.children, prefix + f.name + " / ") : []),
    ]);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("https://lince.centrocontacto.cc/clients/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: "ACTIVO" }),
      });

      if (res.status === 409) {
        const body = await res.json();
        return toast.error(body.message);
      }

      toast.success("Cliente criado com sucesso!");
      const updated = await fetch("https://lince.centrocontacto.cc/clients/records")
        .then((res) => res.json());
      setClientRecords(updated.clientRecord);
      onSuccess?.();
    } catch (err) {
      toast.error("Erro desconhecido");
      console.error(err);
    }
  };

  const formatLabel = (path: string) => {
    const parts = path.split("/");
    const depth = parts.length - 1;
    const name = parts[parts.length - 1];

    return { name, depth };
  };

  return (
    <Card className="w-full p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register("clientName")}
          placeholder="Ex: Cliente Pluricall"
          label="Nome do Cliente"
          error={errors.clientName?.message}
        />

        <Input
          {...register("ctName")}
          placeholder="Ex: Pluricall"
          label="Campanha"
          error={errors.ctName?.message}
        />

        <Input
          type="number"
          {...register("percentDifferentsResult")}
          min={0}
          max={100}
          label="Percentual de outros resultados diferentes de 1 (%)"
          error={errors.percentDifferentsResult?.message}
        />

        <Input
          type="time"
          {...register("startTime")}
          label="Hora de início"
          error={errors.startTime?.message}
        />

        <div className="flex items-end gap-2">
          <Input
            {...register("resultsNotInFivePercent")}
            placeholder="Ex: 3,5,7"
            label="Resultados que NÃO entram nos 5%"
          />
          <Input
            {...register("email")}
            placeholder="Digite o email"
            label="Email"
          />

          <Input
            {...register("password")}
            placeholder="Digite a senha do cliente"
            label="Senha"
          />
          <Controller
            control={control}
            name="isBd"
            render={({ field }) => (
              <div className="flex flex-col items-start justify-center">
                <Label>BD</Label>
                <Checkbox
                  className="h-9 w-9"
                  checked={field.value || false}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              </div>
            )}
          />

          <Controller
            control={control}
            name="isHistorical"
            render={({ field }) => (
              <div className="flex flex-col items-start justify-center">
                <Label>Historical?</Label>
                <Checkbox
                  className="h-9 w-9"
                  checked={field.value || false}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">

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
                {sitesLoading ? (
                  <SelectItem value="loading" disabled>
                    Carregando sites...
                  </SelectItem>
                ) : (
                  sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.displayName}
                    </SelectItem>
                  ))
                )}
              </SelectField>
            )}
          />

          {/* DRIVE */}
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
                {drivesLoading ? (
                  <SelectItem value="loading" disabled>
                    Carregando drives...
                  </SelectItem>
                ) : (
                  drives.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))
                )}
              </SelectField>
            )}
          />

          {/* FOLDERS */}
          <Controller
            control={control}
            name="folderPath"
            render={({ field }) => (
              <SelectField
                label={foldersLoading ? "Carregando pastas..." : "Pasta"}
                onValueChange={field.onChange}
                value={field.value ?? ""}
                disabled={!selectedDrive || foldersLoading}
              >
                {foldersLoading ? (
                  <SelectItem value="loading" disabled>
                    Carregando pastas...
                  </SelectItem>
                ) : (
                  folders.map((f) => {
                    const { name, depth } = formatLabel(f.path);

                    return (
                      <SelectItem key={f.path} value={f.path}>
                        <span
                          style={{
                            paddingLeft: depth * 16,
                            fontWeight: depth === 0 ? 700 : 400,
                          }}
                        >
                          {name}
                        </span>
                      </SelectItem>
                    );
                  })
                )}
              </SelectField>
            )}
          />

        </div>

        <Button type="submit" className="mt-4 w-full" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="animate-spin h-4 w-4" /> : "Salvar Cliente"}
        </Button>
      </form>
    </Card>
  );
}
"use client";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import { z } from "zod";
import { Trash } from "lucide-react";
import { OriginBd } from "../[campaignId]/source/components/OriginBd";
import { ScheduleFrequency } from "../[campaignId]/source/components/ScheduleFrequency";
import { WeekPicker } from "../[campaignId]/source/components/WeekPicker";
import { MultiDayPicker } from "../[campaignId]/source/components/MultiDayPicker";
import { TypMenuDialog } from "../[campaignId]/source/components/TypMenu";

const SourceFormSchema = z
  .object({
    origin: z.enum(["directory", "ftp", "sftp"], {
      message: "A origem é obrigatória!",
    }),
    name: z.string().min(1, { message: "O nome da BD é obrigatório!" }),
    host: z.string().nullable(),
    port: z.coerce.number().nullable(),
    username: z.string().nullable(),
    password: z.string().nullable(),
    localPath: z.string().nullable(),
    campaignId: z
      .string()
      .min(1, { message: "O id da campanha é obrigatório!" }),
    typId: z.string().uuid().optional().nullable(),
    frequency: z.enum(["daily", "weekly", "monthly"], {
      message: "A frequência é obrigatória!",
    }),
    startTime: z
      .string()
      .min(1, { message: "O horário de início é obrigatório!" }),
      endTime: z
      .string()
      .min(1, { message: "O horário final é obrigatório!" }),
    interval: z.coerce
      .number()
      .min(5, { message: "O intervalo deve ser no mínimo 5 minutos!" }),
    dayOfWeek: z.array(z.number()).nullable(),
    dayOfMonth: z.array(z.number()).nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.origin === "directory" && !data.localPath) {
      ctx.addIssue({
        code: "custom",
        path: ["localPath"],
        message: "O caminho do diretório é obrigatório!",
      });
    }
    if (data.origin !== "directory") {
      if (!data.host) {
        ctx.addIssue({
          code: "custom",
          path: ["host"],
          message: "O host é obrigatória!",
        });
      }
      if (!data.username) {
        ctx.addIssue({
          code: "custom",
          path: ["username"],
          message: "O usuário é obrigatório!",
        });
      }
      if (!data.password) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "A senha é obrigatória!",
        });
      }
      if (!data.port) {
        ctx.addIssue({
          code: "custom",
          path: ["port"],
          message: "A porta é obrigatória!",
        });
      }
    }
    if (data.frequency === "weekly" && !data.dayOfWeek) {
      ctx.addIssue({
        code: "custom",
        path: ["dayOfWeek"],
        message: "Selecione um ou mais dias da semana!",
      });
    }
    if (data.frequency === "monthly" && !data.dayOfMonth) {
      ctx.addIssue({
        code: "custom",
        path: ["dayOfMonth"],
        message: "Pelo menos um dia do mês deve ser selecionado!",
      });
    }
  });

export type SourceFormData = z.infer<typeof SourceFormSchema>;

export type TypDataSource = {
  id: string;
  name: string;
};

export type TypDataResponseSourceCard = {
  typs: TypDataSource[];
};

type SourceBDFormProps = {
  onSubmit: (data: SourceFormData) => void;
  campaignId: string | string[] | undefined;
  typData: TypDataResponseSourceCard;
  sourceDataToUpdate?: SourceFormData
  isLoading: boolean;
};

function mapApiDataToFormValues(data: any): SourceFormData {
  return {
    origin: data.origin,
    name: data.name,
    host: data.host ?? null,
    port: data.port ?? null,
    username: data.username ?? null,
    password: data.password ?? null,
    localPath: data.local_path ?? null,
    campaignId: data.campaign_id,
    typId: data.typId ?? null,
    frequency: data.frequency,
    startTime: data.start_time,
    endTime: data.end_time,
    interval: data.interval,
    dayOfWeek: data.day_of_week.length ? data.day_of_week : null,
    dayOfMonth: data.day_of_month.length ? data.day_of_month : null,
  };
}

export function SourceForm({
  onSubmit,
  campaignId,
  typData,
  isLoading,
  sourceDataToUpdate
}: SourceBDFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    register,
    setValue,
    formState: { errors },
  } = useForm<SourceFormData>({
    resolver: zodResolver(SourceFormSchema),
    defaultValues: sourceDataToUpdate ? mapApiDataToFormValues(sourceDataToUpdate) : undefined,
  });

  const originBd = watch("origin");
  const frequency = watch("frequency");
  const host = watch("host");
  const port = watch("port");
  const path = watch("localPath");
  const username = watch("username");
  const password = watch("password");

  useEffect(() => {
    if (frequency === "daily") {
      setValue("dayOfMonth", []);
      setValue("dayOfWeek", []);
    } else if (frequency === "weekly") {
      setValue("dayOfMonth", []);
    } else {
      setValue("dayOfWeek", []);
    }
  }, [frequency, setValue]);

  const handleFormSubmit = async (data: SourceFormData) => {
    console.log("Form OK", data);
    onSubmit(data);
  };

  const onError = (errors: any) => {
    console.error("Form com erros:", errors);
  };

  return (
    <Card className="w-full shadow-2xl">
      <CardHeader className="p-2">
      {(originBd === "ftp" || originBd === "sftp") && (
          <div>
            <CardTitle className="px-4">
              <span className="text-sm text-muted-foreground break-words">
                {`${originBd === "ftp" ? "ftp" : "sftp"}://${username ?? ""}:${
                  password ?? ""
                }@${host ?? ""}${port ? `:${port}/` : ""}${path ?? ""}`}
              </span>
            </CardTitle>
          </div>
      )}
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(handleFormSubmit, onError)}
          className="space-y-3"
        >
          <Input
            {...register("name")}
            label="Nome do Source"
            error={errors.name?.message}
            placeholder="Nome escolhido para o Source"
          />

          <Controller
            name="origin"
            control={control}
            render={({ field }) => (
              <OriginBd
                value={field.value}
                onValueChange={field.onChange}
                error={errors.origin?.message}
              />
            )}
          />

          {originBd !== "directory" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                {...register("username")}
                label="Usuário"
                error={errors.username?.message}
                placeholder="Usuário do FTP/SFTP"
              />
              <Input
                {...register("password")}
                type="text"
                label="Senha"
                error={errors.password?.message}
                placeholder="Senha do FTP/SFTP"
              />
              <Input
                {...register("host")}
                label="Host de Conexão"
                error={errors.host?.message}
                placeholder="Host do FTP/SFTP"
              />
              <Input
                {...register("port")}
                type="number"
                label="Porta"
                min={0}
                error={errors.port?.message}
                placeholder="Porta do FTP/SFTP"
              />
            </div>
          )}

          <Input
            {...register("localPath")}
            label="Caminho do Diretório"
            error={errors.localPath?.message}
            placeholder="Caminho do FTP/SFTP ou diretório local"
          />

          <Separator />

          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <ScheduleFrequency
                value={field.value}
                onValueChange={field.onChange}
                error={errors.frequency?.message}
              />
            )}
          />

          <Input
            type="time"
            label="Horário de Início"
            {...register("startTime")}
            error={errors.startTime?.message}
          />
          <Input
            type="time"
            label="Horário final"
            {...register("endTime")}
            error={errors.startTime?.message}
          />
          <Input
            type="number"
            label="Intervalo de Tempo (minutos)"
            min={0}
            step={5}
            {...register("interval")}
            error={errors.interval?.message}
            placeholder="Intervalo de tempo de 5 em 5"
          />

          {frequency === "weekly" && (
            <Controller
              name="dayOfWeek"
              control={control}
              render={({ field }) => (
                <WeekPicker
                  value={field.value ?? []}
                  onChange={field.onChange}
                  error={errors.dayOfWeek?.message}
                />
              )}
            />
          )}

          {frequency === "monthly" && (
            <Controller
              name="dayOfMonth"
              control={control}
              render={({ field }) => (
                <MultiDayPicker
                  value={field.value ?? []}
                  onChange={field.onChange}
                  error={errors.dayOfMonth?.message}
                />
              )}
            />
          )}

          <Separator />

          <Input
            value={campaignId}
            readOnly
            label="Id da campanha associada"
            {...register("campaignId")}
            error={errors.campaignId?.message}
          />

          <Controller
            name="typId"
            control={control}
            render={({ field }) => (
              <div className=" flex gap-4 items-center">
                <TypMenuDialog
                  typs={typData.typs}
                  onSelect={field.onChange}
                  selectedTypId={field.value}
                />
                <div className="relative w-full">
                  <Input
                    value={
                      typData.typs.find((t) => t.id === field.value)?.name || ""
                    }
                    placeholder="Typ selecionado"
                    className="w-full"
                    readOnly
                  />
                  {field.value && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => field.onChange("")}
                    >
                      <Trash className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
                ? sourceDataToUpdate
                  ? "Atualizando..."
                  : "Salvando..."
                : sourceDataToUpdate
                ? "Atualizar Campanha"
                : "Salvar Campanha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

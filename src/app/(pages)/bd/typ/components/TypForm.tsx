"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MoveDown, MoveUp, Trash } from "lucide-react";
import { useState } from "react";

export enum EntityNameEnum {
  ACTIVITY = "ACTIVITY",
  CONTACT_PROFILE = "CONTACT_PROFILE",
  CONSENT = "CONSENT",
  DNCL_ENTRY = "DNCL_ENTRY",
  TABLE_SCHEMA_ENUM_VALUE = "TABLE_SCHEMA_ENUM_VALUE",
  WF_PROCESS_INSTANCE = "WF_PROCESS_INSTANCE",
}

export enum LoadingModeEnum {
  APPEND = "APPEND",
  UPDATE = "UPDATE",
  APPEND_OR_UPDATE = "APPEND_OR_UPDATE",
  REPLACE = "REPLACE",
}

const fixedFieldSchema = z.object({
  key: z.string().min(1, { message: "Chave obrigatória" }),
  value: z.string().min(1, { message: "Valor obrigatório" }).or(z.number()),
});

const fields = z.object({
  name: z.string().min(1, "Campo obrigatório"),
});

export const typFormSchema = z.object({
  name: z.string().min(1, { message: "Informe um nome para o typ" }),
  separator: z.string().min(1, { message: "Informe o separador desejado" }),
  entityName: z.nativeEnum(EntityNameEnum),
  loadingMode: z.nativeEnum(LoadingModeEnum),
  parserMode: z.string().min(1, { message: "Informe um parser mode desejado" }),
  fields: z.array(fields).min(1, "Adicione ao menos um campo"),
  fixedFields: z.array(fixedFieldSchema),
});

export type FormattedTypData = {
  name: string;
  separator: string;
  entityName: EntityNameEnum;
  loadingMode: LoadingModeEnum;
  parserMode: string;
  fields: string[];
  fixed_fields: { [key: string | number]: string | number };
};

export interface Campaign {
  id: string;
  name: string;
}

export interface SourceTypProps {
  id: string;
  name: string;
  origin: string;
  campaign: Campaign;
}

export type TypDataResponse = {
  id: string;
  name: string;
  separator: string;
  entityName: string;
  loadingMode: string;
  parserMode: string;
  fields: string[];
  fixed_fields: Record<string, string | number>;
  sources: SourceTypProps[];
};

export type TypFormData = z.infer<typeof typFormSchema>;

export interface TypDataProps {
  typData?: TypDataResponse;
  onSubmit: (data: FormattedTypData) => void;
  isLoading?: boolean;
  onDelete?: (id: string) => void;
}

export function TypForm({
  typData,
  isLoading,
  onSubmit,
  onDelete,
}: TypDataProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TypFormData>({
    resolver: zodResolver(typFormSchema),
    defaultValues: {
      name: typData?.name ?? "",
      separator: typData?.separator ?? "|",
      entityName:
        (typData?.entityName as EntityNameEnum) ?? EntityNameEnum.ACTIVITY,
      loadingMode:
        (typData?.loadingMode as LoadingModeEnum) ?? LoadingModeEnum.APPEND,
      parserMode: typData?.parserMode ?? "FIXED_WIDTH",
      fields: typData
        ? typData.fields.map((f) => ({ name: f }))
        : [{ name: "" }],
      fixedFields: typData
        ? Object.entries(typData.fixed_fields).map(([key, value]) => ({
            key,
            value,
          }))
        : [
            { key: "ACTIVITY_TIMEZONE", value: "GMT" },
            { key: "ACTIVITY_STATUS", value: "0" },
            { key: "ACTIVITY_DIRECTORY", value: "Test" },
            { key: "ACTIVITY_CAMPAIGN", value: "Sales" },
          ],
    },
  });

  const {
    fields: dynamicFields,
    append: appendField,
    remove: removeField,
    move: moveField,
  } = useFieldArray({
    control,
    name: "fields",
  });

  const {
    fields: dynamicFixedFields,
    append: appendFixed,
    remove: removeFixed,
  } = useFieldArray({
    control,
    name: "fixedFields",
  });

  const [customFields, setCustomFields] = useState<{
    [index: number]: boolean;
  }>({});

  const handleFormSubmit = (data: TypFormData) => {
    const formattedData: FormattedTypData = {
      name: data.name,
      separator: data.separator,
      entityName: data.entityName,
      loadingMode: data.loadingMode,
      parserMode: data.parserMode,
      fields: data.fields.map((field, index) =>
        customFields[index] ? `-${field.name}` : `${field.name}`
      ),
      fixed_fields: Object.fromEntries(
        data.fixedFields.map(({ key, value }) => [
          key,
          isNaN(Number(value)) || value === "" ? value : Number(value),
        ])
      ),
    };

    onSubmit(formattedData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(handleFormSubmit)} className=" space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md rounded-2xl border border-gray-200">
            <CardContent className="space-y-4 py-4">
              <h2 className="text-lg font-semibold text-gray-800">Settings</h2>

              <Input
                {...register("name")}
                placeholder="Nome do typ"
                label="Nome do Typ"
                error={errors.name?.message}
              />

              <Input
                label="Separator"
                {...register("separator")}
                error={errors.separator?.message}
              />

              <div>
                <Label>Entity Name</Label>
                <Select
                  value={watch("entityName")}
                  onValueChange={(v) =>
                    setValue("entityName", v as EntityNameEnum)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a entidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(EntityNameEnum).map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Loading Mode</Label>
                <Select
                  value={watch("loadingMode")}
                  onValueChange={(v) =>
                    setValue("loadingMode", v as LoadingModeEnum)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modo de carregamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LoadingModeEnum).map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                {...register("parserMode")}
                label="Parser Mode"
                error={errors.parserMode?.message}
                placeholder="Ex: FIXED_WIDTH"
              />
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl border border-gray-200 overflow-hidden">
            <CardContent className="py-4 space-y-4 max-h-[600px] overflow-auto">
              <h2 className="text-lg font-semibold text-gray-800">
                Business Attributes
              </h2>

              {dynamicFields.map((field, index) => (
                <div key={field.id} className="flex w-full gap-2 items-end">
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      {...register(`fields.${index}.name`)}
                      label={`${(index + 1)
                        .toString()
                        .padStart(2, "0")} - Atributo`}
                      error={
                        errors.fields && errors.fields[index]?.name?.message
                      }
                      placeholder="Digite o atributo desejado"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    {!typData && (
                      <>
                        <Label className="text-sm">Custom</Label>
                        <Checkbox
                          checked={!!customFields[index]}
                          onCheckedChange={(checked) =>
                            setCustomFields((prev) => ({
                              ...prev,
                              [index]: !!checked,
                            }))
                          }
                        />
                      </>
                    )}
                    {dynamicFields.length > 1 && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={index === 0}
                          onClick={() =>
                            index > 0 && moveField(index, index - 1)
                          }
                        >
                          <MoveUp />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={index === dynamicFields.length - 1}
                          onClick={() =>
                            index < dynamicFields.length - 1 &&
                            moveField(index, index + 1)
                          }
                        >
                          <MoveDown />
                        </Button>
                      </>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      className="h-9"
                      variant="destructive"
                      onClick={() => removeField(index)}
                    >
                      <Trash />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" onClick={() => appendField({ name: "" })}>
                + Adicionar Campo
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl border border-gray-200">
            <CardContent className="py-4 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Fixed Fields
              </h2>

              {dynamicFixedFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="flex items-end justify-between w-full gap-2">
                    <Input
                      label="Chave"
                      {...register(`fixedFields.${index}.key`)}
                      placeholder="Chave"
                      error={
                        errors.fixedFields &&
                        errors.fixedFields[index]?.key?.message
                      }
                    />
                    <span>=</span>
                    <Input
                      label="Valor"
                      {...register(`fixedFields.${index}.value`)}
                      placeholder="Valor"
                      error={
                        errors.fixedFields &&
                        errors.fixedFields[index]?.value?.message
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-9"
                      variant="destructive"
                      onClick={() => removeFixed(index)}
                    >
                      <Trash />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                onClick={() => appendFixed({ key: "", value: "" })}
              >
                + Adicionar Campo Fixo
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            className={typData ? "flex-[4]" : "w-full"}
          >
            {isLoading
              ? typData
                ? "Atualizando..."
                : "Salvando..."
              : typData
              ? "Atualizar Typ"
              : "Salvar Typ"}
          </Button>

          {typData && (
            <Button
              type="button"
              variant="destructive"
              disabled={isLoading}
              className="flex-[1]"
              onClick={() => onDelete && onDelete(typData.id)}
            >
              {isLoading ? "Deletando..." : "Deletar"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

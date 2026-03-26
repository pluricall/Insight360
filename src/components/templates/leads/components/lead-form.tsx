"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { SelectField, SelectItem } from "@/components/select-field";
import { X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Label } from "@/components/ui/label";

export const mappingSchema = z.object({
  sourceField: z.string().min(1, "Campo do cliente é obrigatório"),
  altitudeField: z.string().min(1, "Campo do Altitude é obrigatório"),
  isRequired: z.boolean(),
  isPhoneNumber: z.boolean(),
});

export const leadSchema = z.object({
  clientName: z.string().min(1, "Nome do cliente é obrigatório"),
  environment: z.enum(["cloud", "onprem", "pre"]),
  campaignName: z.string().min(1, "Nome da campanha é obrigatório"),
  contactList: z.string().min(1, "Contact list é brigatório"),
  directoryName: z.string().min(1, "Diretório é obrigatório"),
  timezone: z.string().min(1),
  defaultStatus: z.string().min(1),
  usesDncl: z.boolean(),
});

export const leadConfigSchema = z.object({
  lead: leadSchema,
  mapping: z.array(mappingSchema).min(1, "Adicione ao menos um mapping"),
});

export type LeadConfigFormData = z.infer<typeof leadConfigSchema>;

export function LeadForm() {
  const { register, control, handleSubmit, formState: { errors } } = useForm<LeadConfigFormData>({
    resolver: zodResolver(leadConfigSchema),
    defaultValues: {
      lead: {
        environment: "cloud",
        clientName: "",
        campaignName: "",
        contactList: "",
        directoryName: "",
        timezone: "GMT",
        defaultStatus: "Started",
        usesDncl: false,
      },
      mapping: [{ isRequired: false, isPhoneNumber: false, sourceField: "", altitudeField: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "mapping",
  });

  const insertMapping = () =>
    append({
      sourceField: "",
      altitudeField: "",
      isRequired: false,
      isPhoneNumber: false,
    })

  async function onSubmit(data: LeadConfigFormData) {
    try {
      const response = await axios.post(
        "https://agent.tejo.cc/Insight360api/leads/config",
        data
      );
      toast.success(`Configuração de ${response.data.clientName} criada com sucesso!`);
''    } catch (err: any) {
      const message = err.response?.data?.error ?? "Erro desconhecido";
      toast.error(message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-lg font-bold">
        Configurações
      </h2>
      <div>
        <div className="flex flex-col lg:flex-row lg:gap-4">
          <Input label="Nome do cliente" {...register('lead.clientName')} error={errors.lead?.clientName?.message} />
          <Input label="Diretório" {...register('lead.directoryName')} error={errors.lead?.directoryName?.message} />
        </div>
        <div className="flex flex-col lg:flex-row lg:gap-4">
          <Input label="Nome da campanha" {...register('lead.campaignName')} error={errors.lead?.campaignName?.message} />
          <Input label="Contact List" {...register('lead.contactList')} error={errors.lead?.contactList?.message} />
        </div>
        <Controller
          control={control}
          name="lead.environment"
          render={({ field }) => (
            <SelectField
              label="Ambiente"
              placeholder="Selecione o ambiente"
              value={field.value}
              onValueChange={field.onChange}
              error={errors.lead?.environment?.message}
            >
              <SelectItem value="cloud">Cloud</SelectItem>
              <SelectItem value="onprem">On Premise</SelectItem>
              <SelectItem value="pre">Pré Cloud</SelectItem>
            </SelectField>
          )}
        />
      </div>

      <h2 className="text-lg font-bold py-2">
        Mappings
      </h2>

      {fields.map((item, index) => (
        <div key={item.id} className="flex gap-4 w-full pb-4 items-end">
          <Input
            placeholder="Campo de envio pelo cliente"
            label="Campo Cliente"
            {...register(`mapping.${index}.sourceField`)}
            error={errors.mapping?.[index]?.sourceField?.message}
          />
          <Input
            placeholder="Campo a ser carregado no Altitude"
            label="Campo Altitude"
            {...register(`mapping.${index}.altitudeField`)}
            error={errors.mapping?.[index]?.altitudeField?.message}
          />
          <Controller
            control={control}
            name={`mapping.${index}.isRequired`}
            render={({ field }) => (
              <div className="flex flex-col gap-1 items-center">
                <Label className="text-xs">
                  Obrigatório?
                </Label   >
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="h-[36px]"
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name={`mapping.${index}.isPhoneNumber`}
            render={({ field }) => (
              <div className="flex flex-col gap-1 items-center">
                <Label className="text-xs">
                  Telefone?
                </Label   >
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="h-[36px] bg-green-500 data-[state=checked]:bg-green-500"
                />
              </div>
            )}
          />
          <X className="text-red-500 cursor-pointer" size={30} onClick={() => remove(index)} />
        </div>
      ))}

      <div className="flex flex-col gap-4">
        <Button
          type="button"
          onClick={() => insertMapping()}
          className="w-fit"
          variant="outline"
        >
          Adicionar map
        </Button>

        <Button type="submit" className="w-full">
          Salvar
        </Button>
      </div>
    </form>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CubeTable } from "./components/CubeTable";
import { TimeSplitDimensionForm } from "./components/TimeSplitDimensionForm";
import { Loader, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTimeSplitDimension } from "@/hooks/useTimeSplitDimension";
import { MultiSelect } from "@/components/MultiSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  openCube,
  closeCube,
  cubeAttributes,
  getAllCampaigns,
  getCampaignIdByName,
  allServices,
  serviceIdByName,
  tableSchema,
} from "@/services";
import Cookies from "js-cookie";
import { apiDb } from "@/lib/axios";

const cubeSchema = z.object({
  timeSplitDimension: z.string().optional(),
  startGmtMoment: z.string().optional(),
  endGmtMoment: z.string().nullable().optional(),
  startDayTime: z.string().nullable().optional(),
  endDayTime: z.string().nullable().optional(),
  discriminator: z.string().optional(),
  columns: z.string().min(1, { message: "Columns are required" }),
  dimensionRequests: z.array(
    z.object({
      Dimension: z.string().min(1, { message: "Dimension is required" }),
      EntityIdFilter: z.array(z.string()),
      SqlFilter: z.string().optional(),
      discriminator: z.string().optional(),
    })
  ),
});

export type CubeForm = z.infer<typeof cubeSchema>;

export default function Home() {
  const [tableData, setTableData] = useState<
    Array<{ Name: string; Value: string }[]>
  >([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaveTable, setIsSaveTable] = useState<boolean>(false);
  const [cubeConfig, setCubeConfig] = useState<any>(null);
  const [columnNames, setColumnNames] = useState([]);
  const [allDimensions, setDimensionNames] = useState<string[]>([]);
  const [dimensionOptions, setDimensionOptions] = useState<
    Record<number, string[]>
  >({});
  const [loadingIndexes, setLoadingIndexes] = useState<Record<number, boolean>>(
    {}
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CubeForm>({
    resolver: zodResolver(cubeSchema),
    defaultValues: {
      dimensionRequests: [
        {
          SqlFilter: "",
          Dimension: "",
          EntityIdFilter: [],
          discriminator: "",
        },
      ],
      timeSplitDimension: "QuarterHour",
      startGmtMoment: "",
      endGmtMoment: "",
      startDayTime: "",
      endDayTime: null,
      columns: "",
      discriminator: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dimensionRequests",
  });

  useTimeSplitDimension({
    watch,
    setValue,
  });

  async function fetchOptionsForDimension(
    requestIndex: number,
    dimension: string
  ) {
    const fetchers: Record<string, () => Promise<string[]>> = {
      Campaign: getAllCampaigns,
      Service: allServices,
    };

    setLoadingIndexes((prev) => ({ ...prev, [requestIndex]: true }));

    try {
      const response = fetchers[dimension] ? await fetchers[dimension]() : [];
      setDimensionOptions((prev) => ({ ...prev, [requestIndex]: response }));
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setLoadingIndexes((prev) => ({ ...prev, [requestIndex]: false }));
    }
  }

  async function createCube(data: any) {
    try {
      setIsLoading(true);

      const idResolvers: Record<
        string,
        (name: string) => Promise<string | undefined>
      > = {
        Campaign: getCampaignIdByName,
        Service: serviceIdByName,
      };

      const FormattedDimensionRequests = await Promise.all(
        data.dimensionRequests.map(async (request: any) => {
          const resolver = idResolvers[request.Dimension];

          if (resolver) {
            return {
              ...request,
              EntityIdFilter: (
                await Promise.all(request.EntityIdFilter.map(resolver))
              ).filter(Boolean),
            };
          }
          return request;
        })
      );

      const updatedData = {
        ...data,
        dimensionRequests: FormattedDimensionRequests,
      };
      const cubeId = await openCube(updatedData);
      const attributes = await cubeAttributes(cubeId);
      setTableData(attributes);
      setCubeConfig(updatedData);
      await closeCube(cubeId);
    } catch (error: any) {
      toast.error("Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveCubeToDatabase() {
    if (!cubeConfig || tableData.length === 0) {
      toast.error("Nenhum dado disponível para salvar.");
      return;
    }

    try {
      setIsSaveTable(true);
      const username = Cookies.get("username");
      const token = Cookies.get("access_token");

      if (!username || !token) {
        toast.error("Usuário não autenticado.");
        return;
      }

      const response = await apiDb.post(
        "/cubes",
        {
          username,
          columns: cubeConfig.columns,
          dimensionRequests: cubeConfig.dimensionRequests.map(
            (request: any) => ({
              Dimension: request.Dimension,
              EntityIdFilter: request.EntityIdFilter,
              SqlFilter: request.SqlFilter,
              discriminator: request.discriminator,
            })
          ),
          tableData: tableData.map((row: any[]) =>
            row.map((cell) => ({
              Name: cell.Name,
              Value: cell.Value,
              IsAnonymized: cell.IsAnonymized,
            }))
          ),
          updatedAt: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-username": username,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(`Cubo salvo com sucesso! ID: ${response.data._id}`);
    } catch (error: any) {
      console.error("Erro ao salvar cubo:", error);

      if (error.response) {
        console.error("Resposta do erro:", error.response);
        toast.error(`Erro ao salvar cubo: ${error.response.data.message}`);
      } else if (error.request) {
        console.error("Requisição ao servidor falhou:", error.request);
        toast.error("Erro na requisição ao servidor.");
      } else {
        toast.error("Erro ao salvar cubo no banco de dados.");
      }
    } finally {
      setIsSaveTable(false);
    }
  }

  useEffect(() => {
    async function getTableSchemaAndDimensions() {
      const response = await tableSchema();
      const dimensionsMap = response.CubeDimensions.map(
        (item: any) => item.Name
      );
      const tableSchemaNames = response.Columns.map((item: any) => item.Name);
      setDimensionNames(dimensionsMap);
      setColumnNames(tableSchemaNames);
    }
    getTableSchemaAndDimensions();
  }, []);

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit(createCube)}
        className="space-y-2 flex flex-col w-full"
      >
        <TimeSplitDimensionForm register={register} setValue={setValue} />

        {fields.map((field, index) => (
          <div key={field.id}>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                {errors?.dimensionRequests?.[index]?.Dimension && (
                  <span className="text-destructive font-bold text-sm">
                    {errors.dimensionRequests[index].Dimension.message}
                  </span>
                )}
                {!errors?.dimensionRequests?.[index]?.Dimension && (
                  <Label htmlFor={`dimensionRequests.${index}.Dimension`}>
                    Dimensões:
                  </Label>
                )}
                <Select
                  onValueChange={(value) => {
                    setValue(`dimensionRequests.${index}.Dimension`, value);
                    fetchOptionsForDimension(index, value);
                  }}
                  defaultValue={watch(`dimensionRequests.${index}.Dimension`)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a dimensão" />
                  </SelectTrigger>
                  <SelectContent>
                    {allDimensions.map((dimension, i) => (
                      <SelectItem key={i} value={dimension}>
                        {dimension}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor={`dimensionRequests.${index}.EntityIdFilter`}>
                  Filtrar Dimensões:
                </Label>
                <MultiSelect
                  options={dimensionOptions[index] || []}
                  isLoading={loadingIndexes[index] || false}
                  value={watch(`dimensionRequests.${index}.EntityIdFilter`)}
                  onChange={(selectedIds) =>
                    setValue(
                      `dimensionRequests.${index}.EntityIdFilter`,
                      selectedIds
                    )
                  }
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`dimensionRequests.${index}.SqlFilter`}>
                  Filtro SQL:
                </Label>
                <Input
                  type="text"
                  placeholder={`Ex: WHERE Status = 'Started'`}
                  {...register(`dimensionRequests.${index}.SqlFilter`)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() =>
                    append({
                      SqlFilter: "",
                      Dimension: "",
                      EntityIdFilter: [],
                      discriminator: "",
                    })
                  }
                  variant="secondary"
                >
                  Adicionar
                  <Plus />
                </Button>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        <div>
          {!errors.columns && <Label>Columns</Label>}
          {errors.columns && (
            <span className="text-destructive font-bold text-sm">
              {errors.columns.message}
            </span>
          )}
          <MultiSelect
            options={columnNames}
            isFullWidth
            value={
              watch("columns")
                ? watch("columns").split(",").filter(Boolean)
                : []
            }
            onChange={(selected) => setValue("columns", selected.join(","))}
            isLoading={columnNames.length === 0}
          />
        </div>

        <div>
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <>
                <Loader className="animate-spin" />
                Criando tabela
              </>
            )}
            {!isLoading && "Criar tabela"}
          </Button>
        </div>

        {tableData.length > 0 && (
          <div className="mt-10">
            <CubeTable data={tableData} />
            <div className="flex gap-2">
              <Button
                size="lg"
                type="button"
                disabled={isSaveTable}
                className="mt-4 w-full"
                onClick={handleSaveCubeToDatabase}
              >
                {isSaveTable && "Salvando..."}
                {!isSaveTable && "Salvar tabela"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

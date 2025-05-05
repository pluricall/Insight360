"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CubeTable } from "../(home)/components/CubeTable";
import { TimeSplitDimensionForm } from "../(home)/components/TimeSplitDimensionForm";
import { useTimeSplitDimension } from "@/hooks/useTimeSplitDimension";
import { toast } from "sonner";
import {
  closeCube,
  cubeAttributes,
  openCube,
  type OpenCubeData,
  type TimeSplitDimensionEnum,
} from "@/services";
import { CircleX, Loader } from "lucide-react";
import { apiDb } from "@/lib/axios";
import Cookies from "js-cookie";
import { Card } from "@/components/ui/card";

type TableCell = {
  Name: string;
  Value: string;
  IsAnonymized: boolean;
};

type TableRow = TableCell[];

interface CubeConfig extends OpenCubeData {
  _id: string;
  tableData: TableRow[];
  updatedAt: string | null;
  attributes: Record<string, string | number>[];
}

export default function Cubes() {
  const [cubeConfigs, setCubeConfigs] = useState<CubeConfig[]>([]);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState<boolean>(false);
  const [isLoadingRemove, setIsLoadingRemove] = useState<boolean>(false);
  const [isLoadingCubes, setIsLoadingCubes] = useState<boolean>(false);

  const { register, watch, setValue } = useForm({
    defaultValues: {
      timeSplitDimension: "QuarterHour",
      startGmtMoment: "",
      endGmtMoment: "",
    },
  });

  useTimeSplitDimension({
    watch,
    setValue,
  });

  const updateCubeList = (updatedCube: CubeConfig) => {
    setCubeConfigs((prevConfigs) =>
      prevConfigs.map((config) =>
        config._id === updatedCube._id ? updatedCube : config
      )
    );
  };

  const removeCubeFromList = (cubeId: string) => {
    setCubeConfigs((prevConfigs) =>
      prevConfigs.filter((config) => config._id !== cubeId)
    );
  };

  async function handleUpdateCube(cubeId: string) {
    if (!cubeId) {
      toast.error("Cube ID não encontrado.");
      return;
    }

    setIsLoadingUpdate(true);
    try {
      const username = Cookies.get("username");
      const token = Cookies.get("access_token");

      if (!username || !token) {
        toast.error("Usuário não autenticado.");
        return;
      }

      const cubeConfig = cubeConfigs.find((config) => config._id === cubeId);

      if (!cubeConfig) {
        toast.error("Configuração do cubo não encontrada.");
        return;
      }

      const payload: OpenCubeData = {
        columns: cubeConfig.columns,
        dimensionRequests: cubeConfig.dimensionRequests,
        timeSplitDimension: watch("timeSplitDimension") as TimeSplitDimensionEnum,
        startGmtMoment: watch("startGmtMoment"),
        endGmtMoment: watch("endGmtMoment"),
        discriminator: "",
        endDayTime: null,
        startDayTime: null,
      };

      const cursorId = await openCube(payload);
      const updatedAttributes = await cubeAttributes(cursorId);
      await closeCube(cursorId);

      const dataToUpdate = {
        ...cubeConfig,
        tableData: updatedAttributes.map((row: any[]) =>
          row.map((cell: any) => ({
            Name: cell.Name,
            Value: cell.Value,
            IsAnonymized: cell.IsAnonymized,
          }))
        ),
        updatedAt: new Date().toISOString(),
      };

      // Atualiza o cubo na lista local
      updateCubeList(dataToUpdate);

      await apiDb.put(`cubes/${cubeId}`, dataToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-username": username,
        },
      });

      toast.success(`Cubo atualizado com sucesso!`);
    } catch (error: any) {
      console.error("Erro ao atualizar o cubo:", error.message || error);
      toast.error("Erro ao atualizar cubo.");
    } finally {
      setIsLoadingUpdate(false);
    }
  }

  async function handleDeleteCube(cubeId: string) {
    if (!cubeId) {
      toast.error("Cube ID inválido.");
      return;
    }

    setIsLoadingRemove(true);

    try {
      const token = Cookies.get("access_token");
      const username = Cookies.get("username");

      if (!token || !username) {
        toast.error("Usuário não autenticado.");
        return;
      }

      await apiDb.delete(`/cubes/${cubeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-username": username,
        },
      });

      removeCubeFromList(cubeId);

      toast.success("Cubo excluído com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir cubo:", error);
      toast.error("Erro ao excluir cubo.");
    } finally {
      setIsLoadingRemove(false);
    }
  }

  useEffect(() => {
    const fetchCubeData = async () => {
      setIsLoadingCubes(true);
      try {
        const username = Cookies.get("username");
        const token = Cookies.get("access_token");

        if (!username || !token) {
          console.error("Usuário não autenticado.");
          return;
        }

        const response = await apiDb.get("/cubes", {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-username": username,
          },
        });

        setCubeConfigs(response.data);
      } catch (error) {
        console.error("Erro ao carregar cubos do backend:", error);
      } finally {
        setIsLoadingCubes(false);
      }
    };
    fetchCubeData();
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto w-full min-h-screen flex flex-col items-center p-2 space-y-8">
      {isLoadingCubes && (
        <div className="flex flex-col items-center justify-center text-center h-full">
          <Loader size={80} className="animate-spin text-gray-500" />
        </div>
      )}

      {!isLoadingCubes && cubeConfigs.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center h-full">
          <CircleX size={120} className="text-gray-400 mb-2 animate-bounce" />
          <h2 className="text-2xl font-semibold">Nenhum cubo disponível</h2>
          <p className="text-md max-w-md">
            Nenhum dado foi encontrado no momento. Tente adicionar um novo cubo
            ou atualizar a página.
          </p>
        </div>
      )}

      {!isLoadingCubes && cubeConfigs.length > 0 && (
        <div className="flex flex-col gap-4 w-full">
          {cubeConfigs.map(({ _id, tableData, updatedAt }) => (
            <Card key={_id} className="p-2">
              <div className="flex flex-col gap-2 w-full">
                <TimeSplitDimensionForm register={register} setValue={setValue} />
                <CubeTable
                  data={tableData}
                  lastUpdate={updatedAt}
                  cubeId={_id}
                  isLoadingRemove={isLoadingRemove}
                  isLoadingUpdate={isLoadingUpdate}
                  onClickUpdate={() => handleUpdateCube(_id)}
                  onClickRemove={() => handleDeleteCube(_id)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

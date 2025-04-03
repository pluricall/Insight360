"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  FunnelChart,
  Tooltip,
  Funnel,
  LabelList,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { FunnelAndDonutSkeleton } from "./Skeletons/Funnel";

interface FunnelDataProps {
  value: number;
  name: string;
  fill: string;
}

export function FunnelChartComponent() {
  const [funnelData, setFunnelData] = useState<FunnelDataProps[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [porcentagemTrabalhados, setPorcentagemTrabalhados] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/query/funnel");
        const result = await response.json();

        if (result.error) {
          console.error("Erro ao buscar dados:", result.error);
          return;
        }

        const carregados = result[0]?.carregados ?? 0;
        const trabalhados = result[0]?.trabalhados ?? 0;
        const naoTrabalhados = carregados - trabalhados;

        const formattedData = [
          { value: carregados, name: "Carregados", fill: "#9c1b26" },
          { value: result[0]?.contatos_uteis ?? 0, name: "Contatos úteis", fill: "#043cac" },
          { value: result[0]?.marcacoes ?? 0, name: "Marcações", fill: "#8ce43a" },
        ];

        const formattedPieData = [
          { name: "Trabalhados", value: trabalhados },
          { name: "Não Trabalhados", value: naoTrabalhados > 0 ? naoTrabalhados : 0 },
        ];

        const porcentagem = carregados > 0 ? ((trabalhados / carregados) * 100).toFixed(2) : 0;

        setFunnelData(formattedData);
        setPieData(formattedPieData);
        setPorcentagemTrabalhados(Number(porcentagem));
      } catch (error) {
        console.error("Erro na requisição:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Card className="flex flex-col justify-center h-[450px]">
      <CardContent className="p-2">
        {isLoading && <FunnelAndDonutSkeleton/>}
        {!isLoading && (
          <div className="flex">
              <ResponsiveContainer width="100%" height={380}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill="#FFF" stroke="none" dataKey="value" />
                    <LabelList position="left" fill="#FFF" stroke="none" dataKey="name" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
      
            <div className="relative flex items-center justify-center">
              <PieChart width={250} height={380}>
                <Pie
                  stroke="none"
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  dataKey="value"
                  label={({ value }) => value} 
                >
                  <Cell key="trabalhados" fill="#8d8d8d" />
                  <Cell key="naoTrabalhados" fill="#2de200" />
                </Pie>
                <Tooltip />
              </PieChart>

              <div className="absolute text-center">
                <h3 className="text-2xl font-bold">{porcentagemTrabalhados}%</h3>
                <p className="text-sm text-gray-300">Trabalhados</p>
              </div>
            </div>
          </div>
          )
        }
      </CardContent>
    </Card>
  );
}

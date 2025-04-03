"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { TableSkeleton } from "./Skeletons/Tables";
import { Skeleton } from "@/components/ui/skeleton";

export function TableSuccessTypeBd() {
  const [data, setData] = useState<any[]>([]);
  const [sum, setSum] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/query/success-typebd", {
          method: "GET",
        });
        const result = await response.json();

        if (result.error) {
          console.error("Erro ao buscar dados:", result.error);
          return;
        }

        if (result.length > 0) {
          const headerKeys = Object.keys(result[0]);
          setHeaders(headerKeys);
        }

        const totalMarcacoes = result.reduce((sum: any, item: any) => {
          return sum + (item.Marcações ? item.Marcações : 0);
        }, 0);

        setData(result);
        setSum(totalMarcacoes);
      } catch (error) {
        console.error("Erro na requisição:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Card className="flex flex-col h-[450px]">
      <CardContent className="overflow-y-auto p-2 flex-1">
        {isLoading && <TableSkeleton lenghtHeaders={3} lengthRows={3} />}
        {!isLoading && (
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header} className="sticky top-0 bg-zinc-900">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell key={header}>{item[header]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="p-2">{!isLoading ? <span>Total Marcações: {sum}</span> : <Skeleton className="h-6 w-40"/>}</CardFooter>
    </Card>
  );
}

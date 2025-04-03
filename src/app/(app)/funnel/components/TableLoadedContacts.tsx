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
import { Card, CardContent } from "@/components/ui/card";
import { TableSkeleton } from "./Skeletons/Tables";

export function TableLoadedContacts() {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/query/loaded-contacts", {
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

        setData(result);
      } catch (error) {
        console.error("Erro na requisição:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Card className="flex flex-col h-[908px]">
      <CardContent className="overflow-y-auto p-2 flex-1">
        {isLoading && <TableSkeleton lenghtHeaders={6} lengthRows={26} />}
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
              {data.map((item: any, index) => (
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
    </Card>
  );
}

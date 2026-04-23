"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SkeletonTable } from "./skeleton-table";
import { useEffect, useState } from "react";

export const RecordTable = ({ refresh }: { refresh: number }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [clientRecords, setClientRecords] = useState<any[]>([]);
  const rowsToShow = isLoading ? 10 : clientRecords.length;

  const handleInactivate = async (clientName: string) => {
    const confirmed = window.confirm(`Deseja realmente inativar o cliente "${clientName}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`https://lince.centrocontacto.cc/clients/records/${clientName}`, {
        method: "PATCH",
      });

      if (!res.ok) {
        return toast.error("Erro ao atualizar status do cliente.");
      }

      toast.success("Cliente inativado com sucesso!");

      setClientRecords?.((prev) => prev.filter((item) => item.clientName !== clientName));
    } catch (err) {
      toast.error("Erro de rede ao atualizar status.");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetch("https://lince.centrocontacto.cc/clients/records")
      .then(res => res.json())
      .then(data => {
        setClientRecords(data.clientRecord);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [refresh]);

  return (
    <div className="border rounded-md overflow-hidden w-full">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="font-bold text-card-foreground">Cliente</TableHead>
            <TableHead className="font-bold text-card-foreground">CT</TableHead>
            <TableHead className="font-bold text-card-foreground">% Diferentes</TableHead>
            <TableHead className="font-bold text-card-foreground">Hora</TableHead>
            <TableHead className="font-bold text-card-foreground">BD</TableHead>
            <TableHead className="font-bold text-card-foreground">Histórico</TableHead>
            <TableHead className="font-bold text-card-foreground">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: rowsToShow }).map((_, index) => {
            const row = clientRecords[index];
            const bgClass = index % 2 === 0 ? "" : "bg-muted";

            return (
              <TableRow key={index} className={bgClass}>
                {isLoading ? (
                  <SkeletonTable />
                ) : (
                  <>
                    <TableCell>{row.clientName}</TableCell>
                    <TableCell>{row.ct_}</TableCell>
                    <TableCell>{row.percentDifferentsResult}</TableCell>
                    <TableCell>{row.startTime}</TableCell>
                    <TableCell>{row.isBd === true ? "SIM" : "NÃO"}</TableCell>
                    <TableCell>{row.isHistorical === true ? "SIM" : "NÃO"}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleInactivate(row.clientName)}>
                        Desativar
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

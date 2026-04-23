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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { SkeletonTable } from "../../records/components/skeleton-table";

type Report = {
  id: number;
  client_name: string;
  site_id: string;
  drive_id: string;
  folder_path: string;
  status: "ACTIVO" | "INACTIVO";
  last_send: string | null;
  last_status: string | null;
  error: string | null;
  created_at: string;
};

export function ReportTable({ refresh }: { refresh: number }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch("https://lince.centrocontacto.cc/reports")
      .then((r) => r.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Erro ao carregar relatórios");
        setLoading(false);
      });
  }, [refresh]);

  const handleDeactivate = async (clientName: string) => {
    const confirmed = window.confirm("Deseja desativar este relatório?");
    if (!confirmed) return;

    try {
      const res = await fetch(`https://lince.centrocontacto.cc/reports/deactivate/${clientName}`, {
        method: "PATCH",
      });

      if (!res.ok) {
        return toast.error("Erro ao desativar");
      }

      toast.success("Relatório inativado!");

      setReports((prev) =>
        prev.map((r) =>
          r.client_name === clientName ? { ...r, status: "INACTIVO" } : r
        )
      );
    } catch {
      toast.error("Erro de rede");
    }
  };

  return (
    <Card className="w-full">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Pasta</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último envio</TableHead>
            <TableHead>Status do envio</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {(loading ? Array.from({ length: 6 }) : reports).map((row: any, index) => {
            const bgClass = index % 2 === 0 ? "" : "bg-muted";

            return (
              <TableRow key={row?.id ?? index} className={bgClass}>
                {loading ? (
                  <SkeletonTable />
                ) : (
                  <>
                    <TableCell className="font-medium">
                      {row.client_name}
                    </TableCell>

                    <TableCell className="text-xs truncate max-w-[140px]">
                      {row.folder_path || "—"}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.status === "ACTIVO"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {row.status}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs">
                      {row.last_send
                        ? new Date(row.last_send).toLocaleString("pt-PT")
                        : "—"}
                    </TableCell>

                    <TableCell className="text-xs">
                      {row.last_status || "—"}
                    </TableCell>

                    <TableCell>
                      {row.status === "ACTIVO" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeactivate(row.client_name)}
                        >
                          Desativar
                        </Button>
                      )}
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
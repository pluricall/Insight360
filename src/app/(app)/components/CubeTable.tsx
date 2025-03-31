import { Button } from "@/components/ui/button";
import { CalendarSync, Loader, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/formatDate";
import { useState } from "react";

interface CubeTableProps {
  data: Array<{ Name: string; Value: string }[]>;
  lastUpdate?: string | null;
  cubeId?: string;
  onClickUpdate?: (cubeId?: string) => void;
  onClickRemove?: (cubeId?: string) => void;
  isLoadingRemove?: boolean;
  isLoadingUpdate?: boolean;
}

export function CubeTable({
  data,
  lastUpdate,
  cubeId,
  onClickUpdate,
  onClickRemove,
  isLoadingRemove,
  isLoadingUpdate,
}: CubeTableProps) {
  const tableHeaders =
    data.length > 0 ? [...new Set(data.flat().map((cell) => cell.Name))] : [];
  const [sortConfig, setSortConfig] = useState<{
    column: string | null;
    direction: "asc" | "desc";
  }>({ column: null, direction: "asc" });

  const sortedData = [...data].sort((a, b) => {
    if (sortConfig.column === null) return 0;

    const aValue =
      a.find((cell) => cell.Name === sortConfig.column)?.Value || "";
    const bValue =
      b.find((cell) => cell.Name === sortConfig.column)?.Value || "";

    const aNumber = !isNaN(parseFloat(aValue)) ? parseFloat(aValue) : null;
    const bNumber = !isNaN(parseFloat(bValue)) ? parseFloat(bValue) : null;

    if (aNumber !== null && bNumber !== null) {
      return sortConfig.direction === "asc"
        ? aNumber - bNumber
        : bNumber - aNumber;
    }

    return sortConfig.direction === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const totalSuccess = data
    .flat()
    .filter((cell) => cell.Name === "SuccessTotal")
    .reduce((sum, cell) => sum + (parseFloat(cell.Value) || 0), 0);

  const handleSort = (header: string) => {
    setSortConfig((prev) => {
      if (prev.column === header) {
        return {
          column: header,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { column: header, direction: "asc" };
    });
  };
  return (
    <>
      <div className="border border-border rounded-xl max-h-[465px] overflow-y-auto shadow-lg">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-accent text-accent-foreground">
              {tableHeaders.map((header) => (
                <TableHead
                  key={header}
                  className={`px-4 py-2 font-semibold text-md sticky top-0 bg-accent text-accent-foreground z-10 border-b border-border cursor-pointer ${sortConfig.column === header ? (sortConfig.direction === "desc" ? "text-green-500" : "text-red-500") : ""}`}
                  onClick={() => handleSort(header)}
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={`transition-colors ${
                  rowIndex % 2 === 0
                    ? "bg-background hover:bg-muted/50"
                    : "bg-muted/20 hover:bg-muted/50"
                }`}
              >
                {row.map((cell, i) => (
                  <TableCell
                    key={i}
                    className="px-4 py-4 text-sm text-foreground/90 border-b border-border"
                  >
                    {cell.Value}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalSuccess > 0 && (
        <span className="text-sm text-foreground/80">
        <strong>Marcações</strong>: {totalSuccess}
      </span>
      )}
      {onClickUpdate && onClickRemove && (
        <div className="flex justify-between items-center mt-">

          <div className="flex items-center gap-6">
            <Button
              onClick={() => onClickUpdate(cubeId)}
              size="lg"
              disabled={isLoadingUpdate}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md flex items-center gap-2 px-5 py-3 rounded-lg"
            >
              {!isLoadingUpdate && (
                <>
                  <CalendarSync size={18} />
                  Atualizar Tabela
                </>
              )}
              {isLoadingUpdate && (
                <>
                  <Loader size={18} />
                  Atualizando...
                </>
              )}
            </Button>
            <Button
              onClick={() => onClickRemove(cubeId)}
              size="lg"
              disabled={isLoadingRemove}
              variant="destructive"
              className="text-primary-foreground transition-colors shadow-md flex items-center gap-2 px-5 py-3 rounded-lg"
            >
              {!isLoadingRemove && (
                <>
                  <Trash size={18} />
                  Deletar Tabela
                </>
              )}
              {isLoadingRemove && (
                <>
                  <Loader size={18} />
                  Deletando...
                </>
              )}
            </Button>
          </div>

          {lastUpdate && (
            <span className="text-sm text-foreground/80">
              <strong>Última atualização</strong>: {formatDate(lastUpdate)}
            </span>
          )}
        </div>
      )}
    </>
  );
}

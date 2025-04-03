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

interface CubeTableProps {
  data: { Name: string; Value: string }[][];
  cubeId?: string;
  onClickUpdate?: (cubeId?: string) => void;
  onClickRemove?: (cubeId?: string) => void;
  isLoadingRemove?: boolean;
  isLoadingUpdate?: boolean;
  lastUpdate?: string | null;
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
  const nameHeaders = [...new Set(data.flat().map((cell) => cell.Name))];

  const totalSuccess = data.reduce(
    (sum, row) =>
      sum +
      row.reduce(
        (rowSum, cell) =>
          cell.Name === "SuccessTotal" ? rowSum + (parseFloat(cell.Value) || 0) : rowSum,
        0
      ),
    0
  );

  return (
    <>
      <div className="border border-border rounded-xl max-h-[465px] overflow-y-auto shadow-lg">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-accent text-accent-foreground">
              {nameHeaders.map((name) => (
                <TableHead
                  key={name}
                  className={`px-4 py-2 font-semibold text-md sticky top-0 bg-accent text-accent-foreground z-10 border-b border-border cursor-pointer`}>
                  {name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={`transition-colors ${
                  rowIndex % 2 === 0
                    ? "bg-background"
                    : "bg-muted"
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
        <div className="flex justify-between items-center mt-4">

          <div className="flex items-center gap-6">
            <Button
              onClick={() => onClickUpdate(cubeId)}
              disabled={isLoadingUpdate}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md flex items-center gap-2 px-5 py-3 rounded-lg"
            >
              {!isLoadingUpdate && (
                <>
                  Atualizar Tabela
                  <CalendarSync size={18} />
                </>
              )}
              {isLoadingUpdate && (
                <>
                  Atualizando...
                  <Loader size={18} />
                </>
              )}
            </Button>

            <Button
              onClick={() => onClickRemove(cubeId)}
              disabled={isLoadingRemove}
              size="lg"
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

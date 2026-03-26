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

type ClientRecordingsParams = {
  clientName: string;
  ct_: string;
  percentDifferentsResult: number;
  startTime: string;
  siteId: string;
  driveId: string;
  folderPath: string;
  status: "ACTIVO" | "INACTIVO";
  isBd: boolean;
  isHistorical: boolean;
};

interface RecordingTableProps {
  data?: ClientRecordingsParams[];
  setData?: React.Dispatch<React.SetStateAction<ClientRecordingsParams[]>>;
  loading?: boolean;
}

const SkeletonTable = () => (
  <>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-full bg-muted animate-pulse" /></TableCell>
  </>
);

export const RecordingTable = ({ data = [], setData, loading = false }: RecordingTableProps) => {
  const rowsToShow = loading ? 10 : data.length;

const handleInactivate = async (clientName: string) => {
  const confirmed = window.confirm(`Deseja realmente inativar o cliente "${clientName}"?`);
  if (!confirmed) return;

  try {
    const res = await fetch(`http://localhost:3333/clients/records/${clientName}`, {
      method: "PATCH",
    });

    if (!res.ok) {
      return toast.error("Erro ao atualizar status do cliente.");
    }

    toast.success("Cliente inativado com sucesso!");

    setData?.((prev) => prev.filter((item) => item.clientName !== clientName));
  } catch (err) {
    toast.error("Erro de rede ao atualizar status.");
  }
};

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
            const row = data[index];
            const bgClass = index % 2 === 0 ? "" : "bg-muted";

            return (
              <TableRow key={index} className={bgClass}>
                {loading ? (
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

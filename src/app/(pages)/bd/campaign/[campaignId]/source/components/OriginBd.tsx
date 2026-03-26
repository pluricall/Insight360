import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OriginBdProps = React.ComponentProps<typeof Select> & {
  error?: string;
};

export function OriginBd({ onValueChange, value, error }: OriginBdProps) {
  return (
    <div>
      {error && <Label className="text-red-500">{error}</Label>}
      {!error && <Label>Origem</Label>}
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger className={error && "border-red-500"}>
          <SelectValue placeholder="Selecione a origem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="directory">Diretório Local</SelectItem>
          <SelectItem value="ftp">FTP</SelectItem>
          <SelectItem value="sftp">SFTP</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

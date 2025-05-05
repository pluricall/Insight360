import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ScheduleFrequencyProps = {
  onValueChange: (value: string) => void;
  value: string | undefined;
  error?: string;
};

export function ScheduleFrequency({ onValueChange, value, error }: ScheduleFrequencyProps) {
  return (
    <div>
      {error && <Label className="text-red-500">{error}</Label>}
      {!error && <Label>Frequência</Label>}
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger className={error && "border-red-500"}>
          <SelectValue placeholder="Selecione a frequência" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Diária</SelectItem>
          <SelectItem value="weekly">Semanal</SelectItem>
          <SelectItem value="monthly">Mensal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

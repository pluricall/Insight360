import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const weekDays = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

interface WeekPickerProps {
  onChange: (days: number[]) => void;
  value: number[];
  error?: string;
}

export function WeekPicker({ value = [], onChange, error }: WeekPickerProps) {
  const toggleDay = (day: number) => {
    onChange(
      value.includes(day) ? value.filter((d) => d !== day) : [...value, day]
    );
  };

  const chosenWeekDays =
    value.length > 0 ?
    value.map((day) => weekDays.find((d) => d.value === day)?.label).join(", ") : 
     "Selecione os dias da semana"

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Input
            label="Dia(s) da Semana"
            error={error}
            value={chosenWeekDays}
            readOnly
            placeholder="Selecione os dias da semana"
            className="cursor-pointer text-left"
          />
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="flex flex-col gap-2">
            {weekDays.map((day) => (
              <div key={day.label} className="flex items-center gap-2">
                <Checkbox
                  id={day.value.toString()}
                  checked={value.includes(day.value)}
                  onCheckedChange={() => toggleDay(day.value)}
                />
                <Label htmlFor={day.label}>{day.label}</Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

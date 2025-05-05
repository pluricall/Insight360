import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MultiDayPickerProps {
  value: Number[];
  onChange: (days: Number[]) => void;
  error?: string;
}

export function MultiDayPicker({
  value,
  onChange,
  error,
}: MultiDayPickerProps) {
  const toggleDay = (day: number) => {
    const newDays = value.includes(day)
      ? value.filter((d) => d !== day)
      : [...value, day];
    onChange(newDays);
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              label="Dias do Mês"
              error={error}
              type="text"
              className="w-full text-left cursor-pointer"
              placeholder="Escolha os dias do mês"
              value={
                value.length
                  ? `Dias: ${value
                      .map(Number)
                      .sort((a, b) => a - b)
                      .join(", ")}`
                  : ""
              }
              readOnly
            />
            <CalendarIcon
              size={16}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-7 gap-2">
            {[...Array(31)].map((_, index) => {
              const day = (index + 1);
              const isSelected = value.includes(day);
              return (
                <Button
                  key={day}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => toggleDay(index + 1)}
                  className="w-10 h-10 p-0"
                >
                  {day}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

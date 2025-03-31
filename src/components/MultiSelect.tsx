import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMemo, useState } from 'react'
import { Input } from './ui/input';
import { Trash } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

interface MultiSelectProps {
  options: string[];
  value?: string[];
  onChange: (value: string[]) => void;
  isLoading?: boolean;
  isFullWidth?: boolean;
}

export const MultiSelect = ({
  options,
  value = [],
  onChange,
  isLoading = false,
  isFullWidth = false,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const clearAllOptions = () => {
    onChange([]);
  };

  const handleSelectAll = () => {
    if (filteredOptions.length === value.length) {
      onChange([]); 
    } else {
      onChange(filteredOptions);
    }
  };

  const filteredOptions = useMemo(() => {
    return options
      ? options
          .filter((option) =>
            option.toLowerCase().includes(filter.toLowerCase())
          )
          .sort((a, b) => {
            const aIsSelected = value.includes(a);
            const bIsSelected = value.includes(b);
            if (aIsSelected && !bIsSelected) return -1;
            if (!aIsSelected && bIsSelected) return 1;
            return 0;
          })
      : [];
  }, [options, filter, value]);

  return (
    <div
      className={`overflow-hidden ${isFullWidth ? "w-full" : "max-w-[600px]"}`}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            value={
              isLoading
                ? "Carregando..."
                : value.length > 0
                  ? value.join(", ")
                  : "Clique para ver as opções"
            }
            placeholder="Selecione as opções:"
            className={`text-start cursor-pointer hover:bg-secondary whitespace-nowrap text-ellipsis overflow-hidden`}
            disabled={isLoading}
          />
        </PopoverTrigger>
        <PopoverContent className="w-full p-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Filtrar opções"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mb-2 max-w-full p-2 border rounded text-lg"
              disabled={isLoading}
            />
            <Button
              variant={"outline"}
              onClick={clearAllOptions}
              title="Limpar tudo"
            >
              <Trash size={16} />
            </Button>
          </div>
          <div className="flex items-center gap-2 mb-2 pb-2 border-b">
          <Checkbox
            id="selectAll"
            checked={filteredOptions.length === value.length} 
            onCheckedChange={handleSelectAll}
            disabled={isLoading}
          />
            <label htmlFor="selectAll" className="text-sm font-medium">Selecionar todos</label>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={value.includes(option)}
                  onCheckedChange={() => handleToggle(option)}
                  disabled={isLoading}
                />
                <label htmlFor={option} className="text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

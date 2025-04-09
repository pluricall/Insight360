import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search, Trash } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";

interface MultiSelectProps {
  options: string[];
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export const MultiSelect = ({
  options,
  value = [],
  onChange,
  placeholder,
  isLoading = false,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);

  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const clearInput = () => {
    setFilter("");
    onChange([]);
    setVisibleCount(50);
  };

  const handleSelectAll = () => {
    if (visibleOptions.length === value.length) {
      onChange([]);
    } else {
      onChange(visibleOptions);
    }
  };

  const sortedOptions = options
  .filter((option) => option && option.toLowerCase().includes(filter.toLowerCase()))
  .sort((a, b) => {
    const isSelectedA = value.includes(a);
    const isSelectedB = value.includes(b);
    if (isSelectedA && !isSelectedB) return -1;
    if (!isSelectedA && isSelectedB) return 1;
    return a.localeCompare(b);
  });

  const visibleOptions = sortedOptions.slice(0, visibleCount);

  return (
    <div className={`w-full flex items-center max-w-[600px]`}>
      <DropdownMenu
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setVisibleCount(50);
          }
        }}
      >
        <DropdownMenuTrigger asChild className="w-full">
          <Button
            variant="outline"
            className="truncate w-full overflow-hidden text-ellipsis whitespace-nowrap justify-between"
            disabled={isLoading}
          >
            <span className="text-zinc-400">
              {isLoading
                ? "Carregando..."
                : value.length > 0
                  ? value.join(", ")
                  : placeholder}
            </span>
            <ChevronDown className="ml-2 w-4 h-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="max-h-96 overflow-auto p-2 rounded-xl shadow-xl border"
        >
          <div className="relative mb-3">
            <Input
              placeholder="Buscar..."
              className="w-full pl-9 pr-9"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setVisibleCount(50);
              }}
            />
            <Search
              size={16}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
              <Trash onClick={clearInput} size={16} className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 rounded-full"/>

          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSelectAll}
            className="w-full mb-2"
          >
            Selecionar Todos
          </Button>

          <DropdownMenuSeparator />

          <div className="flex flex-col gap-1">
            {visibleOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={value.includes(option)}
                onCheckedChange={() => handleToggle(option)}
                onSelect={(e) => e.preventDefault()}
                className="px-8 py-1 rounded-md hover:bg-muted"
              >
                {option}
              </DropdownMenuCheckboxItem>
            ))}

            {sortedOptions.length > visibleCount && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 50)}
                className="text-blue-600 text-sm mt-2 hover:underline"
              >
                Ver mais opções
              </button>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

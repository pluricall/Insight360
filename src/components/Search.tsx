"use client";

import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SearchProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
  ...props
}: SearchProps) {
  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn("pl-10", className)}
        {...props}
      />
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
    </div>
  );
}

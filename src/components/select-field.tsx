"use client"

import * as React from "react"
import {
  Select as SelectPrimitive,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select" 
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SelectFieldProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean; // ✅ adicionada
}

const SelectField = React.forwardRef<HTMLButtonElement, SelectFieldProps>(
  ({ label, error, placeholder, value, onValueChange, children, disabled }, ref) => {
    return (
      <div className="w-full">
        {error && <Label className="text-red-500 text-sm 2xl:text-sm font-bold">{error}</Label>}
        {!error && label && <Label className="text-xs 2xl:text-sm">{label}</Label>}

        <SelectPrimitive value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            ref={ref}
            disabled={disabled} // ✅ habilita o trigger visualmente
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus:ring-0"
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </SelectPrimitive>
      </div>
    );
  }
);

SelectField.displayName = "SelectField";


export { SelectField, SelectItem }

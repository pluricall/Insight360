import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  icon?: React.ReactNode;
  classNameLabel?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, classNameLabel, type, error, label, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {error && <Label className="text-red-500 text-xs 2xl:text-sm text-nowrap">{error}</Label>}
        {!error && label && <Label className={cn("text-xs 2xl:text-sm text-nowrap", classNameLabel)}>{label}</Label>}

        <div className="relative w-full">
          <input
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground placeholder:text-sm placeholder:lg:text-md  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              error && "border-red-500 focus-visible:ring-0",
              icon && "pr-8",
              className
            )}
            ref={ref}
            {...props}
          />
          {icon && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

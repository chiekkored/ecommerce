"use client";

import type { ComponentProps } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TableSearchInputProps = Omit<ComponentProps<typeof Input>, "type">;

export function TableSearchInput({ className, ...props }: TableSearchInputProps) {
  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input type="search" className="pl-8" {...props} />
    </div>
  );
}

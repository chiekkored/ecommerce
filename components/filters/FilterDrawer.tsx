"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (id: string | null) => void;
}

export function FilterDrawer({
  open,
  onOpenChange,
  categories,
  activeCategory,
  onCategoryChange,
}: FilterDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filter by Category</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 pb-8 space-y-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg text-sm font-medium border transition-colors",
              !activeCategory
                ? "bg-foreground text-background border-foreground"
                : "border-border hover:border-foreground"
            )}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg text-sm font-medium border transition-colors",
                activeCategory === cat.id
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:border-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

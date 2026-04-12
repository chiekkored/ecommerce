"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterDrawer } from "./FilterDrawer";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (id: string | null) => void;
}

export function FilterBar({
  categories,
  activeCategory,
  onCategoryChange,
}: FilterBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Desktop: horizontal pill buttons */}
      <div className="hidden sm:flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
            !activeCategory
              ? "bg-foreground text-background border-foreground"
              : "bg-background text-foreground border-border hover:border-foreground"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
              activeCategory === cat.id
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:border-foreground"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Mobile: filter button → drawer */}
      <div className="sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDrawerOpen(true)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {activeCategory && (
            <span className="ml-1 h-2 w-2 rounded-full bg-foreground" />
          )}
        </Button>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={(id) => {
          onCategoryChange(id);
          setDrawerOpen(false);
        }}
      />
    </>
  );
}

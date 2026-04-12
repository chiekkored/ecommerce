"use client";

import { useState } from "react";
import { CatalogGrid } from "./CatalogGrid";
import { FilterBar } from "@/components/filters/FilterBar";
import type { Listing, ListingPhoto, Category } from "@/types";

interface CatalogShellProps {
  listings: (Listing & { listing_photos: ListingPhoto[] })[];
  categories: Category[];
}

export function CatalogShell({ listings, categories }: CatalogShellProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-30 bg-white/90 backdrop-blur-sm border-b py-3">
        <div className="max-w-6xl mx-auto px-4">
          <FilterBar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <CatalogGrid listings={listings} activeCategory={activeCategory} />
      </div>
    </div>
  );
}

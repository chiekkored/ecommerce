"use client";

import { useMemo } from "react";
import { ListingCard } from "./ListingCard";
import type { Listing, ListingPhoto } from "@/types";

interface CatalogGridProps {
  listings: (Listing & { listing_photos: ListingPhoto[] })[];
  activeCategory: string | null;
}

export function CatalogGrid({ listings, activeCategory }: CatalogGridProps) {
  const filtered = useMemo(() => {
    if (!activeCategory) return listings;
    return listings.filter((l) => l.category_id === activeCategory);
  }, [listings, activeCategory]);

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p className="text-lg font-medium">No items found</p>
        <p className="text-sm mt-1">Try a different filter or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {filtered.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

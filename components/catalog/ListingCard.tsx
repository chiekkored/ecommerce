import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Listing, ListingPhoto } from "@/types";

interface ListingCardProps {
  listing: Listing & { 
    listing_photos: ListingPhoto[];
    listing_inventory?: { quantity: number }[];
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const photo = listing.listing_photos[0];
  const totalQuantity = listing.listing_inventory?.reduce((acc, item) => acc + item.quantity, 0) ?? 1; // Default to 1 if no inventory records yet (legacy)
  const isSoldOut = totalQuantity === 0;

  return (
    <Link href={`/item/${listing.slug}`} className="group block relative">
      <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
        {photo ? (
          <Image
            src={photo.image_url}
            alt={photo.alt_text ?? listing.title}
            fill
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-105",
              isSoldOut && "opacity-50 grayscale-[50%]"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        
        {isSoldOut && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="destructive" className="uppercase font-bold text-[10px]">Sold Out</Badge>
          </div>
        )}
      </div>
      <div className="mt-2 space-y-1">
        <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:underline">
          {listing.title}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            ₱{listing.price.toLocaleString()}
          </span>
          {listing.size && !listing.listing_inventory?.length && (
            <Badge variant="secondary" className="text-xs">
              {listing.size}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}

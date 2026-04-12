import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Listing, ListingPhoto } from "@/types";

interface ListingCardProps {
  listing: Listing & { listing_photos: ListingPhoto[] };
}

export function ListingCard({ listing }: ListingCardProps) {
  const photo = listing.listing_photos[0];

  return (
    <Link href={`/item/${listing.slug}`} className="group block">
      <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
        {photo ? (
          <Image
            src={photo.image_url}
            alt={photo.alt_text ?? listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            No image
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
          {listing.size && (
            <Badge variant="secondary" className="text-xs">
              {listing.size}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}

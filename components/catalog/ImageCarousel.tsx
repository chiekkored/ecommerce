"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ListingPhoto } from "@/types";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  photos: ListingPhoto[];
  title: string;
}

export function ImageCarousel({ photos, title }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        No image
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c === 0 ? photos.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === photos.length - 1 ? 0 : c + 1));

  return (
    <div className="space-y-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={photos[current].image_url}
          alt={photos[current].alt_text ?? title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setCurrent(i)}
              className={cn(
                "flex-none w-16 h-16 relative rounded overflow-hidden border-2 transition-colors",
                i === current ? "border-foreground" : "border-transparent"
              )}
            >
              <Image
                src={photo.image_url}
                alt={photo.alt_text ?? `Photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageCarousel } from "@/components/catalog/ImageCarousel";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import type { Listing, ListingPhoto, Category } from "@/types";

type ListingFull = Listing & {
  listing_photos: ListingPhoto[];
  categories: Category | null;
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("title, description")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Item Not Found" };

  return {
    title: `${data.title} — Shop`,
    description: data.description ?? undefined,
  };
}

export default async function ItemPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: listingRaw } = await supabase
    .from("listings")
    .select("*, listing_photos(*), categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  const listing = listingRaw as unknown as ListingFull | null;
  if (!listing) notFound();

  const photos = [...(listing.listing_photos ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ImageCarousel photos={photos} title={listing.title} />

        <div className="space-y-4">
          {listing.categories && (
            <Badge variant="outline">{listing.categories.name}</Badge>
          )}
          <h1 className="text-2xl font-semibold">{listing.title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">
              ₱{listing.price.toLocaleString()}
            </span>
            {listing.size && (
              <Badge variant="secondary">Size: {listing.size}</Badge>
            )}
          </div>
          {listing.description && (
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          )}

          {/* Sticky CTA on mobile */}
          <div className="hidden md:block pt-4">
            <Button asChild size="lg" className="w-full">
              <Link href={`/request/${listing.id}`}>Request to Buy</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <Button asChild size="lg" className="w-full">
          <Link href={`/request/${listing.id}`}>Request to Buy</Link>
        </Button>
      </div>
      {/* Spacer so content isn't hidden behind the sticky button on mobile */}
      <div className="md:hidden h-20" />
    </div>
  );
}

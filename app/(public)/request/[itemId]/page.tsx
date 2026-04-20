import { notFound } from "next/navigation";
import Image from "next/image";
import { RequestForm } from "@/components/catalog/RequestForm";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ itemId: string }>;
}

export default async function RequestPage({ params }: Props) {
  const { itemId } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select(`
      id, 
      title, 
      price, 
      size,
      listing_photos (
        image_url
      )
    `)
    .eq("id", itemId)
    .eq("is_active", true)
    .single();

  if (!listing) notFound();

  const primaryPhoto = listing.listing_photos?.[0]?.image_url;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Request to Buy</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in your details and we&apos;ll get back to you.
        </p>
      </div>

      <div className="mb-6 p-4 rounded-xl border bg-card flex gap-4 items-center">
        {primaryPhoto && (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border">
            <Image
              src={primaryPhoto}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        )}
        <div>
          <p className="font-medium">{listing.title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            ₱{listing.price.toLocaleString()}
            {listing.size ? ` · Size: ${listing.size}` : ""}
          </p>
        </div>
      </div>

      <RequestForm listingId={listing.id} />
    </div>
  );
}

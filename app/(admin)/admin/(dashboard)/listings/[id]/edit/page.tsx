import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/admin/ListingForm";
import type { Listing, ListingPhoto, Category, ListingInventory } from "@/types";

export const metadata = { title: "Edit Listing — Admin" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: listingRaw }, { data: categories }] = await Promise.all([
    supabase
      .from("listings")
      .select("*, listing_photos(*), listing_inventory(*)")
      .eq("id", id)
      .single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  const listing = listingRaw as unknown as (Listing & {
    listing_photos: ListingPhoto[];
    listing_inventory: ListingInventory[];
  }) | null;
  if (!listing) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit Listing</h1>
      <ListingForm listing={listing} categories={(categories ?? []) as Category[]} />
    </div>
  );
}

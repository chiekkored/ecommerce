import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/admin/ListingForm";

export const metadata = { title: "New Listing — Admin" };

export default async function NewListingPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New Listing</h1>
      <ListingForm categories={categories ?? []} />
    </div>
  );
}

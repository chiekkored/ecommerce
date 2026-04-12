import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { Listing, Category } from "@/types";

type ListingRow = Listing & { categories: Pick<Category, "name"> | null };
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import { DeleteListingButton } from "@/components/admin/DeleteListingButton";

export const metadata = { title: "Listings — Admin" };

export default async function AdminListingsPage() {
  const supabase = await createClient();
  const { data: listingsRaw } = await supabase
    .from("listings")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });
  const listings = (listingsRaw ?? []) as unknown as ListingRow[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Listings</h1>
        <Button asChild size="sm">
          <Link href="/admin/listings/new">
            <Plus className="h-4 w-4 mr-1" /> New Listing
          </Link>
        </Button>
      </div>

      {!listings?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No listings yet.{" "}
          <Link href="/admin/listings/new" className="underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">{listing.title}</TableCell>
                  <TableCell>₱{listing.price.toLocaleString()}</TableCell>
                  <TableCell>
                    {listing.categories?.name ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={listing.is_active ? "default" : "secondary"}>
                      {listing.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/listings/${listing.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteListingButton id={listing.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

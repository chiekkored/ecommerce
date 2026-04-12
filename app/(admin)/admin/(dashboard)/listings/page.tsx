"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { DeleteListingButton } from "@/components/admin/DeleteListingButton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ListingForm } from "@/components/admin/ListingForm";
import type { Listing, Category } from "@/types";

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: listingsData } = await supabase
      .from("listings")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    const { data: categoriesData } = await supabase.from("categories").select("*");
    setListings((listingsData as any) ?? []);
    setCategories(categoriesData ?? []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Listings</h1>
        <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if(!open) setEditingListing(null); }}>
          <SheetTrigger asChild>
            <Button size="sm" onClick={() => setEditingListing(null)}>
              <Plus className="h-4 w-4 mr-1" /> New Listing
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader className="px-6 pt-6">
              <SheetTitle>{editingListing ? "Edit Listing" : "New Listing"}</SheetTitle>
            </SheetHeader>
            <div className="p-6">
              <ListingForm 
                categories={categories} 
                listing={editingListing ?? undefined} 
                onSuccess={() => { setIsSheetOpen(false); fetchData(); }} 
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {!listings?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No listings yet.
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
              {listings.map((listing: any) => (
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setEditingListing(listing); setIsSheetOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
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

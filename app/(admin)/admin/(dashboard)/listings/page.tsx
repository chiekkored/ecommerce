"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { Plus, Pencil } from "lucide-react";
import { DeleteListingButton } from "@/components/admin/DeleteListingButton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { ListingForm } from "@/components/admin/ListingForm";
import { ImageCarousel } from "@/components/catalog/ImageCarousel";
import { TableSearchInput } from "@/components/admin/TableSearchInput";
import { ADMIN_TABLE_PAGE_SIZE, type AdminTableQuery, type AdminTableResult } from "@/lib/admin-table";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { Listing, Category, ListingPhoto, ListingInventory } from "@/types";

const FORM_ID = "listing-form";

type ListingWithCategory = Listing & {
  categories: Pick<Category, "name"> | null;
  listing_photos: ListingPhoto[];
  listing_inventory: ListingInventory[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

async function getListingsPageData({
  search,
  page,
  pageSize,
}: AdminTableQuery): Promise<AdminTableResult<ListingWithCategory> & { categories: Category[] }> {
  const supabase = createClient();

  let listingsQuery = supabase
    .from("listings")
    .select("*, categories(name), listing_photos(*), listing_inventory(*)", { count: "exact" })
    .order("created_at", { ascending: false });

  const normalizedSearch = search.trim();
  if (normalizedSearch) {
    listingsQuery = listingsQuery.ilike("title", `%${normalizedSearch}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: listingsData, count } = await listingsQuery.range(from, to);
  const { data: categoriesData } = await supabase.from("categories").select("*").order("name");

  return {
    rows: ((listingsData ?? []) as ListingWithCategory[]),
    total: count ?? 0,
    categories: categoriesData ?? [],
  };
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<ListingWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingListing, setEditingListing] = useState<ListingWithCategory | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNewListingCreated, setIsNewListingCreated] = useState(false);
  const [isListingSubmitting, setIsListingSubmitting] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingWithCategory | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [, setTotal] = useState(0);
  const [hasListings, setHasListings] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const { rows, total, categories } = await getListingsPageData({
      search: debouncedSearch,
      page,
      pageSize: ADMIN_TABLE_PAGE_SIZE,
    });
    setListings(rows);
    setCategories(categories);
    setTotal(total);
    if (!debouncedSearch.trim()) {
      setHasListings(total > 0);
    }
    setIsLoading(false);
  }, [debouncedSearch, page]);

  useEffect(() => {
    let isCurrent = true;

    const loadData = async () => {
      const { rows, total, categories } = await getListingsPageData({
        search: debouncedSearch,
        page,
        pageSize: ADMIN_TABLE_PAGE_SIZE,
      });

      if (!isCurrent) return;

      setListings(rows);
      setCategories(categories);
      setTotal(total);
      if (!debouncedSearch.trim()) {
        setHasListings(total > 0);
      }
      setIsLoading(false);
    };

    loadData();

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearch, page]);

  const hasSearch = Boolean(debouncedSearch.trim());
  const selectedListingPhotos = selectedListing
    ? [...(selectedListing.listing_photos ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    : [];

  const openListingDetails = (listing: ListingWithCategory) => {
    setSelectedListing(listing);
    setIsDetailsSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Listings</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <TableSearchInput
            value={search}
            onChange={(event) => {
              setIsLoading(true);
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search listings..."
            aria-label="Search listings"
          />
          <Sheet
            open={isSheetOpen}
            onOpenChange={(open) => {
              if (!open && isListingSubmitting) return;
              setIsSheetOpen(open);
              if (!open) {
                setEditingListing(null);
                setIsNewListingCreated(false);
                setIsListingSubmitting(false);
              }
            }}
          >
            <SheetTrigger asChild>
              <ButtonWithIcon
                icon={Plus}
                onClick={() => {
                  setEditingListing(null);
                  setIsNewListingCreated(false);
                  setIsListingSubmitting(false);
                }}
              >
                New Listing
              </ButtonWithIcon>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
              <SheetHeader className="px-6 pt-6">
                <SheetTitle>{editingListing ? "Edit Listing" : "New Listing"}</SheetTitle>
              </SheetHeader>
              <div className="p-6">
                <ListingForm 
                  categories={categories} 
                  listing={editingListing ?? undefined} 
                  onCreated={() => setIsNewListingCreated(true)}
                  onSubmittingChange={setIsListingSubmitting}
                  onSuccess={() => {
                    setIsSheetOpen(false);
                    fetchData();
                  }}
                  formId={FORM_ID}
                />
              </div>
              <SheetFooter className="px-6 pb-6">
                <SheetClose asChild>
                  <Button variant="outline" disabled={isListingSubmitting}>Cancel</Button>
                </SheetClose>
                <Button type="submit" form={FORM_ID} disabled={isListingSubmitting}>
                  {isListingSubmitting
                    ? editingListing || isNewListingCreated
                      ? "Saving..."
                      : "Creating..."
                    : editingListing || isNewListingCreated
                      ? "Save Changes"
                      : "Create Listing"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {isLoading ? (
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
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !listings?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          {hasSearch && hasListings ? "No listings match your search." : "No listings yet."}
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
                <TableRow
                  key={listing.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => openListingDetails(listing)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openListingDetails(listing);
                    }
                  }}
                >
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
                    <div
                      className="flex items-center gap-1"
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
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

      <Sheet
        open={isDetailsSheetOpen}
        onOpenChange={(open) => {
          setIsDetailsSheetOpen(open);
          if (!open) setSelectedListing(null);
        }}
      >
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{selectedListing?.title ?? "Listing Details"}</SheetTitle>
          </SheetHeader>
          {selectedListing && (
            <div className="space-y-6 px-6 pb-6">
              <ImageCarousel photos={selectedListingPhotos} title={selectedListing.title} />

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={selectedListing.is_active ? "default" : "secondary"}>
                    {selectedListing.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {selectedListing.categories?.name && (
                    <Badge variant="outline">{selectedListing.categories.name}</Badge>
                  )}
                </div>

                <DetailItem label="Inventory">
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {selectedListing.listing_inventory?.length > 0 ? (
                      selectedListing.listing_inventory.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded border bg-muted/30">
                          <span className="font-medium">{item.size}</span>
                          <span className={item.quantity === 0 ? "text-destructive font-bold" : ""}>
                            {item.quantity} in stock
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic col-span-2">No sizes/quantities set.</span>
                    )}
                  </div>
                </DetailItem>

                <DetailItem label="Price">₱{selectedListing.price.toLocaleString()}</DetailItem>
                <DetailItem label="Slug">{selectedListing.slug}</DetailItem>
                <DetailItem label="Description">
                  {selectedListing.description ? (
                    <p className="whitespace-pre-line leading-relaxed">{selectedListing.description}</p>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </DetailItem>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Created">{formatDate(selectedListing.created_at)}</DetailItem>
                  <DetailItem label="Updated">{formatDate(selectedListing.updated_at)}</DetailItem>
                </div>
                <DetailItem label="Listing ID">
                  <span className="font-mono text-xs">{selectedListing.id}</span>
                </DetailItem>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

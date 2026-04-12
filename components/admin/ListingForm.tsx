"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listingSchema, type ListingFormValues } from "@/lib/validators/listing";
import { PhotoUploader } from "./PhotoUploader";
import type { Category, Listing, ListingPhoto } from "@/types";

interface ListingFormProps {
  categories: Category[];
  listing?: Listing & { listing_photos: ListingPhoto[] };
}

export function ListingForm({ categories, listing }: ListingFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<ListingPhoto[]>(
    listing?.listing_photos ?? []
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema) as Resolver<ListingFormValues>,
    defaultValues: listing
      ? {
          title: listing.title,
          slug: listing.slug,
          price: listing.price,
          size: listing.size ?? "",
          description: listing.description ?? "",
          category_id: listing.category_id ?? "",
          is_active: listing.is_active,
        }
      : { is_active: true, price: 0 },
  });

  const autoSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const onSubmit = async (values: ListingFormValues) => {
    setError(null);
    const url = listing
      ? `/api/listings/${listing.id}`
      : "/api/listings";
    const method = listing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save listing.");
      return;
    }

    router.push("/admin/listings");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register("title")}
          onChange={(e) => {
            register("title").onChange(e);
            if (!listing) setValue("slug", autoSlug(e.target.value));
          }}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug *</Label>
        <Input id="slug" {...register("slug")} />
        {errors.slug && (
          <p className="text-xs text-destructive">{errors.slug.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (₱) *</Label>
          <Input id="price" type="number" step="0.01" min="0" {...register("price")} />
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="size">Size</Label>
          <Input id="size" {...register("size")} placeholder="S / M / L / XL" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category_id">Category</Label>
        <Select
          defaultValue={listing?.category_id ?? ""}
          onValueChange={(val) => setValue("category_id", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} rows={4} />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_active"
          type="checkbox"
          {...register("is_active")}
          className="h-4 w-4"
        />
        <Label htmlFor="is_active">Active (visible to buyers)</Label>
      </div>

      {listing && (
        <div className="space-y-1.5">
          <Label>Photos</Label>
          <PhotoUploader listingId={listing.id} photos={photos} onPhotosChange={setPhotos} />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : listing ? "Save Changes" : "Create Listing"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  size: z.string().max(50).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  category_id: z.string().uuid().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type ListingFormValues = z.infer<typeof listingSchema>;

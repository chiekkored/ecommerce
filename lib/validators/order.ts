import { z } from "zod";

export const orderRequestSchema = z
  .object({
    buyer_name: z.string().min(1, "Name is required").max(200),
    buyer_email: z.string().email("Invalid email").optional().or(z.literal("")),
    buyer_phone: z.string().max(30).optional().or(z.literal("")),
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(999),
    message: z.string().max(1000).optional().or(z.literal("")),
  })
  .refine(
    (data) => !!(data.buyer_email || data.buyer_phone),
    {
      message: "Please provide either an email or phone number",
      path: ["buyer_email"],
    }
  );

export type OrderRequestFormValues = z.infer<typeof orderRequestSchema>;

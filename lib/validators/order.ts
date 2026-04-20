import { z } from "zod";

export const orderRequestSchema = z
  .object({
    buyer_name: z.string().min(1, "Name is required").max(200),
    buyer_email: z.string().email("Invalid email").optional().or(z.literal("")),
    buyer_phone: z.string().min(1, "Phone number is required").max(30),
    buyer_messenger: z.string().max(200).optional().or(z.literal("")),
    buyer_instagram: z.string().max(200).optional().or(z.literal("")),
    contact_method: z.enum(["email", "messenger", "instagram"]).default("email"),
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(999),
    message: z.string().max(1000).optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.contact_method === "email") return !!data.buyer_email;
      if (data.contact_method === "messenger") return !!data.buyer_messenger;
      if (data.contact_method === "instagram") return !!data.buyer_instagram;
      return false;
    },
    {
      message: "Please provide the selected contact method detail",
      path: ["contact_method"],
    }
  );

export type OrderRequestFormValues = z.infer<typeof orderRequestSchema>;

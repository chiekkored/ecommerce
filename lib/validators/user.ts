import { z } from "zod";

export const userCreateSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["superadmin", "admin", "staff"]),
});

export const userUpdateSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.enum(["superadmin", "admin", "staff"]).optional(),
});

export type UserCreateValues = z.infer<typeof userCreateSchema>;
export type UserUpdateValues = z.infer<typeof userUpdateSchema>;

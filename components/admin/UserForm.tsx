/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { userCreateSchema, userUpdateSchema } from "@/lib/validators/user";
import type { Profile } from "@/types";

interface UserFormProps {
  user?: Profile;
  onSuccess?: () => void;
  formId?: string;
  canChangePassword?: boolean;
}

export function UserForm({ user, onSuccess, formId, canChangePassword = false }: UserFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(user ? userUpdateSchema : userCreateSchema) as Resolver<any>,
    defaultValues: user
      ? {
          fullName: user.full_name ?? "",
          role: user.role ?? "staff",
          password: "",
        }
      : {
          role: "staff",
        },
  });

  const onSubmit = async (values: any) => {
    setError(null);
    const url = user ? `/api/users/${user.id}` : "/api/users";
    const method = user ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save user.");
      }

      onSuccess?.();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      {!user && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password *</Label>
            <PasswordInput id="password" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message as string}</p>}
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input id="fullName" {...register("fullName")} />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message as string}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">Role *</Label>
        <Select defaultValue={user?.role ?? "staff"} onValueChange={(val) => setValue("role", val)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="superadmin">Superadmin</SelectItem> */}
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-xs text-destructive">{errors.role.message as string}</p>}
      </div>

      {user && canChangePassword && (
        <div className="space-y-1.5">
          <Label htmlFor="password">New Password</Label>
          <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message as string}</p>}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}

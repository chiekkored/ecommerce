"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categorySchema, type CategoryFormValues } from "@/lib/validators/category";
import type { Category } from "@/types";

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
  formId?: string;
}

export function CategoryForm({ category, onSuccess, formId }: CategoryFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as Resolver<CategoryFormValues>,
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
        }
      : {
          name: "",
          slug: "",
        },
  });

  const autoSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const onSubmit = async (values: CategoryFormValues) => {
    setError(null);
    const url = category ? `/api/categories/${category.id}` : "/api/categories";
    const method = category ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save category.");
      return;
    }

    onSuccess?.();
    router.refresh();
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          {...register("name")}
          onChange={(event) => {
            register("name").onChange(event);
            if (!category) setValue("slug", autoSlug(event.target.value));
          }}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug *</Label>
        <Input id="slug" {...register("slug")} />
        {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}

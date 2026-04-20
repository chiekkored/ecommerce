"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";
import type { Category } from "@/types";

const FORM_ID = "category-form";

async function getCategories() {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");

  if (error) throw new Error(error.message);

  return data ?? [];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rows = await getCategories();
      setCategories(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await getCategories();
        if (!isCurrent) return;
        setCategories(rows);
      } catch (err) {
        if (!isCurrent) return;
        setError(err instanceof Error ? err.message : "Failed to load categories.");
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadCategories();

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Sheet
          open={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) setEditingCategory(null);
          }}
        >
          <SheetTrigger asChild>
            <ButtonWithIcon icon={Plus} onClick={() => setEditingCategory(null)}>
              Add Category
            </ButtonWithIcon>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader className="px-6 pt-6">
              <SheetTitle>{editingCategory ? "Edit Category" : "Add Category"}</SheetTitle>
            </SheetHeader>
            <div className="p-6">
              <CategoryForm
                category={editingCategory ?? undefined}
                onSuccess={() => {
                  setIsSheetOpen(false);
                  fetchCategories();
                }}
                formId={FORM_ID}
              />
            </div>
            <SheetFooter className="px-6 pb-6">
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" form={FORM_ID}>
                {editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !categories.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">No categories yet.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(category.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCategory(category);
                          setIsSheetOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteCategoryButton
                        categoryId={category.id}
                        categoryName={category.name}
                        onDeleted={fetchCategories}
                      />
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

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminDataTable, resolveUpdater, type AdminDataTableColumn } from "@/components/admin/AdminDataTable";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";
import { ADMIN_TABLE_PAGE_SIZE, type AdminTableQuery, type AdminTableResult } from "@/lib/admin-table";
import type { Category } from "@/types";

const FORM_ID = "category-form";
const SORTABLE_COLUMNS = new Set(["name", "slug", "created_at"]);

async function getCategories({
  page,
  pageSize,
  sortBy,
  sortDirection,
}: Pick<AdminTableQuery, "page" | "pageSize" | "sortBy" | "sortDirection">): Promise<AdminTableResult<Category>> {
  const supabase = createClient();
  const sortColumn = sortBy && SORTABLE_COLUMNS.has(sortBy) ? sortBy : "name";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await supabase
    .from("categories")
    .select("*", { count: "exact" })
    .order(sortColumn, { ascending: sortDirection !== "desc" })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: data ?? [],
    total: count ?? 0,
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [error, setError] = useState<string | null>(null);
  const pageSize = ADMIN_TABLE_PAGE_SIZE;
  const pagination: PaginationState = { pageIndex: page - 1, pageSize };
  const pageCount = Math.ceil(total / pageSize);
  const activeSort = sorting[0];

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { rows, total } = await getCategories({
        page,
        pageSize,
        sortBy: activeSort?.id,
        sortDirection: activeSort?.desc ? "desc" : "asc",
      });
      setCategories(rows);
      setTotal(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, [activeSort?.desc, activeSort?.id, page, pageSize]);

  useEffect(() => {
    let isCurrent = true;

    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { rows, total } = await getCategories({
          page,
          pageSize,
          sortBy: activeSort?.id,
          sortDirection: activeSort?.desc ? "desc" : "asc",
        });
        if (!isCurrent) return;
        setCategories(rows);
        setTotal(total);
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
  }, [activeSort?.desc, activeSort?.id, page, pageSize]);

  const columns = useMemo<AdminDataTableColumn<Category>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
        meta: { skeleton: <Skeleton className="h-5 w-40" /> },
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "slug",
        header: "Slug",
        enableSorting: true,
        meta: { skeleton: <Skeleton className="h-5 w-32" /> },
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span>,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        enableSorting: true,
        meta: { skeleton: <Skeleton className="h-5 w-24" /> },
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString()}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        meta: {
          headerClassName: "w-24 text-right",
          cellClassName: "text-right",
          skeleton: (
            <div className="flex justify-end gap-1">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ),
        },
        cell: ({ row }) => {
          const category = row.original;
          return (
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
              <DeleteCategoryButton categoryId={category.id} categoryName={category.name} onDeleted={fetchCategories} />
            </div>
          );
        },
      },
    ],
    [fetchCategories],
  );

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

      <AdminDataTable
        columns={columns}
        data={categories}
        getRowId={(category) => category.id}
        isLoading={isLoading}
        emptyMessage="No categories yet."
        pagination={pagination}
        pageCount={pageCount}
        total={total}
        sorting={sorting}
        onSortingChange={(updater) => {
          setSorting((current) => resolveUpdater(updater, current).slice(0, 1));
          setPage(1);
        }}
        onPaginationChange={(updater) => {
          const nextPagination = resolveUpdater(updater, pagination);
          setPage(nextPagination.pageIndex + 1);
        }}
      />
    </div>
  );
}

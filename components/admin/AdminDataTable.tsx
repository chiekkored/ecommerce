"use client";

import type { ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type AdminColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
  skeleton?: ReactNode;
};

export type AdminDataTableColumn<TData> = ColumnDef<TData> & {
  meta?: AdminColumnMeta;
};

type AdminDataTableProps<TData> = {
  columns: AdminDataTableColumn<TData>[];
  data: TData[];
  getRowId: (row: TData) => string;
  isLoading: boolean;
  emptyMessage: string;
  pagination: PaginationState;
  pageCount: number;
  total: number;
  sorting: SortingState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onSortingChange: OnChangeFn<SortingState>;
  loadingRowCount?: number;
  onRowClick?: (row: TData) => void;
  rowClassName?: (row: TData) => string | undefined;
};

function resolveUpdater<T>(updaterOrValue: T | ((old: T) => T), old: T) {
  return typeof updaterOrValue === "function" ? (updaterOrValue as (old: T) => T)(old) : updaterOrValue;
}

function getSortIcon(direction: false | "asc" | "desc") {
  if (direction === "asc") return <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />;
  if (direction === "desc") return <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />;
  return <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />;
}

export function AdminDataTable<TData>({
  columns,
  data,
  getRowId,
  isLoading,
  emptyMessage,
  pagination,
  pageCount,
  total,
  sorting,
  onPaginationChange,
  onSortingChange,
  loadingRowCount = 5,
  onRowClick,
  rowClassName,
}: AdminDataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange,
    onSortingChange,
  });

  const currentPage = pagination.pageIndex + 1;
  const canPreviousPage = pagination.pageIndex > 0;
  const canNextPage = pagination.pageIndex + 1 < pageCount;
  const visibleColumns = table.getVisibleLeafColumns();
  const colSpan = Math.max(visibleColumns.length, 1);
  const start = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const end = Math.min(total, (pagination.pageIndex + 1) * pagination.pageSize);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as AdminColumnMeta | undefined;
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <TableHead key={header.id} className={meta?.headerClassName}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {getSortIcon(sortDirection)}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: loadingRowCount }).map((_, index) => (
                <TableRow key={index}>
                  {visibleColumns.map((column) => {
                    const meta = column.columnDef.meta as AdminColumnMeta | undefined;
                    return (
                      <TableCell key={column.id} className={meta?.cellClassName}>
                        {meta?.skeleton ?? <Skeleton className="h-5 w-24" />}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const original = row.original;
                const clickable = Boolean(onRowClick);

                return (
                  <TableRow
                    key={row.id}
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    className={cn(
                      clickable &&
                        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      rowClassName?.(original),
                    )}
                    onClick={clickable ? () => onRowClick?.(original) : undefined}
                    onKeyDown={
                      clickable
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onRowClick?.(original);
                            }
                          }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as AdminColumnMeta | undefined;
                      return (
                        <TableCell key={cell.id} className={meta?.cellClassName}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {total ? `${start}-${end} of ${total}` : "0 results"}
        </p>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <span>
            Page {pageCount ? currentPage : 0} of {pageCount}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => onPaginationChange((old) => ({ ...old, pageIndex: Math.max(old.pageIndex - 1, 0) }))}
              disabled={!canPreviousPage || isLoading}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() =>
                onPaginationChange((old) => ({ ...old, pageIndex: Math.min(old.pageIndex + 1, pageCount - 1) }))
              }
              disabled={!canNextPage || isLoading}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { resolveUpdater };

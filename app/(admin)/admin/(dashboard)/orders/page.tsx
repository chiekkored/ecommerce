"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UpdateOrderStatusModal } from "@/components/admin/UpdateOrderStatusModal";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSearchInput } from "@/components/admin/TableSearchInput";
import { ADMIN_TABLE_PAGE_SIZE, type AdminTableQuery, type AdminTableResult } from "@/lib/admin-table";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { OrderStatus, OrderRequest, Listing } from "@/types";

type OrderRow = OrderRequest & {
  listings: Pick<Listing, "title"> | null;
};

const getStatusVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "new":
      return "secondary";
    case "contacted":
      return "default";
    case "pending_payment":
      return "outline";
    case "closed":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "default";
  }
};

async function getOrdersPageData({
  search,
  page,
  pageSize,
}: AdminTableQuery): Promise<AdminTableResult<OrderRow>> {
  const supabase = createClient();
  const normalizedSearch = search.trim();
  let matchingListingIds: string[] = [];

  if (normalizedSearch) {
    const { data: matchingListings } = await supabase
      .from("listings")
      .select("id")
      .ilike("title", `%${normalizedSearch}%`);
    matchingListingIds = matchingListings?.map((listing) => listing.id) ?? [];
  }

  let ordersQuery = supabase
    .from("order_requests")
    .select("*, listings(title)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (normalizedSearch) {
    if (matchingListingIds.length) {
      ordersQuery = ordersQuery.or(
        `request_code.ilike.%${normalizedSearch}%,listing_id.in.(${matchingListingIds.join(",")})`
      );
    } else {
      ordersQuery = ordersQuery.ilike("request_code", `%${normalizedSearch}%`);
    }
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: ordersRaw, count } = await ordersQuery.range(from, to);

  return {
    rows: (ordersRaw ?? []) as unknown as OrderRow[],
    total: count ?? 0,
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [, setTotal] = useState(0);
  const [hasOrders, setHasOrders] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    const { rows, total } = await getOrdersPageData({
      search: debouncedSearch,
      page,
      pageSize: ADMIN_TABLE_PAGE_SIZE,
    });
    setOrders(rows);
    setTotal(total);
    if (!debouncedSearch.trim()) {
      setHasOrders(total > 0);
    }
    setIsLoading(false);
  }, [debouncedSearch, page]);

  useEffect(() => {
    let isCurrent = true;

    const loadOrders = async () => {
      const { rows, total } = await getOrdersPageData({
        search: debouncedSearch,
        page,
        pageSize: ADMIN_TABLE_PAGE_SIZE,
      });

      if (!isCurrent) return;

      setOrders(rows);
      setTotal(total);
      if (!debouncedSearch.trim()) {
        setHasOrders(total > 0);
      }
      setIsLoading(false);
    };

    loadOrders();

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearch, page]);

  const hasSearch = Boolean(debouncedSearch.trim());

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <TableSearchInput
          value={search}
          onChange={(event) => {
            setIsLoading(true);
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search code or item..."
          aria-label="Search orders"
        />
      </div>
      
      {isLoading ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !orders?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          {hasSearch && hasOrders ? "No orders match your search." : "No orders yet."}
        </p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.request_code}</TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {order.listings?.title ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{order.buyer_name}</p>
                      <p className="text-muted-foreground text-xs">
                        {order.buyer_email ?? order.buyer_phone ?? "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status as OrderStatus)}>
                      {order.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <UpdateOrderStatusModal
                      orderId={order.id}
                      requestCode={order.request_code}
                      itemName={order.listings?.title ?? "Unknown Item"}
                      currentStatus={order.status as OrderStatus}
                      onSuccess={fetchOrders}
                    />
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

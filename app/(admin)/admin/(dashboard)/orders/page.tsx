"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UpdateOrderStatusModal } from "@/components/admin/UpdateOrderStatusModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TableSearchInput } from "@/components/admin/TableSearchInput";
import { ADMIN_TABLE_PAGE_SIZE, type AdminTableQuery, type AdminTableResult } from "@/lib/admin-table";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { OrderStatus, OrderRequest, Listing } from "@/types";

type OrderRow = OrderRequest & {
  listings: Pick<Listing, "id" | "title" | "slug" | "price" | "size"> | null;
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

const statusLabels: Record<OrderStatus, string> = {
  new: "New",
  contacted: "Contacted",
  pending_payment: "Pending Payment",
  closed: "Closed",
  cancelled: "Cancelled",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function DetailLink({ href, children, external = true }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="font-medium text-primary underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}

function normalizePhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function normalizeMessengerHref(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(m\.me|messenger\.com|facebook\.com)\//i.test(trimmed)) return `https://${trimmed}`;
  if (!trimmed.includes(" ")) return `https://m.me/${trimmed.replace(/^@/, "")}`;
  return `https://www.facebook.com/search/top?q=${encodeURIComponent(trimmed)}`;
}

function normalizeInstagramHref(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.instagram.com/${trimmed.replace(/^@/, "")}`;
}

async function getOrdersPageData({ search, page, pageSize }: AdminTableQuery): Promise<AdminTableResult<OrderRow>> {
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
    .select("*, listings(id, title, slug, price, size)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (normalizedSearch) {
    if (matchingListingIds.length) {
      ordersQuery = ordersQuery.or(
        `request_code.ilike.%${normalizedSearch}%,listing_id.in.(${matchingListingIds.join(",")})`,
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
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
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

  const openOrderDetails = (order: OrderRow) => {
    setSelectedOrder(order);
    setIsDetailsSheetOpen(true);
  };

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
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
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
                <TableRow
                  key={order.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => openOrderDetails(order)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openOrderDetails(order);
                    }
                  }}
                >
                  <TableCell className="font-mono text-xs">{order.request_code}</TableCell>
                  <TableCell className="max-w-[180px]">
                    <div className="space-y-0.5">
                      <p className="font-medium truncate">{order.listings?.title ?? <span className="text-muted-foreground">—</span>}</p>
                      {order.size && (
                        <Badge variant="secondary" className="text-[10px] h-4">Size: {order.size}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{order.buyer_name}</p>
                      <p className="text-muted-foreground text-xs">{order.buyer_phone}</p>
                      <div className="flex flex-col gap-0.5 mt-1">
                        {order.buyer_email && (
                          <p className="text-[10px] bg-muted w-fit px-1 rounded text-muted-foreground">
                            E: {order.buyer_email}
                          </p>
                        )}
                        {order.buyer_messenger && (
                          <p className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 w-fit px-1 rounded">
                            M: {order.buyer_messenger}
                          </p>
                        )}
                        {order.buyer_instagram && (
                          <p className="text-[10px] bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 w-fit px-1 rounded">
                            IG: {order.buyer_instagram}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status as OrderStatus)}>
                      {statusLabels[order.status as OrderStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                    <div onKeyDown={(event) => event.stopPropagation()}>
                      <UpdateOrderStatusModal
                        orderId={order.id}
                        requestCode={order.request_code}
                        itemName={order.listings?.title ?? "Unknown Item"}
                        currentStatus={order.status as OrderStatus}
                        onSuccess={fetchOrders}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet
        open={isDetailsSheetOpen}
        onOpenChange={(open) => {
          setIsDetailsSheetOpen(open);
          if (!open) setSelectedOrder(null);
        }}
      >
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{selectedOrder ? `Order ${selectedOrder.request_code}` : "Order Details"}</SheetTitle>
          </SheetHeader>
          {selectedOrder && (
            <div className="space-y-6 px-6 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <UpdateOrderStatusModal
                  orderId={selectedOrder.id}
                  requestCode={selectedOrder.request_code}
                  itemName={selectedOrder.listings?.title ?? "Unknown Item"}
                  currentStatus={selectedOrder.status as OrderStatus}
                  onSuccess={() => {
                    setIsDetailsSheetOpen(false);
                    fetchOrders();
                  }}
                />
                <Badge variant={getStatusVariant(selectedOrder.status as OrderStatus)}>
                  {statusLabels[selectedOrder.status as OrderStatus]}
                </Badge>
                {selectedOrder.size && <Badge variant="secondary">Size {selectedOrder.size}</Badge>}
                <Badge variant="outline">Qty {selectedOrder.quantity}</Badge>
              </div>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailItem label="Name">
                    {selectedOrder.listings?.title ?? <span className="text-muted-foreground">—</span>}
                  </DetailItem>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailItem label="Price">
                      {selectedOrder.listings?.price != null
                        ? `₱${selectedOrder.listings.price.toLocaleString()}`
                        : "—"}
                    </DetailItem>
                    <DetailItem label="Slug">{selectedOrder.listings?.slug ?? "—"}</DetailItem>
                  </div>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>Buyer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailItem label="Name">{selectedOrder.buyer_name}</DetailItem>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailItem label="Phone">
                      {selectedOrder.buyer_phone ? (
                        <DetailLink href={normalizePhoneHref(selectedOrder.buyer_phone)} external={false}>
                          {selectedOrder.buyer_phone}
                        </DetailLink>
                      ) : (
                        "—"
                      )}
                    </DetailItem>
                    <DetailItem label="Email">
                      {selectedOrder.buyer_email ? (
                        <DetailLink href={`mailto:${selectedOrder.buyer_email}`} external={false}>
                          {selectedOrder.buyer_email}
                        </DetailLink>
                      ) : (
                        "—"
                      )}
                    </DetailItem>
                    <DetailItem label="Messenger">
                      {selectedOrder.buyer_messenger ? (
                        <DetailLink href={normalizeMessengerHref(selectedOrder.buyer_messenger)}>
                          {selectedOrder.buyer_messenger}
                        </DetailLink>
                      ) : (
                        "—"
                      )}
                    </DetailItem>
                    <DetailItem label="Instagram">
                      {selectedOrder.buyer_instagram ? (
                        <DetailLink href={normalizeInstagramHref(selectedOrder.buyer_instagram)}>
                          {selectedOrder.buyer_instagram}
                        </DetailLink>
                      ) : (
                        "—"
                      )}
                    </DetailItem>
                  </div>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailItem label="Size">{selectedOrder.size ?? "—"}</DetailItem>
                    <DetailItem label="Quantity">{selectedOrder.quantity}</DetailItem>
                  </div>
                  <DetailItem label="Message">
                    {selectedOrder.message ? (
                      <p className="whitespace-pre-line leading-relaxed">{selectedOrder.message}</p>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </DetailItem>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailItem label="Created">{formatDate(selectedOrder.created_at)}</DetailItem>
                    <DetailItem label="Updated">{formatDate(selectedOrder.updated_at)}</DetailItem>
                  </div>
                  <DetailItem label="Order ID">
                    <span className="font-mono text-xs">{selectedOrder.id}</span>
                  </DetailItem>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

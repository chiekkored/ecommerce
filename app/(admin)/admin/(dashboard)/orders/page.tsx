import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import type { OrderStatus, OrderRequest, Listing } from "@/types";

type OrderRow = OrderRequest & {
  listings: Pick<Listing, "title"> | null;
};

export const metadata = { title: "Orders — Admin" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: ordersRaw } = await supabase
    .from("order_requests")
    .select("*, listings(title)")
    .order("created_at", { ascending: false });
  const orders = (ordersRaw ?? []) as unknown as OrderRow[];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>
      {!orders?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No orders yet.
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
                    <OrderStatusSelect
                      orderId={order.id}
                      currentStatus={order.status as OrderStatus}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
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

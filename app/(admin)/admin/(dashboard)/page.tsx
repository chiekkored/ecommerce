import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, AlertCircle } from "lucide-react";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalListings },
    { count: newOrders },
    { count: pendingOrders },
  ] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase
      .from("order_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("order_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_payment"),
  ]);

  const stats = [
    {
      label: "Total Listings",
      value: totalListings ?? 0,
      icon: Package,
    },
    {
      label: "New Orders",
      value: newOrders ?? 0,
      icon: ShoppingCart,
    },
    {
      label: "Pending Payment",
      value: pendingOrders ?? 0,
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

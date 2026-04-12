"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/types";

const statuses: { value: OrderStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "pending_payment", label: "Pending Payment" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);

  const handleChange = async (val: string) => {
    const newStatus = val as OrderStatus;
    setStatus(newStatus);
    const supabase = createClient();
    await supabase
      .from("order_requests")
      .update({ status: newStatus })
      .eq("id", orderId);
  };

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="h-8 text-xs w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map(({ value, label }) => (
          <SelectItem key={value} value={value} className="text-xs">
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";
import {
  orderRequestSchema,
  type OrderRequestFormValues,
} from "@/lib/validators/order";

interface RequestFormProps {
  listingId: string;
}

export function RequestForm({ listingId }: RequestFormProps) {
  const [requestCode, setRequestCode] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderRequestFormValues>({
    resolver: zodResolver(orderRequestSchema) as Resolver<OrderRequestFormValues>,
    defaultValues: { quantity: 1 },
  });

  const onSubmit = async (values: OrderRequestFormValues) => {
    setServerError(null);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, listing_id: listingId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setServerError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    setRequestCode(data.request_code);
  };

  if (requestCode) {
    return (
      <div className="text-center space-y-4 py-8">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="text-lg font-semibold">Request Submitted!</h2>
        <p className="text-muted-foreground text-sm">
          Your request has been received. We&apos;ll contact you soon.
        </p>
        <div className="inline-block px-6 py-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Your Request ID</p>
          <p className="text-xl font-mono font-bold tracking-wider">
            {requestCode}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Save this ID for reference when we contact you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="buyer_name">Full Name *</Label>
        <Input id="buyer_name" {...register("buyer_name")} placeholder="Juan dela Cruz" />
        {errors.buyer_name && (
          <p className="text-xs text-destructive">{errors.buyer_name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="buyer_email">Email</Label>
        <Input
          id="buyer_email"
          type="email"
          {...register("buyer_email")}
          placeholder="juan@example.com"
        />
        {errors.buyer_email && (
          <p className="text-xs text-destructive">{errors.buyer_email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="buyer_phone">Phone</Label>
        <Input
          id="buyer_phone"
          type="tel"
          {...register("buyer_phone")}
          placeholder="+63 912 345 6789"
        />
        {errors.buyer_phone && (
          <p className="text-xs text-destructive">{errors.buyer_phone.message}</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground -mt-2">
        Provide at least one contact method (email or phone).
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="quantity">Quantity *</Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          {...register("quantity")}
        />
        {errors.quantity && (
          <p className="text-xs text-destructive">{errors.quantity.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Note (optional)</Label>
        <Textarea
          id="message"
          {...register("message")}
          placeholder="Any special requests or questions?"
          rows={3}
        />
      </div>

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}

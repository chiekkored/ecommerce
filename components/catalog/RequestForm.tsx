"use client";

import { useState, type SVGProps } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle } from "lucide-react";
import {
  orderRequestSchema,
  type OrderRequestFormValues,
} from "@/lib/validators/order";

type ContactMethod = OrderRequestFormValues["contact_method"];

const FACEBOOK_URL = "https://www.facebook.com/share/1JqVbfueaB";
const INSTAGRAM_URL = "https://www.instagram.com/it.sura.ph";

interface RequestFormProps {
  listingId: string;
}

function FacebookLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.77l-.44 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06Z" />
    </svg>
  );
}

function InstagramLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect width="17" height="17" x="3.5" y="3.5" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="16.8" cy="7.2" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function RequestForm({ listingId }: RequestFormProps) {
  const [requestCode, setRequestCode] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrderRequestFormValues>({
    resolver: zodResolver(orderRequestSchema) as Resolver<OrderRequestFormValues>,
    defaultValues: { 
      quantity: 1,
      contact_method: "email"
    },
  });

  const contactMethod = watch("contact_method");

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
      <div className="text-center space-y-5 py-8">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Request Submitted!</h2>
          <p className="text-muted-foreground text-sm">
            Your request has been received. We&apos;ll contact you soon.
          </p>
        </div>
        <div className="inline-block px-6 py-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Your Request ID</p>
          <p className="text-xl font-mono font-bold tracking-wider">
            {requestCode}
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            For a faster transaction, message us directly and include your Request ID.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline" className="w-full">
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer">
                <FacebookLogo className="h-4 w-4 text-[#1877F2]" />
                Facebook
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                <InstagramLogo className="h-4 w-4 text-[#E4405F]" />
                Instagram
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Send this ID in your chat: <span className="font-mono font-semibold text-foreground">{requestCode}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4 rounded-xl border p-4 bg-card">
        <div className="space-y-1.5">
          <Label htmlFor="buyer_name">Full Name *</Label>
          <Input id="buyer_name" {...register("buyer_name")} placeholder="Juan dela Cruz" />
          {errors.buyer_name && (
            <p className="text-xs text-destructive">{errors.buyer_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="buyer_phone">Phone Number *</Label>
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
      </div>

      <div className="space-y-4 rounded-xl border p-4 bg-card">
        <div className="space-y-3">
          <Label>Preferred Contact Method *</Label>
          <RadioGroup 
            value={contactMethod} 
            onValueChange={(val) => setValue("contact_method", val as ContactMethod)}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email" />
              <Label htmlFor="email" className="font-normal cursor-pointer">Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="messenger" id="messenger" />
              <Label htmlFor="messenger" className="font-normal cursor-pointer">Messenger Link/Name</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="instagram" id="instagram" />
              <Label htmlFor="instagram" className="font-normal cursor-pointer">Instagram @handle</Label>
            </div>
          </RadioGroup>
          {errors.contact_method && (
            <p className="text-xs text-destructive">{errors.contact_method.message}</p>
          )}
        </div>

        {contactMethod === "email" && (
          <div className="space-y-1.5 pt-2 border-t">
            <Label htmlFor="buyer_email">Email Address *</Label>
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
        )}

        {contactMethod === "messenger" && (
          <div className="space-y-1.5 pt-2 border-t">
            <Label htmlFor="buyer_messenger">Messenger Name or Link *</Label>
            <Input
              id="buyer_messenger"
              {...register("buyer_messenger")}
              placeholder="m.me/username or Full Name"
            />
            {errors.buyer_messenger && (
              <p className="text-xs text-destructive">{errors.buyer_messenger.message}</p>
            )}
          </div>
        )}

        {contactMethod === "instagram" && (
          <div className="space-y-1.5 pt-2 border-t">
            <Label htmlFor="buyer_instagram">Instagram @handle *</Label>
            <Input
              id="buyer_instagram"
              {...register("buyer_instagram")}
              placeholder="@username"
            />
            {errors.buyer_instagram && (
              <p className="text-xs text-destructive">{errors.buyer_instagram.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-xl border p-4 bg-card">
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

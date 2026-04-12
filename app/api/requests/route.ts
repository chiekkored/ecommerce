import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orderRequestSchema } from "@/lib/validators/order";
import { z } from "zod";

const bodySchema = orderRequestSchema.extend({
  listing_id: z.string().uuid("Invalid listing ID"),
});

async function generateRequestCode(supabase: Awaited<ReturnType<typeof createClient>>) {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("order_requests")
    .select("*", { count: "exact", head: true });
  const seq = String((count ?? 0) + 1).padStart(4, "0");
  return `ORD-${year}-${seq}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { listing_id, buyer_name, buyer_email, buyer_phone, quantity, message } =
      parsed.data;

    const supabase = await createClient();
    const request_code = await generateRequestCode(supabase);

    const { error } = await supabase.from("order_requests").insert({
      request_code,
      listing_id,
      buyer_name,
      buyer_email: buyer_email || null,
      buyer_phone: buyer_phone || null,
      quantity,
      message: message || null,
      status: "new",
    });

    if (error) {
      console.error("Order insert error:", error);
      return NextResponse.json({ error: "Failed to submit request." }, { status: 500 });
    }

    return NextResponse.json({ request_code }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

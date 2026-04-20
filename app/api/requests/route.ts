import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orderRequestSchema } from "@/lib/validators/order";
import { z } from "zod";

const bodySchema = orderRequestSchema.extend({
  listing_id: z.string().uuid("Invalid listing ID"),
});

async function generateRequestCode(supabase: Awaited<ReturnType<typeof createClient>>) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded O, 0, I, 1, L for clarity
  let code = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    code = Array.from({ length: 5 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    
    const { data } = await supabase
      .from("order_requests")
      .select("request_code")
      .eq("request_code", code)
      .maybeSingle();

    if (!data) {
      isUnique = true;
    }
    attempts++;
  }

  return code;
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

    const { 
      listing_id, 
      buyer_name, 
      buyer_email, 
      buyer_phone, 
      buyer_messenger,
      buyer_instagram,
      size,
      quantity, 
      message 
    } = parsed.data;

    const supabase = await createClient();
    const request_code = await generateRequestCode(supabase);

    const { data: inventoryItem, error: inventoryError } = await supabase
      .from("listing_inventory")
      .select("quantity")
      .eq("listing_id", listing_id)
      .eq("size", size)
      .maybeSingle();

    if (inventoryError) {
      console.error("Inventory lookup error:", inventoryError);
      return NextResponse.json({ error: inventoryError.message }, { status: 500 });
    }

    if (!inventoryItem) {
      return NextResponse.json({ error: "Selected size is not available for this item." }, { status: 400 });
    }

    if (inventoryItem.quantity <= 0) {
      return NextResponse.json({ error: "Selected size is out of stock." }, { status: 400 });
    }

    if (quantity > inventoryItem.quantity) {
      return NextResponse.json(
        { error: `Only ${inventoryItem.quantity} available for size ${size}.` },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("order_requests").insert({
      request_code,
      listing_id,
      buyer_name,
      buyer_email: buyer_email || null,
      buyer_phone: buyer_phone || null,
      buyer_messenger: buyer_messenger || null,
      buyer_instagram: buyer_instagram || null,
      size: size || null,
      quantity,
      message: message || null,
      status: "new",
    });

    if (error) {
      console.error("Order insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ request_code }, { status: 201 });
  } catch (error) {
    console.error("Order request error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error." }, { status: 500 });
  }
}

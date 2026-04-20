import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listingSchema } from "@/lib/validators/listing";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const { category_id, size, inventory, description, ...rest } = parsed.data;

  const { data, error } = await supabase
    .from("listings")
    .update({
      ...rest,
      category_id: category_id || null,
      size: size || null,
      description: description || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync inventory
  if (inventory) {
    // Simple sync: delete existing and re-insert (for simplicity in this flow)
    await supabase.from("listing_inventory").delete().eq("listing_id", id);
    
    if (inventory.length > 0) {
      const inventoryData = inventory.map(item => ({
        listing_id: id,
        size: item.size,
        quantity: item.quantity,
      }));

      const { error: inventoryError } = await supabase
        .from("listing_inventory")
        .insert(inventoryData);

      if (inventoryError) {
        console.error("Inventory update error:", inventoryError);
      }
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}

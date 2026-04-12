import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserForm } from "@/components/admin/UserForm";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Edit User — Admin" };

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-2xl font-semibold">Edit User</h1>
      <div className="p-4 border rounded-lg bg-muted/30">
        <p className="font-medium">{profile.full_name ?? "—"}</p>
        <p className="text-xs text-muted-foreground mt-0.5">ID: {profile.id}</p>
      </div>
      <UserForm user={profile} />
    </div>
  );
}

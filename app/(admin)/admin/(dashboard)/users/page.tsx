import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";

export const metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser?.id ?? "")
    .single();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const isSuperAdmin = currentProfile?.role === "superadmin";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>
      {!profiles?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No users found.
        </p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    {profile.full_name ?? (
                      <span className="text-muted-foreground italic">No name</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {profile.role ? (
                      <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                        {profile.role}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    {(isSuperAdmin || profile.role !== "superadmin") && (
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/users/${profile.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {currentUser?.id !== profile.id && (isSuperAdmin || profile.role !== "superadmin") && (
                      <DeleteUserButton
                        userId={profile.id}
                        userName={profile.full_name ?? "User"}
                      />
                    )}
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

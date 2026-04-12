"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserForm } from "@/components/admin/UserForm";
import type { Profile } from "@/types";
import { useEffect } from "react";

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        setCurrentRole(profile?.role ?? null);
      }
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setProfiles(profiles ?? []);
    };
    fetchData();
  }, []);

  const isSuperAdmin = currentRole === "superadmin";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Sheet
          open={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) setEditingUser(null);
          }}
        >
          <SheetTrigger asChild>
            <Button onClick={() => setEditingUser(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>{editingUser ? "Edit User" : "Add User"}</SheetTitle>
            </SheetHeader>
            <div className="p-6">
              <UserForm user={editingUser ?? undefined} onSuccess={() => setIsSheetOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {!profiles?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">No users found.</p>
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
                    {profile.full_name ?? <span className="text-muted-foreground italic">No name</span>}
                  </TableCell>
                  <TableCell>
                    {profile.role ? (
                      <Badge variant={profile.role === "admin" ? "default" : "secondary"}>{profile.role}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    {(isSuperAdmin || profile.role !== "superadmin") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingUser(profile);
                          setIsSheetOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {currentUser?.id !== profile.id && (isSuperAdmin || profile.role !== "superadmin") && (
                      <DeleteUserButton userId={profile.id} userName={profile.full_name ?? "User"} />
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

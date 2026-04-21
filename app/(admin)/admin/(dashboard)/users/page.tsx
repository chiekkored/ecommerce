"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { Pencil, Plus } from "lucide-react";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { UserForm } from "@/components/admin/UserForm";
import { TableSearchInput } from "@/components/admin/TableSearchInput";
import { ADMIN_TABLE_PAGE_SIZE, type AdminTableQuery, type AdminTableResult } from "@/lib/admin-table";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { Profile } from "@/types";

const FORM_ID = "user-form";

type CurrentUser = {
  id: string;
};

async function getProfilesPageData({
  search,
  page,
  pageSize,
}: AdminTableQuery): Promise<AdminTableResult<Profile>> {
  const supabase = createClient();
  let profilesQuery = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const normalizedSearch = search.trim();
  if (normalizedSearch) {
    profilesQuery = profilesQuery.ilike("full_name", `%${normalizedSearch}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await profilesQuery.range(from, to);

  return {
    rows: data ?? [],
    total: count ?? 0,
  };
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [, setTotal] = useState(0);
  const [hasProfiles, setHasProfiles] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    const { rows, total } = await getProfilesPageData({
      search: debouncedSearch,
      page,
      pageSize: ADMIN_TABLE_PAGE_SIZE,
    });
    setProfiles(rows);
    setTotal(total);
    if (!debouncedSearch.trim()) {
      setHasProfiles(total > 0);
    }
    setIsLoading(false);
  }, [debouncedSearch, page]);

  useEffect(() => {
    let isCurrent = true;

    const loadCurrentUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isCurrent) return;

      setCurrentUser(user ? { id: user.id } : null);
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (!isCurrent) return;
        setCurrentRole(profile?.role ?? null);
      }
    };

    loadCurrentUser();

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const loadProfiles = async () => {
      const { rows, total } = await getProfilesPageData({
        search: debouncedSearch,
        page,
        pageSize: ADMIN_TABLE_PAGE_SIZE,
      });

      if (!isCurrent) return;

      setProfiles(rows);
      setTotal(total);
      if (!debouncedSearch.trim()) {
        setHasProfiles(total > 0);
      }
      setIsLoading(false);
    };

    loadProfiles();

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearch, page]);

  const isSuperAdmin = currentRole === "superadmin";
  const canChangeEditingUserPassword = Boolean(
    editingUser && (isSuperAdmin || currentUser?.id === editingUser.id)
  );
  const hasSearch = Boolean(debouncedSearch.trim());

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <TableSearchInput
            value={search}
            onChange={(event) => {
              setIsLoading(true);
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search users..."
            aria-label="Search users"
          />
          <Sheet
            open={isSheetOpen}
            onOpenChange={(open) => {
              setIsSheetOpen(open);
              if (!open) setEditingUser(null);
            }}
          >
            <SheetTrigger asChild>
              <ButtonWithIcon icon={Plus} onClick={() => setEditingUser(null)}>
                Add User
              </ButtonWithIcon>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader className="px-6 pt-6">
                <SheetTitle>{editingUser ? "Edit User" : "Add User"}</SheetTitle>
              </SheetHeader>
              <div className="p-6">
                <UserForm 
                  user={editingUser ?? undefined} 
                  onSuccess={() => { setIsSheetOpen(false); fetchProfiles(); }} 
                  formId={FORM_ID}
                  canChangePassword={canChangeEditingUserPassword}
                />
              </div>
              <SheetFooter className="px-6 pb-6">
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit" form={FORM_ID}>
                  {editingUser ? "Save Changes" : "Create User"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {isLoading ? (
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
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !profiles?.length ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          {hasSearch && hasProfiles ? "No users match your search." : "No users found."}
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

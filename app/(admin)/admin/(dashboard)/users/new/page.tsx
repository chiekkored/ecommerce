import { UserForm } from "@/components/admin/UserForm";

export const metadata = { title: "Add User — Admin" };

export default function AddUserPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Add New User</h1>
      <p className="text-sm text-muted-foreground">
        Create a new administrative or staff account.
      </p>
      <div className="pt-4">
        <UserForm />
      </div>
    </div>
  );
}

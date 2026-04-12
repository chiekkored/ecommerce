import { LoginForm } from "@/components/admin/LoginForm";
import { Suspense } from "react";

export const metadata = { title: "Admin Login" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to manage your store
          </p>
        </div>
        <Suspense fallback={<div className="h-64 bg-white animate-pulse rounded-xl border shadow-sm" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" aria-label="IT.SURA home">
            <BrandLogo size={34} />
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} IT.SURA. All rights reserved.
      </footer>
    </div>
  );
}

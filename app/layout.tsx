import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT.SURA",
  description: "Browse the IT.SURA catalog and request items.",
  icons: {
    icon: [{ url: "/itsura_logo.jpg", type: "image/jpeg", sizes: "150x150" }],
    apple: [{ url: "/itsura_logo.jpg", type: "image/jpeg", sizes: "150x150" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

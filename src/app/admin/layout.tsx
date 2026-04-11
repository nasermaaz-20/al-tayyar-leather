import { AdminProviders } from "@/src/features/admin/components/AdminProviders";
import "@/src/app/globals.css";

export const metadata = {
  title: "Admin Dashboard | Al-Tayyar Leather",
  description: "Secure Admin Panel",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        <AdminProviders>
          {children}
        </AdminProviders>
      </body>
    </html>
  );
}

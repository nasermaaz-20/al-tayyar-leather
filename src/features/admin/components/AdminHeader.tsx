"use client";

import { useTheme } from "next-themes";
import { ThemeToggle } from "@/src/shared/ui/theme-toggle";
import { Bell, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function AdminHeader() {
  const pathname = usePathname();
  const pageTitle = pathname?.split("/").pop() || "Dashboard";

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold capitalize text-foreground">
          {pageTitle === "admin" ? "Dashboard" : pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-6">


        <div className="flex items-center gap-4 border-l border-border pl-4">
          <ThemeToggle />
          <button onClick={() => alert("No new notifications")} className="relative p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background"></span>
          </button>
          <Link href="/admin/settings" className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 hover:bg-primary/20 transition-colors">
            <User size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}

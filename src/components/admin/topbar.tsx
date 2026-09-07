"use client";

import { LogOut, Menu } from "lucide-react";
import { adminLogout } from "@/app/actions";
import { useRouter } from "next/navigation";

export function AdminTopbar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const router = useRouter();

  async function handleLogout() {
    await adminLogout();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-navy-100 bg-white px-4 sm:px-6">
      <button
        onClick={onOpenSidebar}
        className="rounded-md p-2 text-navy-500 hover:bg-navy-50 hover:text-navy-700 lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden lg:block" />
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy-500 hover:bg-navy-50 hover:text-navy-700"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </header>
  );
}
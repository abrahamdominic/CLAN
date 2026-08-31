"use client";

import { LogOut } from "lucide-react";
import { adminLogout } from "@/app/actions";
import { useRouter } from "next/navigation";

export function AdminTopbar() {
  const router = useRouter();

  async function handleLogout() {
    await adminLogout();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-navy-100 bg-white px-6">
      <div />
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

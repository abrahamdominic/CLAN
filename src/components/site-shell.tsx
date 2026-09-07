"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const ADMIN_PREFIX = "/admin";
const MAINTENANCE_PATHS = new Set(["/maintenance"]);

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + "/");
  const isStandalone = isAdmin || MAINTENANCE_PATHS.has(pathname);

  return (
    <>
      {!isStandalone && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isStandalone && <Footer />}
    </>
  );
}

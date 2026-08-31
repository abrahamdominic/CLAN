"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/what-we-do", label: "What We Do" },
  { href: "/discipleship", label: "Discipleship" },
  { href: "/sermons", label: "Sermons" },
  { href: "/events", label: "Events" },
  { href: "/resources", label: "Resources" },
  { href: "/outreach", label: "Outreach" },
  { href: "/give", label: "Give" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-navy-100 bg-white/90 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <Container>
        <nav className="flex h-20 items-center justify-between" aria-label="Main navigation">
          <Logo
            textClassName={cn(scrolled ? "" : "text-white")}
          />

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  scrolled
                    ? "text-navy-700 hover:bg-navy-50 hover:text-navy-900"
                    : "text-white/90 hover:bg-white/10 hover:text-white",
                  pathname === link.href &&
                    (scrolled ? "text-gold-600 font-semibold" : "text-gold-300 font-semibold")
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button href="/join" size="md" className="ml-3">
              Join CLAN
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md transition-colors lg:hidden",
              scrolled ? "text-navy-900 hover:bg-navy-50" : "text-white hover:bg-white/10"
            )}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-navy-100 bg-white lg:hidden">
          <Container className="py-4">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-3 text-base font-medium text-navy-700 hover:bg-navy-50",
                    pathname === link.href && "text-gold-600 font-semibold"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Button href="/join" className="mt-3 w-full">
                Join CLAN
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

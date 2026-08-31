"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Calendar, FileText, Users, Heart,
  MessageSquare, DollarSign, HelpCircle, Image, Settings, Megaphone,
  GraduationCap, Radio, Tag, UserCheck, Mail, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

type NavLink = { href: string; label: string; icon: LucideIcon };
type NavDivider = { divider: true };
type NavItem = NavLink | NavDivider;

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/sermons", label: "Sermons", icon: BookOpen },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/blog", label: "Blog Posts", icon: FileText },
  { href: "/admin/programs", label: "Programs", icon: GraduationCap },
  { href: "/admin/outreach", label: "Outreach", icon: Megaphone },
  { href: "/admin/speakers", label: "Speakers", icon: UserCheck },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { divider: true },
  { href: "/admin/prayer-requests", label: "Prayer Requests", icon: Heart },
  { href: "/admin/testimonials", label: "Testimonials", icon: Radio },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/contacts", label: "Messages", icon: MessageSquare },
  { href: "/admin/donations", label: "Donations", icon: DollarSign },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { divider: true },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-navy-100 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-navy-100 px-4">
        {!collapsed && (
          <Link href="/admin" className="font-display text-lg font-bold text-navy-900">
            CLAN <span className="text-gold-500">Admin</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-md p-1.5 text-navy-400 hover:bg-navy-50 hover:text-navy-700"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Admin navigation">
        {NAV.map((item, i) => {
          if ("divider" in item && item.divider) {
            return <div key={`d-${i}`} className="my-2 border-t border-navy-100" />;
          }
          const href = "href" in item ? item.href : "";
          const label = "label" in item ? item.label : "";
          const Icon = "icon" in item ? item.icon : null;
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-navy-50 text-navy-900"
                  : "text-navy-500 hover:bg-navy-50 hover:text-navy-700",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? label : undefined}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-navy-100 p-3">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy-500 hover:bg-navy-50 hover:text-navy-700",
            collapsed && "justify-center px-2"
          )}
        >
          View Site
        </Link>
      </div>
    </aside>
  );
}

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  className?: string;
}

export function StatCard({ label, value, icon, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-navy-100 bg-white p-5 shadow-sm", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
          {icon}
        </div>
        <div>
          <p className="text-sm text-navy-500">{label}</p>
          <p className="text-2xl font-bold text-navy-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

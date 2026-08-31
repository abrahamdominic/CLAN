import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// Using any for render callback to allow flexible typing in admin pages
interface Column {
  key: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (item: any) => ReactNode;
  className?: string;
}

interface AdminTableProps {
  columns: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  emptyMessage?: string;
}

export function AdminTable({
  columns,
  data,
  emptyMessage = "No records found",
}: AdminTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-navy-100 bg-white p-12 text-center">
        <p className="text-sm text-navy-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-navy-100 bg-navy-50/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn("px-4 py-3 font-medium text-navy-600", col.className)}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-50">
          {data.map((item, i) => (
            <tr key={i} className="hover:bg-navy-50/30">
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-navy-700", col.className)}>
                  {col.render ? col.render(item) : String(item[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

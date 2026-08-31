"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { BlogPost } from "@/types";
import { BlogCard } from "@/components/ui/blog-card";
import { cn } from "@/lib/utils";

interface ResourcesExplorerProps {
  posts: BlogPost[];
}

const PER_PAGE = 9;

export function ResourcesExplorer({ posts }: ResourcesExplorerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, category]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category).filter((c): c is string => Boolean(c))))],
    [posts]
  );

  const filtered = useMemo(
    () =>
      posts.filter((p) => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "All" || p.category === category;
        return matchesSearch && matchesCategory;
      }),
    [posts, search, category]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div>
      <div className="mb-10 grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            aria-label="Search articles"
            className="w-full rounded-lg border border-navy-200 py-2.5 pl-10 pr-4 text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
        <label className="sr-only" htmlFor="rcat">Filter by category</label>
        <select
          id="rcat"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-navy-200 bg-warm-50 p-14 text-center">
          <p className="font-semibold text-navy-900">No articles found</p>
          <p className="mt-1 text-sm text-navy-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paged.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={cn("rounded-lg border border-navy-200 p-2 text-navy-600 hover:bg-navy-50 disabled:opacity-40")}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 text-sm text-navy-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-navy-200 p-2 text-navy-600 hover:bg-navy-50 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

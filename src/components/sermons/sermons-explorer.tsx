"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Sermon } from "@/types";
import { SermonCard } from "@/components/ui/sermon-card";
import { cn } from "@/lib/utils";

interface SermonsExplorerProps {
  sermons: Sermon[];
}

const PER_PAGE = 9;

export function SermonsExplorer({ sermons }: SermonsExplorerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [speaker, setSpeaker] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, category, speaker]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(sermons.map((s) => s.category).filter((c): c is string => Boolean(c))))],
    [sermons]
  );

  const speakers = useMemo(
    () => ["All", ...Array.from(new Set(sermons.map((s) => s.speaker?.name).filter((n): n is string => Boolean(n))))],
    [sermons]
  );

  const filtered = useMemo(() => {
    return sermons.filter((s) => {
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || s.category === category;
      const matchesSpeaker = speaker === "All" || s.speaker?.name === speaker;
      return matchesSearch && matchesCategory && matchesSpeaker;
    });
  }, [sermons, search, category, speaker]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div>
      <div className="mb-10 grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sermons..."
            aria-label="Search sermons"
            className="w-full rounded-lg border border-navy-200 py-2.5 pl-10 pr-4 text-navy-900 focus:border-gold-500 focus:outline-none"
          />
        </div>
        <label className="sr-only" htmlFor="cat">Filter by category</label>
        <select
          id="cat"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="spk">Filter by speaker</label>
        <select
          id="spk"
          value={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
          className="rounded-lg border border-navy-200 px-4 py-2.5 text-navy-900 focus:border-gold-500 focus:outline-none"
        >
          {speakers.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All Speakers" : s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-navy-200 bg-warm-50 p-14 text-center">
          <p className="font-semibold text-navy-900">No sermons found</p>
          <p className="mt-1 text-sm text-navy-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paged.map((s) => (
              <SermonCard key={s.id} sermon={s} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg border border-navy-200 p-2 text-navy-600 hover:bg-navy-50 disabled:opacity-40"
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
                className={cn("rounded-lg border border-navy-200 p-2 text-navy-600 hover:bg-navy-50 disabled:opacity-40")}
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

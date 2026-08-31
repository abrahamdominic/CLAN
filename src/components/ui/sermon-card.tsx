import Link from "next/link";
import Image from "next/image";
import { Mic, Calendar, BookOpen } from "lucide-react";
import type { Sermon } from "@/types";
import { formatDate } from "@/lib/utils";

interface SermonCardProps {
  sermon: Sermon;
}

export function SermonCard({ sermon }: SermonCardProps) {
  return (
    <Link
      href={`/sermons/${sermon.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-navy-100">
        {sermon.thumbnail_url ? (
          <Image
            src={sermon.thumbnail_url}
            alt={sermon.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-navy-800">
            <Mic className="h-10 w-10 text-gold-400" />
          </div>
        )}
        {sermon.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-semibold text-navy-950">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-navy-500">
          {sermon.category && (
            <span className="rounded-full bg-navy-50 px-2 py-0.5 font-medium text-navy-700">
              {sermon.category}
            </span>
          )}
          {sermon.date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {formatDate(sermon.date)}
            </span>
          )}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold text-navy-900 group-hover:text-gold-600">
          {sermon.title}
        </h3>
        {sermon.speaker?.name && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-600">
            <BookOpen className="h-4 w-4 text-gold-500" /> {sermon.speaker.name}
          </p>
        )}
        {sermon.description && (
          <p className="mt-2 line-clamp-2 text-sm text-navy-500">{sermon.description}</p>
        )}
      </div>
    </Link>
  );
}

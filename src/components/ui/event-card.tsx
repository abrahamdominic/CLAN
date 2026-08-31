import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Video } from "lucide-react";
import type { Event } from "@/types";
import { formatDate } from "@/lib/utils";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy-100">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-navy-800">
            <Calendar className="h-10 w-10 text-gold-400" />
          </div>
        )}
        {event.date && (
          <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-1.5 text-center shadow-sm">
            <span className="block font-display text-lg font-bold leading-none text-navy-900">
              {formatDate(event.date).split(" ")[1]?.replace(",", "")}
            </span>
            <span className="block text-[10px] uppercase text-navy-500">
              {formatDate(event.date).split(" ")[0]}
            </span>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs">
          {event.category && (
            <span className="rounded-full bg-gold-50 px-2 py-0.5 font-medium text-gold-700">
              {event.category}
            </span>
          )}
          {event.is_online && (
            <span className="flex items-center gap-1 rounded-full bg-navy-50 px-2 py-0.5 font-medium text-navy-600">
              <Video className="h-3 w-3" /> Online
            </span>
          )}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold text-navy-900 group-hover:text-gold-600">
          {event.title}
        </h3>
        {event.time && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-600">
            <Calendar className="h-4 w-4 text-gold-500" /> {formatDate(event.date)} · {event.time}
          </p>
        )}
        {event.location && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-600">
            <MapPin className="h-4 w-4 text-gold-500" /> {event.location}
          </p>
        )}
      </div>
    </Link>
  );
}

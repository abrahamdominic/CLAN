import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CtaSection } from "@/components/ui/cta-section";
import { Calendar, Clock, MapPin, Video, User, ExternalLink } from "lucide-react";
import { getEventBySlug } from "@/lib/db";
import { SAMPLE_EVENTS } from "@/lib/content";
import { formatDate, toPlainText } from "@/lib/utils";

export async function generateStaticParams() {
  return SAMPLE_EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = (await getEventBySlug(slug)) || SAMPLE_EVENTS.find((e) => e.slug === slug);
  if (!event) return { title: "Event Not Found" };
  return {
    title: event.title,
    description: toPlainText(event.description || ""),
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = (await getEventBySlug(slug)) || SAMPLE_EVENTS.find((e) => e.slug === slug);
  if (!event) notFound();

  return (
    <>
      <section className="bg-navy-900 pb-16 pt-36 text-white">
        <Container className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">
            {event.category || "Event"}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{event.title}</h1>
          <p className="mt-4 text-lg text-navy-100">{event.description}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-4xl">
          <div className="grid gap-6 rounded-2xl border border-navy-100 bg-white p-8 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-gold-600" />
              <div>
                <p className="text-xs uppercase text-navy-500">Date</p>
                <p className="font-semibold text-navy-900">{formatDate(event.date)}</p>
              </div>
            </div>
            {event.time && (
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-gold-600" />
                <div>
                  <p className="text-xs uppercase text-navy-500">Time</p>
                  <p className="font-semibold text-navy-900">{event.time}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              {event.is_online ? (
                <>
                  <Video className="h-6 w-6 text-gold-600" />
                  <div>
                    <p className="text-xs uppercase text-navy-500">Format</p>
                    <p className="font-semibold text-navy-900">Online</p>
                  </div>
                </>
              ) : (
                <>
                  <MapPin className="h-6 w-6 text-gold-600" />
                  <div>
                    <p className="text-xs uppercase text-navy-500">Location</p>
                    <p className="font-semibold text-navy-900">{event.location || "TBA"}</p>
                  </div>
                </>
              )}
            </div>
            {event.speaker && (
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-gold-600" />
                <div>
                  <p className="text-xs uppercase text-navy-500">Speaker</p>
                  <p className="font-semibold text-navy-900">{event.speaker}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10">
            <h2 className="font-display text-2xl font-bold text-navy-900">About This Event</h2>
            <p className="mt-3 text-lg leading-relaxed text-navy-700">{event.description}</p>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            {event.registration_link ? (
              <a
                href={event.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-900"
              >
                <ExternalLink className="h-5 w-5" /> Register for this Event
              </a>
            ) : (
              <Button href="/join" size="lg">Join CLAN to Attend</Button>
            )}
            {event.is_online && event.online_link && (
              <a
                href={event.online_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-navy-200 px-6 py-3 font-semibold text-navy-800 transition-colors hover:bg-navy-50"
              >
                <Video className="h-5 w-5" /> Join Online
              </a>
            )}
          </div>
        </Container>
      </section>

      <CtaSection
        title="Attend Our Next Gathering"
        description="Join us in fellowship, prayer and worship. There's a place for you here."
        primaryHref="/join"
        primaryLabel="Join CLAN"
        secondaryHref="/events"
        secondaryLabel="All Events"
      />
    </>
  );
}

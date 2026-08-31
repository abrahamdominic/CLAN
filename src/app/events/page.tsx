import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { CtaSection } from "@/components/ui/cta-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { EventCard } from "@/components/ui/event-card";
import { getEvents } from "@/lib/db";
import { SAMPLE_EVENTS } from "@/lib/content";

export default async function EventsPage() {
  const dbEvents = await getEvents();
  const events = dbEvents.length ? dbEvents : SAMPLE_EVENTS;

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = events
    .filter((e) => e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Gatherings & Community"
        description="Join us for prayer meetings, discipleship classes, Bible studies, conferences, worship gatherings and more."
      />

      <section className="py-16">
        <Container>
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Upcoming"
              title="Upcoming Events"
            />
          </Reveal>
          {upcoming.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-navy-200 bg-warm-50 p-14 text-center">
              <p className="font-semibold text-navy-900">No upcoming events</p>
              <p className="mt-1 text-sm text-navy-500">Check back soon for our next gathering.</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e, i) => (
                <Reveal key={e.id} delay={i * 60}>
                  <EventCard event={e} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      {past.length > 0 && (
        <section className="bg-warm-100 py-16">
          <Container>
            <Reveal>
              <SectionHeading align="left" eyebrow="Past" title="Past Events" />
            </Reveal>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {past.map((e, i) => (
                <Reveal key={e.id} delay={i * 60}>
                  <EventCard event={e} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      <CtaSection
        title="Don't Miss Out"
        description="Join the CLAN community to stay updated on events, prayer meetings and gatherings."
        primaryHref="/join"
        primaryLabel="Join CLAN"
        secondaryHref="/prayer"
        secondaryLabel="Prayer Request"
        dark
      />
    </>
  );
}

import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { CtaSection } from "@/components/ui/cta-section";
import { SermonCard } from "@/components/ui/sermon-card";
import { EventCard } from "@/components/ui/event-card";
import {
  Cross,
  Heart,
  BookOpen,
  HandHeart,
  Users,
  Compass,
  ArrowRight,
} from "lucide-react";
import {
  getSermons,
  getEvents,
} from "@/lib/db";
import {
  SAMPLE_SERMONS,
  SAMPLE_EVENTS,
  SAMPLE_PROGRAMS,
  SITE_TAGLINE,
} from "@/lib/content";

const pillars = [
  {
    icon: Cross,
    title: "Discipleship",
    description: "Helping believers grow into mature followers of Jesus Christ.",
    href: "/discipleship",
  },
  {
    icon: Heart,
    title: "Prayer",
    description: "Building a culture of consistent, intentional and faith-filled prayer.",
    href: "/prayer",
  },
  {
    icon: BookOpen,
    title: "The Word",
    description: "Encouraging believers to know, understand and live according to Scripture.",
    href: "/what-we-do",
  },
  {
    icon: HandHeart,
    title: "Outreach",
    description: "Taking the message of Christ beyond our walls and serving communities.",
    href: "/outreach",
  },
  {
    icon: Users,
    title: "Fellowship",
    description: "Creating genuine Christian community and relationships.",
    href: "/what-we-do",
  },
  {
    icon: Compass,
    title: "Purpose",
    description: "Helping people discover and fulfill their purpose in Christ Jesus.",
    href: "/purpose",
  },
];

export default async function HomePage() {
  const [sermons, events] = await Promise.all([
    getSermons(),
    getEvents({ upcoming: true }),
  ]);
  const displaySermons = sermons.length ? sermons.slice(0, 3) : SAMPLE_SERMONS;
  const displayEvents = events.length ? events.slice(0, 3) : SAMPLE_EVENTS;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy-950">
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(212,154,30,0.25),transparent_60%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(30,51,102,0.6),transparent_60%)]"
          aria-hidden="true"
        />
        <Container className="flex min-h-[92vh] flex-col items-center justify-center pt-24 pb-16 text-center">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-400">
              Christian Life Altar Network
            </p>
            <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl font-bold text-balance text-white sm:text-6xl lg:text-7xl">
              {SITE_TAGLINE}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-navy-100 sm:text-xl">
              A community committed to discipleship, prayer, the Word, outreach,
              and helping people discover and fulfill their purpose in Christ Jesus.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button href="/join" size="lg" variant="gold">
                Join CLAN
              </Button>
              <Button href="/about" size="lg" variant="outline" className="border-white/40 text-white hover:border-white hover:bg-white/10">
                Discover Our Mission
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Introduction */}
      <section className="py-20">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <SectionHeading
              eyebrow="Welcome to CLAN"
              title="Rebirth. Discipleship. Purpose."
              description="Christian Life Altar Network is a non-denominational Christian organization focused on the rebirth of true Christianity — helping people know Christ, grow in Christ, live like Christ, serve Christ, and fulfill their purpose in Christ Jesus."
            />
          </Reveal>
        </Container>
      </section>

      {/* Vision / Mission */}
      <section className="bg-warm-100 py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <Reveal className="rounded-2xl bg-white p-10 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-widest text-gold-600">Our Vision</p>
              <h3 className="mt-3 font-display text-3xl font-bold text-navy-900">
                To see a generation transformed by the authentic life and teachings of Jesus Christ.
              </h3>
              <p className="mt-4 text-navy-600">
                We envision a people who walk in true faith, live with conviction, and carry
                the presence of Christ into every sphere of life.
              </p>
            </Reveal>
            <Reveal className="rounded-2xl bg-navy-900 p-10 shadow-sm" delay={100}>
              <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">Our Mission</p>
              <h3 className="mt-3 font-display text-3xl font-bold text-white">
                Discipleship, Prayer, the Word, Evangelism & Fellowship.
              </h3>
              <p className="mt-4 text-navy-100">
                We pursue the transformation of lives through discipleship, prayer, God&apos;s Word,
                evangelism, fellowship, purpose discovery, spiritual development and practical
                Christian living.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* What We Do */}
      <section className="py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="What We Do"
              title="The Pillars of Our Ministry"
              description="Everything we do flows from six core pillars that help believers know Christ and walk in their God-given purpose."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <a
                  href={p.href}
                  className="group flex h-full flex-col rounded-xl border border-navy-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-lg"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-800 text-gold-400 transition-colors group-hover:bg-gold-500 group-hover:text-navy-950">
                    <p.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-navy-900">{p.title}</h3>
                  <p className="mt-2 flex-1 text-navy-600">{p.description}</p>
                  <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-gold-600">
                    Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Discipleship banner */}
      <section className="bg-navy-950 py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Discipleship"
              title="Grow Into Mature Followers of Jesus Christ"
              description="Join structured programs, classes and mentorship designed to build your faith on the solid foundation of God's Word and prayer."
              light
            />
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/discipleship" variant="gold">Explore Programs</Button>
              <Button href="/join" variant="outline" className="border-white/40 text-white hover:border-white hover:bg-white/10">
                Get Involved
              </Button>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="grid gap-4 sm:grid-cols-2">
              {SAMPLE_PROGRAMS.slice(0, 2).map((p) => (
                <div key={p.id} className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
                  <h4 className="font-display text-lg font-semibold text-white">{p.title}</h4>
                  <p className="mt-2 text-sm text-navy-200">{p.duration}</p>
                  <p className="mt-1 text-sm text-navy-300">{p.schedule}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Featured sermons */}
      <section className="bg-warm-100 py-20">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              align="left"
              eyebrow="The Word"
              title="Featured Sermons & Teachings"
            />
            <Button href="/sermons" variant="outline">View All Sermons</Button>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displaySermons.map((s, i) => (
              <Reveal key={s.id} delay={i * 80}>
                <SermonCard sermon={s} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Upcoming events */}
      <section className="py-20">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              align="left"
              eyebrow="Fellowship"
              title="Upcoming Events"
            />
            <Button href="/events" variant="outline">View All Events</Button>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayEvents.map((e, i) => (
              <Reveal key={e.id} delay={i * 80}>
                <EventCard event={e} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Prayer CTA */}
      <section className="bg-navy-900 py-20">
        <Container className="max-w-3xl text-center">
          <SectionHeading
            eyebrow="Prayer"
            title="Share Your Burden. Let Us Stand With You in Prayer."
            description="Whatever you are facing, you don't have to walk through it alone. Submit a prayer request and our community will pray with you."
            light
          />
          <div className="mt-8">
            <Button href="/prayer" size="lg" variant="gold">Submit Prayer Request</Button>
          </div>
        </Container>
      </section>

      {/* Outreach */}
      <section className="bg-warm-100 py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Outreach"
              title="Taking Christ Beyond Our Walls"
              description="We serve our communities through practical acts of love, evangelism and missions — reaching people with the life-changing message of Jesus."
            />
            <div className="mt-8">
              <Button href="/outreach" variant="primary">Discover Our Outreach</Button>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h4 className="font-display text-xl font-semibold text-navy-900">Ways We Serve</h4>
              <ul className="mt-4 space-y-3 text-navy-700">
                <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-gold-500" /> Community outreach & feeding</li>
                <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-gold-500" /> Evangelism & missions</li>
                <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-gold-500" /> Support for the needy</li>
                <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-gold-500" /> Serving local communities</li>
              </ul>
            </div>
          </Reveal>
        </Container>
      </section>

      <CtaSection
        title="Become Part of the CLAN Community"
        description="Whether you're new to the faith or looking to grow deeper, there's a place for you here. Join us in discovering and fulfilling your purpose in Christ Jesus."
        primaryHref="/join"
        primaryLabel="Join CLAN"
        secondaryHref="/give"
        secondaryLabel="Give"
        dark
      />
    </>
  );
}

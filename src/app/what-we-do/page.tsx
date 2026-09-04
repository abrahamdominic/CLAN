import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { CtaSection } from "@/components/ui/cta-section";
import { Button } from "@/components/ui/button";
import { Cross, Heart, BookOpen, HandHeart, Users, Compass } from "lucide-react";

const areas = [
  {
    icon: Cross,
    title: "Discipleship",
    description:
      "Helping believers grow into mature followers of Jesus Christ through teaching, mentorship and intentional spiritual formation.",
    cta: "Explore Discipleship",
    href: "/discipleship",
  },
  {
    icon: Heart,
    title: "Prayer",
    description:
      "Building a culture of consistent, intentional and faith-filled prayer: personal, intercessory and corporate.",
    cta: "Submit a Prayer Request",
    href: "/prayer",
  },
  {
    icon: BookOpen,
    title: "The Word",
    description:
      "Encouraging believers to know, understand and live according to Scripture through Bible study, sermons and resources.",
    cta: "Browse Sermons",
    href: "/sermons",
  },
  {
    icon: HandHeart,
    title: "Outreach",
    description:
      "Taking the message of Christ beyond the walls of the organization and serving communities through practical love.",
    cta: "See Our Outreach",
    href: "/outreach",
  },
  {
    icon: Users,
    title: "Fellowship",
    description:
      "Creating genuine Christian community and relationships where believers support, encourage and build one another up.",
    cta: "Join the Community",
    href: "/join",
  },
  {
    icon: Compass,
    title: "Purpose",
    description:
      "Helping people discover their God-given gifts, calling and purpose, and providing resources to help them walk in it.",
    cta: "Discover Your Purpose",
    href: "/purpose",
  },
];

export default function WhatWeDoPage() {
  return (
    <>
      <PageHeader
        eyebrow="What We Do"
        title="Areas of Ministry"
        description="CLAN serves through six major areas of work, each focused on helping people know Christ, grow in Christ, and fulfill their purpose in Christ Jesus."
      />

      <section className="py-20">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a, i) => (
              <Reveal key={a.title} delay={i * 60}>
                <div className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy-800 text-gold-400">
                    <a.icon className="h-7 w-7" />
                  </span>
                  <h2 className="mt-6 font-display text-2xl font-semibold text-navy-900">{a.title}</h2>
                  <p className="mt-3 flex-1 text-navy-600">{a.description}</p>
                  <Button href={a.href} variant="outline" className="mt-6 w-full">
                    {a.cta}
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Getting involved */}
      <section className="bg-navy-900 py-20">
        <Container className="max-w-3xl text-center">
          <SectionHeading
            eyebrow="Get Involved"
            title="There's a Place for You"
            description="Whatever your gifts or season of life, there is a way for you to grow, serve and belong in the CLAN community."
            light
          />
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/join" variant="gold" size="lg">Join CLAN</Button>
            <Button href="/events" variant="outline" className="border-white/40 text-white hover:border-white hover:bg-white/10" size="lg">Attend an Event</Button>
          </div>
        </Container>
      </section>

      <CtaSection
        title="Grow in Your Walk"
        description="Discover resources, programs and a community ready to walk with you on your journey of faith and purpose."
        primaryHref="/discipleship"
        primaryLabel="Explore Discipleship"
        secondaryHref="/give"
        secondaryLabel="Give"
      />
    </>
  );
}

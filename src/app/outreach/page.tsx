import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { CtaSection } from "@/components/ui/cta-section";
import { HandHeart, HeartHandshake, Users, Globe } from "lucide-react";
import { getOutreachProjects } from "@/lib/db";
import { SAMPLE_OUTREACH } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export default async function OutreachPage() {
  const dbProjects = await getOutreachProjects();
  const projects = dbProjects.length ? dbProjects : SAMPLE_OUTREACH;

  const statusOrder = { current: 0, upcoming: 1, past: 2 } as const;
  const sorted = [...projects].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  return (
    <>
      <PageHeader
        eyebrow="Outreach"
        title="Taking Christ Beyond Our Walls"
        description="Through practical acts of love, evangelism and missions, we serve our communities and share the life-changing message of Jesus Christ."
      />

      {/* Mission */}
      <section className="py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow="Our Mission"
                title="Serving with the Love of Christ"
              />
              <p className="mt-5 text-lg leading-relaxed text-navy-700">
                Outreach is the outworking of our faith. We believe the message of Christ is
                meant to be shared — through words of truth, works of compassion, and a genuine
                love for people. Whether feeding the hungry, supporting the needy or sharing the
                gospel, we meet people where they are.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-warm-50 p-6 text-center">
                  <HandHeart className="mx-auto h-8 w-8 text-gold-600" />
                  <p className="mt-2 font-display text-lg font-semibold text-navy-900">Compassion</p>
                </div>
                <div className="rounded-xl bg-warm-50 p-6 text-center">
                  <HeartHandshake className="mx-auto h-8 w-8 text-gold-600" />
                  <p className="mt-2 font-display text-lg font-semibold text-navy-900">Service</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="rounded-2xl bg-navy-900 p-10 text-white">
                <Users className="h-12 w-12 text-gold-400" />
                <h3 className="mt-4 font-display text-2xl font-bold">Community Impact</h3>
                <p className="mt-3 text-navy-100">
                  Every act of service is an opportunity to love our neighbours as ourselves and
                  point them to the hope found in Jesus Christ.
                </p>
                <p className="mt-6 border-t border-navy-700 pt-6 italic text-navy-200">
                  &ldquo;Truly I tell you, whatever you did for one of the least of these brothers
                  and sisters of mine, you did for me.&rdquo; — Matthew 25:40
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Projects */}
      <section className="bg-warm-100 py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Projects"
              title="Our Outreach Projects"
              description="See the current and upcoming ways we're serving our community."
            />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
                  <div className="relative flex aspect-video items-center justify-center bg-navy-800">
                    <Globe className="h-10 w-10 text-gold-400" />
                    <span className="absolute left-3 top-3 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-semibold capitalize text-navy-950">
                      {p.status}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl font-semibold text-navy-900">{p.title}</h3>
                    {p.location && <p className="mt-1 text-sm text-navy-500">{p.location}</p>}
                    <p className="mt-3 flex-1 text-navy-600">{p.description}</p>
                    {p.date && <p className="mt-4 text-sm font-medium text-gold-600">{formatDate(p.date)}</p>}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Volunteer CTA */}
      <section className="py-20">
        <Container className="max-w-3xl text-center">
          <Reveal>
            <SectionHeading
              eyebrow="Get Involved"
              title="Serve With Us"
              description="We're always looking for volunteers who want to make a difference in their community and share the love of Christ."
            />
            <div className="mt-8">
              <CtaSection
                title="Volunteer or Give Today"
                description="Join an outreach team or support our work through prayer and giving."
                primaryHref="/join"
                primaryLabel="Volunteer"
                secondaryHref="/give"
                secondaryLabel="Give"
                dark
              />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

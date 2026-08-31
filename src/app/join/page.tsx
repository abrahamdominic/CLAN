import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Users, HeartHandshake, Sparkles } from "lucide-react";
import { JoinForm } from "@/components/join/join-form";

const benefits = [
  {
    icon: Users,
    title: "Belong",
    description: "Find genuine Christian community and relationships that support and encourage you.",
  },
  {
    icon: Sparkles,
    title: "Grow",
    description: "Grow in your faith through discipleship, prayer, Bible study and mentorship.",
  },
  {
    icon: HeartHandshake,
    title: "Serve",
    description: "Discover your gifts and use them to serve God and others through outreach and ministry.",
  },
];

export default function JoinPage() {
  return (
    <>
      <PageHeader
        eyebrow="Join CLAN"
        title="Become Part of the CLAN Community"
        description="Whether you're new to the faith or seeking to go deeper, there's a place for you here. Express your interest and our team will welcome you."
      />

      <section className="py-20">
        <Container className="grid gap-12 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-navy-900">Why Join CLAN?</h2>
            <div className="mt-8 space-y-6">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-gold-400">
                    <b.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-navy-900">{b.title}</h3>
                    <p className="mt-1 text-navy-600">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-navy-900 p-8 text-white">
              <p className="italic text-navy-100">
                &ldquo;They devoted themselves to the apostles&apos; teaching and to fellowship, to
                the breaking of bread and to prayer.&rdquo;
              </p>
              <p className="mt-2 text-sm font-semibold text-gold-400">— Acts 2:42</p>
            </div>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-3">
            <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 font-display text-2xl font-bold text-navy-900">Express Your Interest</h2>
              <JoinForm />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { HandHeart, BookOpen, Globe2, Users, Mic, Sparkles } from "lucide-react";
import { DonationForm } from "@/components/give/donation-form";

const supported = [
  {
    icon: HandHeart,
    title: "Outreach",
    description: "Feeding programmes, community service and practical acts of love.",
  },
  {
    icon: BookOpen,
    title: "Discipleship",
    description: "Programs, classes and mentoring that help believers grow in faith.",
  },
  {
    icon: Globe2,
    title: "Missions",
    description: "Taking the gospel to new places and supporting missionaries.",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Helping those in need within our community with compassion.",
  },
  {
    icon: Mic,
    title: "Media",
    description: "Producing and distributing sermons, teachings and resources.",
  },
  {
    icon: Sparkles,
    title: "General Ministry",
    description: "Supporting the day-to-day work and vision of CLAN.",
  },
];

export default async function GivePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const paid = status === "success";
  return (
    <>
      {paid && (
        <div className="border-b border-green-200 bg-green-50">
          <Container className="py-4 text-center text-sm font-medium text-green-800">
            Thank you! Your payment was received successfully.
          </Container>
        </div>
      )}
      <PageHeader
        eyebrow="Give"
        title="Support the Work of CLAN"
        description="Your giving helps us reach people with the message of Christ through outreach, discipleship, missions and media."
      />

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionHeading
              title="What Your Giving Supports"
              description="Every gift, great or small, helps fulfill the vision of seeing a generation transformed by the authentic life of Jesus Christ."
            />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {supported.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <div className="h-full rounded-2xl border border-navy-100 bg-white p-7 shadow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-800 text-gold-400">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">{s.title}</h3>
                  <p className="mt-2 text-navy-600">{s.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-warm-100 py-20">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Give Today"
              title="A Cheerful Giver"
              description="Give securely online. Your generosity sows into the lives of others and advances the Kingdom of God through our ministry."
            />
            <div className="mt-8 rounded-2xl bg-navy-900 p-8 text-white">
              <p className="italic text-navy-100">
                &ldquo;Each of you should give what you have decided in your heart to give, not
                reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
              </p>
              <p className="mt-2 text-sm font-semibold text-gold-400">— 2 Corinthians 9:7</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-sm">
              <DonationForm />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

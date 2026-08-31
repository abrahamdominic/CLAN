import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { CtaSection } from "@/components/ui/cta-section";
import { Compass, Gift, Flame, TrendingUp, Heart, Users, GraduationCap, BookOpen } from "lucide-react";
import { PurposeInterestForm } from "@/components/purpose/purpose-interest-form";

const sections = [
  {
    icon: Compass,
    title: "Understanding Purpose",
    description: "Discover what it means to live with God-given purpose and why you were uniquely created.",
  },
  {
    icon: Gift,
    title: "Spiritual Gifts",
    description: "Identify the spiritual gifts God has given you to serve others and build the body of Christ.",
  },
  {
    icon: Flame,
    title: "Calling",
    description: "Discern the specific calling God has placed on your life and learn to walk in it.",
  },
  {
    icon: TrendingUp,
    title: "Personal Growth",
    description: "Grow spiritually, emotionally and relationally as you mature in Christ.",
  },
  {
    icon: Heart,
    title: "Service",
    description: "Find practical ways to serve God and others with the gifts you've received.",
  },
  {
    icon: Users,
    title: "Leadership",
    description: "Develop the character, wisdom and skills to lead with integrity and faith.",
  },
  {
    icon: GraduationCap,
    title: "Mentorship",
    description: "Receive guidance from mature believers who can help you walk in your calling.",
  },
  {
    icon: BookOpen,
    title: "Resources",
    description: "Access teaching, materials and tools to help you grow in purpose and faith.",
  },
];

export default function PurposePage() {
  return (
    <>
      <PageHeader
        eyebrow="Purpose & Calling"
        title="Discover Your Purpose in Christ"
        description="Every believer has a God-given purpose. We're here to help you identify your gifts, discover your calling, and walk in it with confidence and faith."
      />

      <section className="py-20">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <SectionHeading
              eyebrow="For You"
              title="Understanding Your Purpose"
              description="For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do."
            />
            <p className="mt-4 text-sm font-semibold text-gold-600">— Ephesians 2:10</p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((s, i) => (
              <Reveal key={s.title} delay={i * 50}>
                <div className="h-full rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-800 text-gold-400">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-navy-600">{s.description}</p>
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
              eyebrow="Begin Your Journey"
              title="Discover Your Purpose"
              description="Tell us a little about where you'd like guidance, and we'll connect you with resources and mentorship to help you discover and walk in your purpose in Christ Jesus."
            />
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-sm">
              <PurposeInterestForm />
            </div>
          </Reveal>
        </Container>
      </section>

      <CtaSection
        title="Ready to Walk in Purpose?"
        description="Join the CLAN community and grow with mentors and fellow believers on the journey of faith and purpose."
        primaryHref="/join"
        primaryLabel="Join CLAN"
        secondaryHref="/discipleship"
        secondaryLabel="Explore Discipleship"
      />
    </>
  );
}

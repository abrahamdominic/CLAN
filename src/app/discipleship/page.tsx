import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { CtaSection } from "@/components/ui/cta-section";
import { Timer, BookOpen, UserPlus, CalendarClock } from "lucide-react";
import { getPrograms } from "@/lib/db";
import { SAMPLE_PROGRAMS } from "@/lib/content";
import { ProgramRegisterForm } from "@/components/discipleship/program-register-form";

export default async function DiscipleshipPage() {
  const dbPrograms = await getPrograms();
  const programs = dbPrograms.length ? dbPrograms : SAMPLE_PROGRAMS;

  return (
    <>
      <PageHeader
        eyebrow="Discipleship"
        title="Growing Into Mature Followers of Christ"
        description="Through structured programs, study materials, classes and mentorship, we help believers build their lives on the foundation of God's Word and prayer."
      />

      {/* Overview */}
      <section className="py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow="Why Discipleship"
                title="The Heart of Our Mission"
              />
              <p className="mt-5 text-lg leading-relaxed text-navy-700">
                Discipleship is how we grow in faith. At CLAN, we are committed to walking
                alongside believers as they learn to follow Jesus, understand the Scriptures,
                develop a life of prayer, and step into their God-given purpose.
              </p>
              <ul className="mt-6 space-y-3 text-navy-700">
                <li className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-gold-600" /> Study materials & structured classes</li>
                <li className="flex items-center gap-3"><UserPlus className="h-5 w-5 text-gold-600" /> Personal mentorship & guidance</li>
                <li className="flex items-center gap-3"><CalendarClock className="h-5 w-5 text-gold-600" /> Scheduled programs & schedules</li>
              </ul>
            </Reveal>
            <Reveal delay={100}>
              <div className="rounded-2xl bg-navy-900 p-10 text-white">
                <Timer className="h-12 w-12 text-gold-400" />
                <h3 className="mt-4 font-display text-2xl font-bold">A Journey of Transformation</h3>
                <p className="mt-3 text-navy-100">
                  Discipleship is not a one-time event; it is a journey of becoming more like
                  Christ each day. Our programs are designed to meet you where you are and help
                  you take the next step.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Programs */}
      <section className="bg-warm-100 py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Programs"
              title="Available Discipleship Programs"
              description="Browse our programs, learn more, and register for the ones that fit your journey."
            />
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <div className="flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
                  <div className="bg-navy-800 p-8">
                    <h3 className="font-display text-xl font-semibold text-white">{p.title}</h3>
                    <p className="mt-2 text-sm text-gold-300">
                      {p.duration && <span>{p.duration} · </span>}
                      {p.schedule}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <p className="flex-1 text-navy-600">{p.description}</p>
                    <div className="mt-6">
                      <ProgramRegisterForm program={p} />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <Container className="max-w-3xl">
          <Reveal>
            <SectionHeading
              eyebrow="Testimonials"
              title="Lives Changed Through Discipleship"
            />
          </Reveal>
          <Reveal className="mt-10">
            <blockquote className="rounded-2xl border border-navy-100 bg-warm-50 p-8 shadow-sm">
              <p className="text-lg italic leading-relaxed text-navy-700">
                &ldquo;Going through discipleship at CLAN transformed how I read the Bible,
                pray and relate to other believers. I finally understood my purpose in Christ.&rdquo;
              </p>
              <footer className="mt-4 font-semibold text-navy-900">A Discipleship Graduate</footer>
            </blockquote>
          </Reveal>
        </Container>
      </section>

      <CtaSection
        title="Ready to Grow?"
        description="Take the next step in your journey of faith. Register for a program or join the CLAN community today."
        primaryHref="/join"
        primaryLabel="Join CLAN"
        secondaryHref="/give"
        secondaryLabel="Give"
      />
    </>
  );
}

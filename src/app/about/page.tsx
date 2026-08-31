import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { CtaSection } from "@/components/ui/cta-section";
import { getFaqs } from "@/lib/db";
import {
  type Faq,
} from "@/types";

const values = [
  { title: "Christ-Centered", description: "Jesus Christ is the center of all we are and all we do." },
  { title: "Truth & Holiness", description: "We pursue the truth of God's Word and live lives of holiness." },
  { title: "Love & Community", description: "We love God and one another, building genuine Christian fellowship." },
  { title: "Spiritual Growth", description: "We are committed to growing in faith and maturity in Christ." },
  { title: "Purpose", description: "We help people discover and fulfill their God-given purpose." },
  { title: "Excellence", description: "We serve God and people with excellence and integrity." },
];

const beliefs = [
  "We believe in the one true God — Father, Son and Holy Spirit.",
  "We believe Jesus Christ is the Son of God, our Lord and Savior.",
  "We believe in the authority and truth of the Holy Scriptures.",
  "We believe in salvation by grace through faith in Jesus Christ.",
  "We believe in the transforming work of the Holy Spirit in the believer.",
  "We believe in discipleship as the pathway to spiritual maturity.",
  "We believe every believer has a God-given purpose and calling.",
  "We believe in prayer as essential to the life of the believer.",
];

// Fallback FAQs when database is not configured
const fallbackFaqs: Faq[] = [
  {
    id: "faq1",
    question: "Who is CLAN for?",
    answer: "CLAN is for anyone seeking to know Christ, grow in Christ, and discover their purpose in Him — whether new to the faith or walking for years.",
    category: "General",
    sort_order: 1,
    published: true,
  },
  {
    id: "faq2",
    question: "Is CLAN affiliated with a specific denomination?",
    answer: "No. CLAN is a non-denominational Christian organization focused on the rebirth of true Christianity.",
    category: "General",
    sort_order: 2,
    published: true,
  },
  {
    id: "faq3",
    question: "How can I get involved?",
    answer: "You can join CLAN, attend events, join discipleship programs, volunteer for outreach, or submit a prayer request. Explore the Join CLAN page to get started.",
    category: "General",
    sort_order: 3,
    published: true,
  },
  {
    id: "faq4",
    question: "How do I submit a prayer request?",
    answer: "Visit our Prayer Request page and share your request. You can choose to keep it private, anonymous, or public.",
    category: "Prayer",
    sort_order: 4,
    published: true,
  },
];

export default async function AboutPage() {
  const dbFaqs = await getFaqs();
  const faqs = dbFaqs.length ? dbFaqs : fallbackFaqs;

  return (
    <>
      <PageHeader
        eyebrow="About CLAN"
        title="Who We Are"
        description="Christian Life Altar Network is a non-denominational Christian organization dedicated to the rebirth of true Christianity — discipleship, prayer, the Word, evangelism, fellowship and purpose."
      />

      {/* Who We Are / Our Story */}
      <section className="py-20">
        <Container className="max-w-3xl">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Our Story"
              title="A Movement of True Christianity"
            />
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-navy-700">
              <p>
                Christian Life Altar Network exists to help people <strong>know Christ,
                grow in Christ, live like Christ, serve Christ, and fulfill their purpose
                in Christ Jesus</strong>. Our journey is built on the conviction that the
                Christian faith is not merely a set of beliefs, but a lived relationship
                with Jesus that transforms every area of life.
              </p>
              <p>
                Through discipleship, prayer, the Word of God, evangelism, fellowship and
                practical living, we are raising a generation that reflects the authentic life
                and teachings of Jesus Christ.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Vision / Mission */}
      <section className="bg-navy-900 py-20 text-white">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <Reveal className="rounded-2xl bg-white/5 p-10 ring-1 ring-white/10">
              <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">Our Vision</p>
              <h3 className="mt-3 font-display text-3xl font-bold">
                To see a generation transformed by the authentic life and teachings of Jesus Christ.
              </h3>
            </Reveal>
            <Reveal className="rounded-2xl bg-white/5 p-10 ring-1 ring-white/10" delay={100}>
              <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">Our Mission</p>
              <p className="mt-3 text-lg leading-relaxed text-navy-100">
                We pursue transformation through discipleship, prayer, God&apos;s Word, evangelism,
                fellowship, purpose discovery, spiritual development and practical Christian living.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Mandate */}
      <section className="py-20">
        <Container className="max-w-3xl text-center">
          <Reveal>
            <SectionHeading
              eyebrow="Our Mandate"
              title="The Rebirth of True Christianity"
              description="We are called to help people know Christ, grow in Christ, live like Christ, serve Christ, and fulfill their purpose in Christ Jesus — the heartbeat of everything CLAN does."
            />
          </Reveal>
        </Container>
      </section>

      {/* Values */}
      <section className="bg-warm-100 py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Our Values"
              title="What We Stand For"
            />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 60}>
                <div className="h-full rounded-xl border border-navy-100 bg-white p-7 shadow-sm">
                  <h3 className="font-display text-xl font-semibold text-navy-900">{v.title}</h3>
                  <p className="mt-2 text-navy-600">{v.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Beliefs */}
      <section className="py-20">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="What We Believe" title="Our Statement of Faith" />
          </Reveal>
          <div className="mx-auto mt-12 max-w-3xl">
            <div className="grid gap-4 sm:grid-cols-2">
              {beliefs.map((b, i) => (
                <Reveal key={i} delay={i * 40}>
                  <div className="flex gap-3 rounded-lg bg-warm-50 p-5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-500" />
                    <p className="text-navy-700">{b}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Leadership */}
      <section className="bg-warm-100 py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Leadership"
              title="Guided by Faith & Integrity"
              description="Our leadership serves with a heart for God and for people, committed to the vision and values of CLAN."
            />
          </Reveal>
          <Reveal className="mx-auto mt-12 max-w-xl">
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-navy-500 italic">
                Leadership details are managed through the content management system.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <Container className="max-w-3xl">
          <Reveal>
            <SectionHeading eyebrow="Questions" title="Frequently Asked Questions" />
          </Reveal>
          <div className="mt-10 space-y-4">
            {faqs.map((f, i) => (
              <Reveal key={f.id} delay={i * 40}>
                <details className="group rounded-xl border border-navy-100 bg-white shadow-sm">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <span className="text-gold-500 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="px-5 pb-5 text-navy-600">{f.answer}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaSection
        title="Become Part of the Story"
        description="Join a community committed to the rebirth of true Christianity and discovering purpose in Christ Jesus."
        primaryHref="/join"
        primaryLabel="Join CLAN"
        secondaryHref="/contact"
        secondaryLabel="Contact Us"
      />
    </>
  );
}

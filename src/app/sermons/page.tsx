import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { CtaSection } from "@/components/ui/cta-section";
import { getSermons } from "@/lib/db";
import { SAMPLE_SERMONS } from "@/lib/content";
import { SermonsExplorer } from "@/components/sermons/sermons-explorer";

export default async function SermonsPage() {
  const dbSermons = await getSermons();
  const sermons = dbSermons.length ? dbSermons : SAMPLE_SERMONS;

  return (
    <>
      <PageHeader
        eyebrow="Sermons & Teachings"
        title="The Word of God"
        description="Explore our library of sermons and teachings — audio, video and notes to help you know, understand and live according to Scripture."
      />
      <section className="py-16">
        <Container>
          <SermonsExplorer sermons={sermons} />
        </Container>
      </section>
      <CtaSection
        title="Deepen Your Understanding of the Word"
        description="Join a Bible study or discipleship class to go deeper in God's Word."
        primaryHref="/discipleship"
        primaryLabel="Join Discipleship"
        secondaryHref="/events"
        secondaryLabel="See Events"
      />
    </>
  );
}

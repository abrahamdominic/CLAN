import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { CtaSection } from "@/components/ui/cta-section";
import { getBlogPosts } from "@/lib/db";
import { SAMPLE_BLOG } from "@/lib/content";
import { ResourcesExplorer } from "@/components/resources/resources-explorer";

export default async function ResourcesPage() {
  const dbPosts = await getBlogPosts();
  const posts = dbPosts.length ? dbPosts : SAMPLE_BLOG;

  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Articles, Devotionals & Bible Studies"
        description="Explore our library of Christian resources: Bible studies, devotionals, discipleship, prayer, purpose, evangelism and more."
      />
      <section className="py-16">
        <Container>
          <ResourcesExplorer posts={posts} />
        </Container>
      </section>
      <CtaSection
        title="Grow Through God's Word"
        description="Join a discipleship class or Bible study to go deeper in your walk with Christ."
        primaryHref="/discipleship"
        primaryLabel="Join Discipleship"
        secondaryHref="/testimonies"
        secondaryLabel="Read Testimonies"
      />
    </>
  );
}

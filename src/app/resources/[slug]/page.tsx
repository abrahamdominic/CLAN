import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CtaSection } from "@/components/ui/cta-section";
import { Calendar, User } from "lucide-react";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/db";
import { SAMPLE_BLOG } from "@/lib/content";
import { formatDate, toPlainText } from "@/lib/utils";

export async function generateStaticParams() {
  return SAMPLE_BLOG.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getBlogPostBySlug(slug)) || SAMPLE_BLOG.find((p) => p.slug === slug);
  if (!post) return { title: "Article Not Found" };
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || toPlainText(post.content || "").slice(0, 160),
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = (await getBlogPostBySlug(slug)) || SAMPLE_BLOG.find((p) => p.slug === slug);
  if (!post) notFound();

  const others = (await getBlogPosts()).filter((p) => p.slug !== post.slug);
  const related = others.length ? others.slice(0, 3) : SAMPLE_BLOG.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <section className="bg-navy-900 pb-16 pt-36 text-white">
        <Container className="max-w-3xl">
          {post.category && (
            <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">{post.category}</p>
          )}
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{post.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-5 text-navy-200">
            {post.author && (
              <span className="flex items-center gap-2">
                <User className="h-5 w-5 text-gold-400" /> {post.author}
              </span>
            )}
            {post.published_date && (
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gold-400" /> {formatDate(post.published_date)}
              </span>
            )}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-3xl">
          <article className="prose-content">
            {post.content ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <p>Content coming soon.</p>
            )}
          </article>

          {related.length > 0 && (
            <div className="mt-16 border-t border-navy-100 pt-10">
              <h2 className="font-display text-2xl font-bold text-navy-900">Related Articles</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Button key={r.id} href={`/resources/${r.slug}`} variant="outline" className="justify-start text-left">
                    <span className="line-clamp-2">{r.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>

      <CtaSection
        title="Continue Growing"
        description="Explore more resources, join discipleship, or get involved in the CLAN community."
        primaryHref="/resources"
        primaryLabel="More Resources"
        secondaryHref="/join"
        secondaryLabel="Join CLAN"
      />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CtaSection } from "@/components/ui/cta-section";
import { Mic, Calendar, BookOpen, Download, ExternalLink, Tag } from "lucide-react";
import { getSermonBySlug, getSermons } from "@/lib/db";
import { SAMPLE_SERMONS } from "@/lib/content";
import { formatDate, toPlainText } from "@/lib/utils";

export async function generateStaticParams() {
  return SAMPLE_SERMONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sermon = await getSermonBySlug(slug) || SAMPLE_SERMONS.find((s) => s.slug === slug);
  if (!sermon) return { title: "Sermon Not Found" };
  return {
    title: sermon.title,
    description: toPlainText(sermon.description || ""),
  };
}

export default async function SermonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sermon = (await getSermonBySlug(slug)) || SAMPLE_SERMONS.find((s) => s.slug === slug);
  if (!sermon) notFound();

  const more = (await getSermons()).filter((s) => s.slug !== sermon.slug);
  const related = more.length ? more.slice(0, 3) : SAMPLE_SERMONS.filter((s) => s.slug !== sermon.slug).slice(0, 3);

  return (
    <>
      <section className="bg-navy-900 pb-16 pt-36 text-white">
        <Container className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">
            {sermon.category || "Sermon"}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{sermon.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-5 text-navy-200">
            {sermon.speaker?.name && (
              <span className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-gold-400" /> {sermon.speaker.name}
              </span>
            )}
            {sermon.date && (
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gold-400" /> {formatDate(sermon.date)}
              </span>
            )}
            {sermon.scripture && (
              <span className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gold-400" /> {sermon.scripture}
              </span>
            )}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="max-w-4xl">
          {sermon.video_url ? (
            <div className="overflow-hidden rounded-2xl bg-black shadow-lg">
              <video controls className="aspect-video w-full" src={sermon.video_url} />
            </div>
          ) : sermon.audio_url ? (
            <div className="rounded-2xl bg-warm-50 p-8">
              <p className="mb-3 font-semibold text-navy-900">Listen to this sermon</p>
              <audio controls className="w-full" src={sermon.audio_url} />
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-2xl bg-warm-50 p-8">
              <Mic className="h-10 w-10 text-gold-600" />
              <div>
                <p className="font-display text-lg font-semibold text-navy-900">{sermon.title}</p>
                <p className="text-sm text-navy-500">An audio recording will appear here when available.</p>
              </div>
            </div>
          )}

          {sermon.description && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-bold text-navy-900">About This Sermon</h2>
              <p className="mt-3 text-lg leading-relaxed text-navy-700">{sermon.description}</p>
            </div>
          )}

          {sermon.tags && sermon.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-gold-600" />
              {sermon.tags.map((t) => (
                <span key={t} className="rounded-full bg-navy-50 px-3 py-1 text-sm text-navy-700">
                  {t}
                </span>
              ))}
            </div>
          )}

          {(sermon.notes_url || sermon.video_url) && (
            <div className="mt-10 flex flex-wrap gap-4">
              {sermon.notes_url && (
                <a
                  href={sermon.notes_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-5 py-3 font-semibold text-white transition-colors hover:bg-navy-900"
                >
                  <Download className="h-5 w-5" /> Download Notes
                </a>
              )}
              {sermon.video_url && (
                <a
                  href={sermon.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-navy-200 px-5 py-3 font-semibold text-navy-800 transition-colors hover:bg-navy-50"
                >
                  <ExternalLink className="h-5 w-5" /> Watch Video
                </a>
              )}
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl font-bold text-navy-900">More Sermons</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Button key={r.id} href={`/sermons/${r.slug}`} variant="outline" className="justify-start text-left">
                    <span className="line-clamp-2">{r.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>

      <CtaSection
        title="Grow Through the Word"
        description="Join a discipleship class or Bible study to go deeper in God's Word."
        primaryHref="/discipleship"
        primaryLabel="Explore Discipleship"
      />
    </>
  );
}

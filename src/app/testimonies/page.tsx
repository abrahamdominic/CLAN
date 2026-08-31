import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Quote } from "lucide-react";
import { getTestimonials } from "@/lib/db";
import { SAMPLE_TESTIMONIALS } from "@/lib/content";
import { TestimonyForm } from "@/components/testimonies/testimony-form";

export default async function TestimoniesPage() {
  const dbTestimonials = await getTestimonials();
  const testimonials = dbTestimonials.length ? dbTestimonials : SAMPLE_TESTIMONIALS;

  return (
    <>
      <PageHeader
        eyebrow="Testimonies"
        title="What God is Doing"
        description="Read how God is transforming lives through CLAN, and share your own testimony of His goodness."
      />

      {/* Testimonials grid */}
      <section className="py-20">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.id} delay={i * 60}>
                <figure className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-7 shadow-sm">
                  <Quote className="h-8 w-8 text-gold-400" />
                  <blockquote className="mt-4 flex-1 leading-relaxed text-navy-700">
                    &ldquo;{t.testimony}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-navy-100 pt-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 font-display font-bold text-gold-400">
                      {t.name.charAt(0)}
                    </span>
                    <span className="font-semibold text-navy-900">{t.name}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
            {testimonials.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-navy-200 bg-warm-50 p-14 text-center">
                <p className="font-semibold text-navy-900">No testimonies yet</p>
                <p className="mt-1 text-sm text-navy-500">Be the first to share what God has done.</p>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Submit */}
      <section className="bg-warm-100 py-20">
        <Container className="max-w-2xl">
          <Reveal>
            <SectionHeading
              eyebrow="Share Yours"
              title="Share Your Testimony"
              description="Tell us what God has done in your life. With your permission, your testimony may be published to encourage others."
            />
            <div className="mt-10 rounded-2xl border border-navy-100 bg-white p-8 shadow-sm">
              <TestimonyForm />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

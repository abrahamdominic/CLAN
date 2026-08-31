import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Heart } from "lucide-react";
import { PrayerRequestForm } from "@/components/prayer/prayer-request-form";

export default function PrayerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Prayer"
        title="Share Your Burden. Let Us Stand With You in Prayer."
        description="Whatever you are facing, you don't have to walk through it alone. Submit your prayer request and our community will stand with you in faith."
      />

      <section className="py-20">
        <Container className="grid gap-12 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="rounded-2xl bg-navy-900 p-8 text-white">
              <Heart className="h-10 w-10 text-gold-400" />
              <h2 className="mt-4 font-display text-2xl font-bold">Why We Pray</h2>
              <p className="mt-3 leading-relaxed text-navy-100">
                Prayer is how we connect with God and how we carry one another&apos;s burdens.
                Our team prays over every request submitted, trusting God for breakthrough,
                healing, guidance and peace.
              </p>
              <div className="mt-6 border-t border-navy-700 pt-6">
                <p className="italic text-navy-200">
                  &ldquo;Therefore confess your sins to each other and pray for each other so that
                  you may be healed. The prayer of a righteous person is powerful and effective.&rdquo;
                </p>
                <p className="mt-2 text-sm font-semibold text-gold-400">— James 5:16</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-3">
            <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 font-display text-2xl font-bold text-navy-900">Submit a Prayer Request</h2>
              <PrayerRequestForm />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

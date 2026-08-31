import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Mail, Phone, MapPin } from "lucide-react";
import { CONTACT } from "@/lib/content";
import { ContactForm } from "@/components/contact/contact-form";

const socials = [
  { label: "Facebook", handle: "@clanministry" },
  { label: "Instagram", handle: "@clanministry" },
  { label: "Twitter", handle: "@clanministry" },
  { label: "YouTube", handle: "CLAN Ministry" },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in Touch"
        description="We'd love to hear from you. Whether you have a question, want to get involved, or need prayer, our team is here to connect with you."
      />

      <section className="py-20">
        <Container className="grid gap-12 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-navy-900">Contact Information</h2>
            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-800 text-gold-400">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-navy-900">Email</p>
                  <p className="text-navy-600">{CONTACT.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-800 text-gold-400">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-navy-900">Phone</p>
                  <p className="text-navy-600">{CONTACT.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-800 text-gold-400">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-navy-900">Location</p>
                  <p className="text-navy-600">{CONTACT.location}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl bg-warm-50 p-6">
              <h3 className="font-display text-lg font-semibold text-navy-900">Follow Us</h3>
              <ul className="mt-4 space-y-2 text-navy-600">
                {socials.map((s) => (
                  <li key={s.label}>
                    <span className="font-medium text-navy-800">{s.label}:</span> {s.handle}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-3">
            <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 font-display text-2xl font-bold text-navy-900">Send Us a Message</h2>
              <ContactForm />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

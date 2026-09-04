import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/logo";
import { CONTACT, SITE_DESCRIPTION } from "@/lib/content";
import { submitNewsletter } from "./footer-actions";

const ministries = [
  { href: "/discipleship", label: "Discipleship" },
  { href: "/purpose", label: "Purpose & Calling" },
  { href: "/outreach", label: "Outreach" },
  { href: "/sermons", label: "Sermons & Teachings" },
  { href: "/resources", label: "Resources & Blog" },
  { href: "/events", label: "Events" },
];

const connect = [
  { href: "/about", label: "About CLAN" },
  { href: "/what-we-do", label: "What We Do" },
  { href: "/prayer", label: "Prayer Request" },
  { href: "/join", label: "Join CLAN" },
  { href: "/give", label: "Give" },
  { href: "/contact", label: "Contact" },
];

const socials = [
  { href: "https://facebook.com/CLANetwork", label: "Facebook", icon: Facebook },
  { href: "#", label: "Twitter", icon: Twitter },
  { href: "#", label: "Instagram", icon: Instagram },
  { href: "#", label: "YouTube", icon: Youtube },
];

export function NewsletterForm() {
  async function newsletterAction(formData: FormData) {
    "use server";
    await submitNewsletter(formData);
  }
  return (
    <form action={newsletterAction} className="mt-4 flex max-w-sm gap-2">
      <input
        type="email"
        name="email"
        required
        placeholder="Your email"
        aria-label="Email address"
        className="w-full rounded-lg border border-navy-600 bg-navy-900 px-4 py-2.5 text-sm text-white placeholder:text-navy-400 focus:border-gold-400 focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-600"
      >
        Subscribe
      </button>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-200">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo className="[&_span]:text-white" textClassName="[&_span]:text-white [&_span_span]:text-gold-400" />
            <p className="mt-4 text-sm leading-relaxed text-navy-300">{SITE_DESCRIPTION}</p>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-white">Ministries</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {ministries.map((m) => (
                <li key={m.href}>
                  <Link href={m.href} className="text-navy-300 transition-colors hover:text-gold-400">
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-white">Connect</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {connect.map((m) => (
                <li key={m.href}>
                  <Link href={m.href} className="text-navy-300 transition-colors hover:text-gold-400">
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-white">Stay Connected</h3>
            <p className="mt-4 text-sm text-navy-300">
              Subscribe for devotionals, updates and news from CLAN.
            </p>
            <NewsletterForm />
            <ul className="mt-6 space-y-3 text-sm text-navy-300">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold-400" /> {CONTACT.email}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold-400" /> {CONTACT.phone}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold-400" /> {CONTACT.location}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-navy-800 pt-8 sm:flex-row">
          <p className="text-sm text-navy-400">
            © {new Date().getFullYear()} Christian Life Altar Network. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-sm text-navy-400 hover:text-gold-400">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-navy-400 hover:text-gold-400">Terms of Use</Link>
          </div>
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-700 text-navy-300 transition-colors hover:border-gold-400 hover:text-gold-400"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}

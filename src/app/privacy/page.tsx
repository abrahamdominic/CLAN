import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { SITE_NAME } from "@/lib/content";

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <section className="py-16">
        <Container className="prose-content max-w-3xl">
          <p>
            {SITE_NAME} (&ldquo;CLAN&rdquo; / &ldquo;we&rdquo; / &ldquo;us&rdquo;) is committed to
            protecting your privacy. This policy explains how we collect, use and safeguard your
            personal information.
          </p>
          <h2>Information We Collect</h2>
          <p>
            We collect information you voluntarily provide, such as your name, email address,
            phone number, and prayer requests or messages submitted through our website.
          </p>
          <h2>How We Use Your Information</h2>
          <p>
            We use your information to respond to your requests, process prayer requests,
            membership applications, contact messages, and donations, and to send you updates you
            have requested. We do not sell your personal information.
          </p>
          <h2>Prayer Requests</h2>
          <p>
            Prayer requests are treated with care. You choose whether your request is private,
            anonymous or public. Private requests are only accessible to our team.
          </p>
          <h2>Security</h2>
          <p>
            We use appropriate technical and organisational measures to protect your personal
            information. Donation details are processed through secure, PCI-compliant payment
            providers, and we never store your card details directly.
          </p>
          <h2>Contact</h2>
          <p>
            If you have questions about this policy, please contact us through our Contact page.
          </p>
        </Container>
      </section>
    </>
  );
}

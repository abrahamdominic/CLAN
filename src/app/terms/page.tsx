import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { SITE_NAME } from "@/lib/content";

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Use" />
      <section className="py-16">
        <Container className="prose-content max-w-3xl">
          <p>
            By using the {SITE_NAME} (&ldquo;CLAN&rdquo;) website, you agree to these terms of use.
          </p>
          <h2>Use of Content</h2>
          <p>
            Content on this site, including sermons, articles and resources, is provided for your
            personal and spiritual growth. You may share it with attribution, but you may not
            reproduce, redistribute or sell it without permission.
          </p>
          <h2>Submissions</h2>
          <p>
            By submitting a prayer request, testimony, contact message or membership application,
            you agree that CLAN may process this information in accordance with our Privacy Policy.
            Testimonies are published only with your permission and after review.
          </p>
          <h2>Donations</h2>
          <p>
            Donations are accepted to support the ministry. Payment details are processed securely
            by third-party providers. CLAN does not store your card information.
          </p>
          <h2>Limitation of Liability</h2>
          <p>
            CLAN provides this website on an &ldquo;as is&rdquo; basis and is not liable for any
            damages arising from its use.
          </p>
          <h2>Contact</h2>
          <p>
            For questions about these terms, please contact us through our Contact page.
          </p>
        </Container>
      </section>
    </>
  );
}

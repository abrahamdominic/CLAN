import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

interface CtaSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  dark?: boolean;
}

export function CtaSection({
  eyebrow,
  title,
  description,
  primaryHref = "/join",
  primaryLabel = "Join CLAN",
  secondaryHref,
  secondaryLabel,
  dark = true,
}: CtaSectionProps) {
  return (
    <section className={dark ? "bg-navy-900 py-20" : "bg-gold-50 py-20"}>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            light={dark}
          />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href={primaryHref} size="lg" variant={dark ? "gold" : "primary"}>
              {primaryLabel}
            </Button>
            {secondaryHref && secondaryLabel && (
              <Button href={secondaryHref} size="lg" variant="secondary">
                {secondaryLabel}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

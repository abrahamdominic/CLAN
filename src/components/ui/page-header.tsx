import { Container } from "@/components/ui/container";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="bg-navy-900 pb-16 pt-36 text-white">
      <Container>
        {eyebrow && (
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gold-400">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl font-display text-4xl font-bold text-balance sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-navy-100">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}

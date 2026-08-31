import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-navy-950 py-24 text-center text-white">
      <Container className="max-w-xl">
        <p className="font-display text-7xl font-bold text-gold-400">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold">Page Not Found</h1>
        <p className="mt-3 text-navy-200">
          We couldn&apos;t find the page you were looking for. It may have been moved or removed.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button href="/" variant="gold">Back to Home</Button>
          <Button href="/contact" variant="outline" className="border-white/40 text-white hover:border-white hover:bg-white/10">
            Contact Us
          </Button>
        </div>
      </Container>
    </section>
  );
}

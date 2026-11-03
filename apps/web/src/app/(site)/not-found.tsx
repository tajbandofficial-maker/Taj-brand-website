import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-cocoa-900 text-cream-50">
      <HeroBackdrop glows={[{ className: "size-[640px] -right-[200px] -top-[220px]" }]} />
      <Container className="relative flex flex-col items-start gap-5 py-[clamp(64px,10vw,140px)]">
        <span className="text-xs font-bold tracking-[0.16em] text-gold-300 uppercase">404</span>
        <h1 className="m-0 text-page">This page has left the baraat.</h1>
        <p className="m-0 max-w-[520px] text-lead text-sand-200">
          The link may be old or mistyped. Let&apos;s get you back to the celebration.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/" size="lg">
            Go home
          </ButtonLink>
          <ButtonLink href="/contact" variant="outlineLight" size="lg">
            Check your date
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

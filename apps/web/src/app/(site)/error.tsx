"use client";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/** Shown if the API is unreachable while rendering a page. */
export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="bg-cocoa-900 text-cream-50">
      <Container className="flex flex-col items-start gap-5 py-[clamp(64px,10vw,140px)]">
        <h1 className="m-0 text-page">Something went wrong on our side.</h1>
        <p className="m-0 max-w-[520px] text-lead text-sand-200">
          Please try again in a moment. You can always reach us on WhatsApp or by phone.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="min-h-[52px] cursor-pointer rounded-full bg-gold-500 px-[26px] font-bold text-cocoa-900"
          >
            Try again
          </button>
          <ButtonLink href="/" variant="outlineLight" size="lg">
            Go home
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

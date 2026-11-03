import type { Faq } from "@taj/types";

/**
 * Accordion built on native <details name>: keyboard-accessible, one open at
 * a time, works without JavaScript and ships zero JS.
 */
export function FaqList({ faqs, group }: { faqs: Faq[]; group: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      {faqs.map((f, i) => (
        <details
          key={f.id}
          name={group}
          open={i === 0}
          className="group overflow-hidden rounded-[14px] bg-cream-50"
        >
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-[18px] text-base font-semibold text-cocoa-900 [&::-webkit-details-marker]:hidden">
            {f.question}
            <span aria-hidden="true" className="text-xl text-gold-700">
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span>
            </span>
          </summary>
          <p className="m-0 px-5 pb-[18px] text-[15px] leading-relaxed text-ink-muted">
            {f.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

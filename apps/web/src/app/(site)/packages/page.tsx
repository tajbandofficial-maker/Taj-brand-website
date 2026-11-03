import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { PackageCard } from "@/components/site/PackageCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CtaPanel } from "@/components/ui/CtaPanel";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  getAddOns,
  getPackageComparison,
  getPackages,
  getPage,
  getSiteSettings,
} from "@/lib/api/public";
import { cn } from "@/lib/cn";
import { serviceHref } from "@/lib/navigation";
import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("packages");
}

export default async function PackagesPage() {
  const [page, settings, packages, comparison, addOns] = await Promise.all([
    getPage("packages"),
    getSiteSettings(),
    getPackages(),
    getPackageComparison(),
    getAddOns(),
  ]);
  const highlightIdx = packages.findIndex((p) => p.highlighted);
  const t = page.text;

  return (
    <>
      <section className="relative overflow-hidden bg-cocoa-900 text-cream-50">
        <HeroBackdrop
          glows={[{ className: "size-[640px] left-1/2 -ml-[320px] -top-[320px]", drift: [0, 120] }]}
        />
        <Container className="relative flex flex-col gap-9 pt-[clamp(36px,6vw,72px)] pb-[clamp(48px,7vw,88px)]">
          <div className="stagger flex max-w-[680px] flex-col gap-3.5 [--stagger-start:100ms]">
            <SectionHeader as="h1" size="page" tone="dark" eyebrow={t.eyebrow} title={t.title} />
            <p className="m-0 text-lead text-sand-200">{t.text}</p>
          </div>
          {/* Wrappers carry the staggered entrance; the highlighted card itself pulses. */}
          <div className="stagger grid grid-cols-[repeat(auto-fit,minmax(min(100%,290px),1fr))] gap-4 [--stagger-start:500ms]">
            {packages.map((p) => (
              <div key={p.slug} className="flex">
                <PackageCard
                  pkg={p}
                  whatsapp={settings.whatsapp}
                  as="h2"
                  className={cn("w-full", p.highlighted && "animate-glow-pulse")}
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {comparison.length > 0 && (
        <Section spacing="compact" width="wide">
          <h2 className="m-0 mb-2 text-subsection text-cocoa-900">{t.compareTitle}</h2>
          <p className="m-0 mb-6 text-[15px] text-ink-muted lg:hidden">
            Swipe the table to see all packages.
          </p>
          <div
            className="overflow-x-auto rounded-2xl border border-line bg-white lg:mt-6"
            tabIndex={0}
            role="region"
            aria-label="Package comparison"
          >
            {/* Below lg the table keeps a readable width and swipes; from lg it fits the wide column. */}
            <table
              className="w-full min-w-(--table-min) border-collapse text-sm lg:min-w-0 xl:text-[15px]"
              style={{ "--table-min": `${200 + packages.length * 120}px` } as CSSProperties}
            >
              <thead>
                <tr className="bg-cocoa-900 text-left text-cream-50">
                  <th scope="col" className="px-3 py-3.5 font-semibold xl:px-[18px]">
                    Included
                  </th>
                  {packages.map((p, i) => (
                    <th
                      key={p.slug}
                      scope="col"
                      className={cn(
                        "px-3 py-3.5 font-semibold xl:px-[18px]",
                        i === highlightIdx && "text-gold-300",
                      )}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.label} className="border-t border-line">
                    <th scope="row" className="px-3 py-[13px] xl:px-[18px] text-left font-semibold">
                      {row.label}
                    </th>
                    {row.values.map((v, i) => (
                      <td
                        key={i}
                        className={cn(
                          "px-3 py-[13px] xl:px-[18px]",
                          i === highlightIdx && "bg-cream-50",
                        )}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <Section tone="sand" spacing="compact">
        <h2 className="m-0 mb-6 text-subsection text-cocoa-900">{t.addOnsTitle}</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3">
          {addOns.map((a) => {
            const body = (
              <>
                <span className="font-serif text-[21px] text-cocoa-900">{a.name}</span>
                {a.description && (
                  <span className="text-sm leading-normal text-ink-muted">{a.description}</span>
                )}
              </>
            );
            const cls =
              "flex flex-col gap-1.5 rounded-[14px] bg-cream-50 p-5 text-ink transition-colors";
            return a.serviceSlug ? (
              <Link
                key={a.id}
                href={serviceHref(a.serviceSlug)}
                className={`${cls} hover:bg-white hover:text-ink`}
              >
                {body}
              </Link>
            ) : (
              <div key={a.id} className={cls}>
                {body}
              </div>
            );
          })}
        </div>
        <CtaPanel
          variant="bar"
          className="mt-8"
          title={t.ctaTitle}
          actions={
            <ButtonLink href="/contact" size="md">
              {t.ctaButton}
            </ButtonLink>
          }
        />
      </Section>
    </>
  );
}

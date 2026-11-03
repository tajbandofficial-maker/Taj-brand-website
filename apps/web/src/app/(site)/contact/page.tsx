import type { Metadata } from "next";

import { InquiryForm } from "@/components/site/InquiryForm";
import { LocationMap } from "@/components/site/LocationMap";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getPage, getServices, getSiteSettings } from "@/lib/api/public";
import { formatAddress, formatHours } from "@/lib/format";
import { pageMetadata } from "@/lib/page-metadata";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/whatsapp";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("contact");
}

export default async function ContactPage() {
  const [page, settings, services] = await Promise.all([
    getPage("contact"),
    getSiteSettings(),
    getServices(),
  ]);
  const t = page.text;
  const whatsappHref = buildWhatsAppUrl(settings.whatsapp, settings.whatsappDefaultMessage);
  const address = formatAddress(settings);

  return (
    <>
      <section className="relative overflow-hidden bg-cocoa-900 text-cream-50">
        <HeroBackdrop
          glows={[{ className: "size-[640px] -right-[200px] -top-[200px]", drift: [-100, 100] }]}
        />
        <Container className="relative flex flex-wrap gap-[clamp(32px,5vw,64px)] py-[clamp(36px,6vw,72px)]">
          <div className="stagger flex min-w-0 flex-[1_1_320px] flex-col gap-[18px] [--stagger-start:100ms]">
            <SectionHeader
              as="h1"
              size="page"
              tone="dark"
              eyebrow={t.eyebrow}
              title={t.title}
              description={t.text}
            />
            {/* WhatsApp + Call sit above the form (primary conversions, §6.2). */}
            <div className="mt-1.5 flex flex-col gap-2.5">
              <ButtonLink
                href={whatsappHref}
                variant="whatsapp"
                size="lg"
                fullWidth
                className="min-h-[54px] animate-ping-ring"
              >
                <WhatsAppIcon className="size-5" />
                WhatsApp us now
              </ButtonLink>
              <ButtonLink
                href={buildTelUrl(settings.phone)}
                variant="outlineGold"
                size="lg"
                fullWidth
                className="min-h-[54px]"
              >
                Call {settings.phone}
              </ButtonLink>
              {settings.altPhone && (
                <a
                  href={buildTelUrl(settings.altPhone)}
                  className="self-center py-1 text-sm font-semibold text-sand-200 hover:text-gold-300"
                >
                  or call {settings.altPhone}
                </a>
              )}
            </div>
            <div className="mt-2.5 flex flex-col gap-1.5 text-sm text-sand-200">
              <address className="not-italic">{address}</address>
              {settings.hours.map((h) => (
                <span key={h.days.join()}>{formatHours(h)}</span>
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-[1_1_400px] animate-slide-in rounded-[22px] bg-cream-50 p-[clamp(22px,4vw,36px)] text-ink shadow-[0_30px_80px_rgb(0_0_0/0.4)]">
            <InquiryForm
              tone="light"
              variant="full"
              serviceOptions={services.map((s) => ({ value: s.slug, label: s.title }))}
              sourcePage="/contact"
              whatsappHref={whatsappHref}
              submitLabel={t.formButton}
            />
          </div>
        </Container>
      </section>

      <Section spacing="compact" containerClassName="flex flex-col gap-5">
        <h2 className="m-0 text-subsection text-cocoa-900">{t.mapTitle}</h2>
        <LocationMap embedUrl={settings.mapEmbedUrl} address={address} />
        <p className="m-0 text-[15px] text-ink-muted">
          Serving {settings.serviceAreas.join(", ")}.
        </p>
      </Section>
    </>
  );
}

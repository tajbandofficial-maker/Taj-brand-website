import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FaqList } from "@/components/site/FaqList";
import { InclusionGrid } from "@/components/site/InclusionGrid";
import { PageWhatsAppMessage } from "@/components/site/PageWhatsAppMessage";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CtaPanel } from "@/components/ui/CtaPanel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Section } from "@/components/ui/Section";
import { getService, getServices, getSiteSettings } from "@/lib/api/public";
import { serviceHref } from "@/lib/navigation";
import { buildMetadata } from "@/lib/page-metadata";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// Rendered on first request and then cached — no build-time data fetching (§4.1, §6.2).
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [service, settings] = await Promise.all([getService(slug), getSiteSettings()]);
  if (!service) return {};
  return buildMetadata(settings, {
    title: service.seoTitle ?? service.h1,
    description: service.seoDescription ?? service.intro,
    path: serviceHref(slug),
    image: service.ogImage ?? service.heroImage,
    keywords: [
      service.title,
      `${service.title} Delhi`,
      ...(service.seoTitle ? [service.seoTitle] : []),
    ],
  });
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const [service, allServices, settings] = await Promise.all([
    getService(slug),
    getServices(),
    getSiteSettings(),
  ]);
  if (!service) notFound();

  const waMessage = `Hi Taj Band, I'd like a quote for ${service.title}. My wedding date is:`;
  const waHref = buildWhatsAppUrl(settings.whatsapp, waMessage);
  const related = allServices.filter((s) => s.slug !== slug);
  const [lead, ...moreSections] = service.sections;

  return (
    <>
      <PageWhatsAppMessage message={waMessage} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cocoa-900 text-cream-50">
        <HeroBackdrop
          glows={[{ className: "size-[640px] -right-[200px] -top-[220px]", drift: [-120, 90] }]}
        />
        <Container className="relative flex flex-col gap-6 pt-[clamp(20px,4vw,40px)] pb-[clamp(40px,6vw,80px)]">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
              { label: service.title },
            ]}
          />
          <div className="flex flex-wrap items-center gap-[clamp(28px,5vw,64px)]">
            <div className="stagger flex min-w-0 flex-[1_1_380px] flex-col gap-5 [--stagger-start:150ms]">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="block h-0.5 w-11 origin-left animate-bar bg-gold-500"
                />
                <Eyebrow tone="dark">{service.title}</Eyebrow>
              </div>
              <h1 className="m-0 text-page">{service.h1}</h1>
              <p className="m-0 max-w-[540px] text-lead text-sand-200">{service.intro}</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={waHref} size="lg" className="flex-[1_1_220px]">
                  Get a quote on WhatsApp
                </ButtonLink>
                <ButtonLink
                  href="/packages"
                  variant="outlineLight"
                  size="lg"
                  className="flex-[1_1_160px]"
                >
                  See packages
                </ButtonLink>
              </div>
            </div>
            <div className="relative aspect-[4/3] min-w-0 flex-[1_1_380px]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[clamp(10px,1.5vw,16px)_clamp(-16px,-1.5vw,-10px)_clamp(-16px,-1.5vw,-10px)_clamp(10px,1.5vw,16px)] animate-rise rounded-[22px] border-[1.5px] border-gold-500/70 [animation-delay:1.1s]"
              />
              <div className="absolute inset-0 animate-clip-reveal overflow-hidden rounded-[20px] shadow-[0_30px_70px_rgb(0_0_0/0.45)]">
                <div className="absolute inset-0 animate-zoom-settle">
                  <ImageFrame
                    image={service.heroImage}
                    sizes="(min-width: 860px) 560px, 100vw"
                    priority
                    className="size-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── What's included ──────────────────────────────────── */}
      <Section spacing="compact" containerClassName="flex flex-wrap gap-[clamp(32px,5vw,64px)]">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-3.5">
          <h2 className="m-0 text-subsection text-cocoa-900">
            {lead?.heading ?? "What's included"}
          </h2>
          {lead && <p className="m-0 text-base leading-[1.65] text-ink-muted">{lead.body}</p>}
          {moreSections.map((s) => (
            <div key={s.heading} className="mt-2 flex flex-col gap-2">
              <h3 className="m-0 text-2xl text-cocoa-900">{s.heading}</h3>
              <p className="m-0 text-base leading-[1.65] text-ink-muted">{s.body}</p>
            </div>
          ))}
          {service.areaCopy && (
            <p className="m-0 text-base leading-[1.65] text-ink-muted">{service.areaCopy}</p>
          )}
        </div>
        <div className="min-w-0 flex-[1_1_420px]">
          <InclusionGrid items={service.inclusions} />
        </div>
      </Section>

      {/* ── Photos ───────────────────────────────────────────── */}
      {service.gallery.length > 0 && (
        <Section spacing="flush-top">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3">
            {service.gallery.map((img) => (
              <ImageFrame
                key={img.url}
                image={img}
                sizes="(min-width: 860px) 380px, 100vw"
                className="aspect-[4/3] rounded-[14px]"
              />
            ))}
          </div>
        </Section>
      )}

      {/* ── FAQs ─────────────────────────────────────────────── */}
      {service.faqs.length > 0 && (
        <Section
          tone="sand"
          width="narrow"
          spacing="compact"
          containerClassName="flex flex-col gap-6"
        >
          <h2 className="m-0 text-subsection text-cocoa-900">Questions families ask</h2>
          <FaqList faqs={service.faqs} group={`faq-${slug}`} />
        </Section>
      )}

      {/* ── Related + CTA ────────────────────────────────────── */}
      <Section spacing="compact">
        <h2 className="m-0 mb-5 text-[clamp(26px,3.5vw,34px)] text-cocoa-900">Pairs well with</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3">
          {related.map((r) => (
            <Link
              key={r.slug}
              href={serviceHref(r.slug)}
              className="flex min-h-16 items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-5 py-[18px] font-serif text-xl text-cocoa-900 transition-colors hover:border-gold-500 hover:text-cocoa-900"
            >
              {r.title}
              <span aria-hidden="true" className="font-sans text-gold-700">
                →
              </span>
            </Link>
          ))}
        </div>
        <CtaPanel
          className="mt-10"
          title={`Book ${service.title} for your date`}
          text="Send your date and venue — we'll confirm availability within the hour."
          actions={
            <>
              <ButtonLink href={waHref} variant="whatsapp" size="lg">
                WhatsApp us
              </ButtonLink>
              <ButtonLink href={`/contact?service=${slug}`} size="lg">
                Enquiry form
              </ButtonLink>
            </>
          }
        />
      </Section>
    </>
  );
}

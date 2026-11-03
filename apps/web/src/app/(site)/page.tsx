import type { Metadata } from "next";
import Image from "next/image";

import { GalleryPreview } from "@/components/site/GalleryPreview";
import { InquiryForm } from "@/components/site/InquiryForm";
import { JourneyMap } from "@/components/site/JourneyMap";
import { Marquee } from "@/components/site/Marquee";
import { PackageCard } from "@/components/site/PackageCard";
import { ReviewCard } from "@/components/site/ReviewCard";
import { ServiceCard } from "@/components/site/ServiceCard";
import { VideoGallery } from "@/components/site/VideoGallery";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stars } from "@/components/ui/Stars";
import {
  getGallery,
  getPackages,
  getPage,
  getReviews,
  getServices,
  getSiteSettings,
} from "@/lib/api/public";
import { cn } from "@/lib/cn";
import { formatCount, formatHours, toParagraphs } from "@/lib/format";
import { FEATURED_SERVICES } from "@/lib/navigation";
import { pageMetadata } from "@/lib/page-metadata";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/whatsapp";

import logo from "../../../public/taj-band-logo.png";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("home");
}

export default async function HomePage() {
  const [page, about, settings, services, packages, gallery, reviews] = await Promise.all([
    getPage("home"),
    getPage("about"),
    getSiteSettings(),
    getServices(),
    getPackages(),
    getGallery(),
    getReviews({ featured: true }),
  ]);
  const whatsappHref = buildWhatsAppUrl(settings.whatsapp, settings.whatsappDefaultMessage);
  const galleryPreview = gallery.slice(0, 5);
  const [storyLead] = toParagraphs(about.text.story);
  const lineage = [
    about.text.gen1Name,
    about.text.gen2Name,
    about.text.gen3Name,
    about.text.gen4Name,
  ]
    .map((n) => n.trim())
    .filter(Boolean);
  const t = page.text;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cocoa-900 text-cream-50">
        <HeroBackdrop
          glows={[
            { className: "size-[720px] -left-[220px] -top-[260px]", drift: [120, 80] },
            {
              className: "size-[560px] -right-[160px] -bottom-[240px]",
              drift: [-100, -60],
              color: "sun",
            },
          ]}
        />
        <Container className="relative z-[1] flex flex-wrap items-center gap-[clamp(28px,5vw,64px)] pt-[clamp(28px,6vw,72px)] pb-[clamp(40px,6vw,80px)]">
          <div className="stagger flex min-w-0 flex-[1_1_380px] flex-col gap-[22px]">
            {(settings.googleRating !== null || settings.netflixUrl) && (
              <div className="flex flex-wrap gap-2">
                {settings.googleRating !== null && (
                  <Pill>
                    <span className="text-sun-400">★ {settings.googleRating.toFixed(1)}</span>
                    Google
                    {settings.googleReviewCount !== null &&
                      ` · ${formatCount(settings.googleReviewCount)}+ reviews`}
                  </Pill>
                )}
                {settings.netflixUrl && (
                  <Pill>
                    <span className="font-extrabold text-netflix">N</span> As featured on Netflix
                  </Pill>
                )}
              </div>
            )}
            <h1 className="m-0 text-hero tracking-[-0.01em]">
              {t.heroTitle}{" "}
              <em className="text-gold-shine animate-shine pr-[0.08em]">{t.heroAccent}</em>
            </h1>
            <p className="m-0 max-w-[520px] text-lead text-sand-200">{t.heroText}</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/contact" size="lg" className="flex-[1_1_180px]">
                {t.heroButton}
              </ButtonLink>
              <ButtonLink
                href={whatsappHref}
                variant="whatsappOutline"
                size="lg"
                className="flex-[1_1_180px]"
              >
                <span aria-hidden="true" className="size-2.5 rounded-full bg-whatsapp" />
                WhatsApp us
              </ButtonLink>
            </div>
          </div>

          <div className="relative aspect-[4/5] min-w-0 flex-[1_1_380px] animate-rise-lg [animation-delay:250ms]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-[clamp(20px,3vw,38px)] -right-[clamp(20px,3vw,38px)] size-[clamp(90px,14vw,150px)] animate-spin-slow rounded-full border-[1.5px] border-dashed border-gold-300/60"
            />
            <div className="absolute inset-0 overflow-hidden rounded-[20px] shadow-[0_30px_80px_rgb(0_0_0/0.45),0_0_0_1px_rgb(200_149_46/0.45)]">
              <div className="absolute inset-0 animate-ken-burns">
                <ImageFrame
                  image={page.heroImage ?? gallery[0]?.image ?? null}
                  sizes="(min-width: 860px) 560px, 100vw"
                  priority
                  className="size-full"
                />
              </div>
            </div>
            <div className="absolute bottom-[clamp(12px,3vw,28px)] left-[clamp(-24px,calc(860px-100vw),12px)] flex animate-float items-center gap-3 rounded-2xl bg-cream-50 py-3 pr-4 pl-3 text-cocoa-900 shadow-[0_14px_40px_rgb(0_0_0/0.35)]">
              <Image
                src={logo}
                alt=""
                width={42}
                height={42}
                className="size-[42px] object-contain"
              />
              <div className="flex flex-col leading-[1.2]">
                <span className="font-serif text-[19px]">{settings.tagline}</span>
                <span className="text-xs font-semibold text-ink-muted">
                  {settings.foundedYear
                    ? `Baraats since ${settings.foundedYear}`
                    : "Generations of baraats"}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {settings.ticker.length > 0 && <Marquee items={settings.ticker} />}

      {/* ── Legacy ───────────────────────────────────────────── */}
      {storyLead && (
        <Section tone="sand" spacing="compact">
          <div className="flex flex-wrap items-center gap-[clamp(20px,4vw,48px)]">
            {settings.foundedYear && (
              <div className="flex shrink-0 flex-col">
                <span className="text-xs font-bold tracking-[0.14em] text-gold-700 uppercase">
                  Since
                </span>
                <span className="font-serif text-[clamp(64px,10vw,112px)] leading-none text-cocoa-900">
                  {settings.foundedYear}
                </span>
              </div>
            )}
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
              <SectionHeader eyebrow={t.legacyEyebrow} title={t.legacyTitle} />
              <p className="m-0 text-base leading-[1.75] text-ink-muted">{storyLead}</p>
              {lineage.length > 0 && (
                <ol
                  aria-label={about.text.familyEyebrow}
                  className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-2.5 p-0"
                >
                  {lineage.map((name, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {i > 0 && <span aria-hidden="true" className="h-px w-5 bg-gold-500/60" />}
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border py-1 pr-3.5 pl-1 text-[13px] font-semibold",
                          i === lineage.length - 1
                            ? "border-gold-500 bg-cocoa-900 text-cream-50"
                            : "border-gold-500/40 bg-cream-50 text-cocoa-900",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex size-6 items-center justify-center rounded-full font-serif text-[11px]",
                            i === lineage.length - 1
                              ? "bg-gold-300 text-cocoa-900"
                              : "bg-cocoa-900 text-gold-300",
                          )}
                        >
                          {["I", "II", "III", "IV"][i]}
                        </span>
                        {name}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              <ArrowLink href="/about" label={t.legacyLink} className="self-start font-bold" />
            </div>
          </div>
        </Section>
      )}

      <JourneyMap areas={settings.serviceAreas} eyebrow={t.mapEyebrow} title={t.mapTitle} />

      {/* ── Services ─────────────────────────────────────────── */}
      <Section>
        <SectionHeader
          eyebrow={t.servicesEyebrow}
          title={t.servicesTitle}
          action={{ label: "All services", href: "/services" }}
          className="mb-8"
        />
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, FEATURED_SERVICES).map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </Section>

      {/* ── Packages ─────────────────────────────────────────── */}
      <Section tone="dark">
        <div className="mb-8 flex max-w-[620px] flex-col gap-2.5">
          <SectionHeader
            eyebrow={t.packagesEyebrow}
            tone="dark"
            title={t.packagesTitle}
            description={t.packagesText}
          />
          <ArrowLink
            href="/packages"
            label="Compare all packages"
            tone="dark"
            className="self-start"
          />
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
          {packages.slice(0, 3).map((p) => (
            <PackageCard key={p.slug} pkg={p} whatsapp={settings.whatsapp} variant="teaser" />
          ))}
        </div>
      </Section>

      {/* ── Gallery preview ──────────────────────────────────── */}
      <Section>
        <SectionHeader
          eyebrow={t.galleryEyebrow}
          title={t.galleryTitle}
          action={{ label: "Photos & videos", href: "/gallery" }}
          className="mb-7"
        />
        <GalleryPreview images={galleryPreview} />
      </Section>

      {/* ── Featured video ───────────────────────────────────── */}
      {page.video && (
        <Section tone="dark" spacing="compact">
          <div className="mx-auto flex max-w-[860px] flex-col gap-6">
            <SectionHeader tone="dark" eyebrow={t.videoEyebrow} title={t.videoTitle} />
            <VideoGallery videos={[page.video]} />
          </div>
        </Section>
      )}

      {/* ── Reviews ──────────────────────────────────────────── */}
      <Section tone="sand">
        <SectionHeader
          eyebrow={t.reviewsEyebrow}
          title={t.reviewsTitle}
          className="mb-8 gap-5"
          aside={
            settings.googleRating !== null && (
              <div className="flex items-center gap-3.5">
                <span className="font-serif text-[52px] leading-none text-cocoa-900">
                  {settings.googleRating.toFixed(1)}
                </span>
                <div className="flex flex-col gap-0.5">
                  <Stars
                    rating={settings.googleRating}
                    className="text-lg tracking-[2px] text-gold-600"
                  />
                  <ArrowLink
                    href="/reviews"
                    label={
                      settings.googleReviewCount !== null
                        ? `${formatCount(settings.googleReviewCount)}+ Google reviews`
                        : "Read reviews"
                    }
                    className="min-h-0 text-[13px] font-normal text-ink-muted"
                  />
                </div>
              </div>
            )
          }
        />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </Section>

      {/* ── Booking ──────────────────────────────────────────── */}
      <Section id="book">
        <div className="flex flex-wrap gap-[clamp(28px,5vw,56px)] rounded-3xl border border-gold-500 bg-cocoa-900 p-[clamp(24px,5vw,56px)] text-cream-50">
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
            <h2 className="m-0 text-section">{t.bookingTitle}</h2>
            <p className="m-0 text-base leading-relaxed text-sand-200">{t.bookingText}</p>
            <div className="mt-1.5 flex flex-col gap-2.5 text-[15px]">
              <a
                href={buildTelUrl(settings.phone)}
                className="inline-flex min-h-11 items-center self-start font-semibold text-cream-50 hover:text-gold-300"
              >
                {settings.phone}
              </a>
              {settings.altPhone && (
                <a
                  href={buildTelUrl(settings.altPhone)}
                  className="-mt-2 inline-flex min-h-11 items-center self-start font-semibold text-cream-50 hover:text-gold-300"
                >
                  {settings.altPhone}
                </a>
              )}
              {settings.hours.map((h) => (
                <span key={h.days.join()} className="text-sand-200">
                  {formatHours(h)}
                </span>
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-[1_1_340px]">
            <InquiryForm
              tone="dark"
              serviceOptions={services.map((s) => ({ value: s.slug, label: s.title }))}
              defaultServices={services[0] ? [services[0].slug] : []}
              sourcePage="/"
              whatsappHref={whatsappHref}
              submitLabel={t.bookingButton}
            />
          </div>
        </div>
      </Section>
    </>
  );
}

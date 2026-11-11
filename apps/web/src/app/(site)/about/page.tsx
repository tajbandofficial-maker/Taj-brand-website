import type { Metadata } from "next";

import { CountUp } from "@/components/site/CountUp";
import { FamilyLegacy } from "@/components/site/FamilyLegacy";
import { JourneyMap } from "@/components/site/JourneyMap";
import { Reveal } from "@/components/site/Reveal";
import { ReviewCard } from "@/components/site/ReviewCard";
import { ServiceCard } from "@/components/site/ServiceCard";
import { VideoGallery } from "@/components/site/VideoGallery";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CtaPanel } from "@/components/ui/CtaPanel";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  getGallery,
  getPage,
  getReviews,
  getServices,
  getSiteSettings,
  getVideos,
} from "@/lib/api/public";
import { env } from "@/lib/env";
import { toParagraphs } from "@/lib/format";
import { FEATURED_SERVICES } from "@/lib/navigation";
import { pageMetadata } from "@/lib/page-metadata";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("about");
}

const statClass =
  "flex flex-col gap-1 rounded-2xl border border-gold-500/50 bg-cocoa-900/45 px-6 py-5 backdrop-blur-[2px]";

export default async function AboutPage() {
  const [page, settings, services, gallery, galleryVideos, reviews] = await Promise.all([
    getPage("about"),
    getSiteSettings(),
    getServices(),
    getGallery(),
    getVideos(),
    getReviews({ featured: true }),
  ]);
  const t = page.text;
  const story = toParagraphs(t.story);
  const years = settings.foundedYear ? new Date().getFullYear() - settings.foundedYear : null;
  const [firstPhoto, ...storyPhotos] = gallery.map((g) => g.image);
  // The page's featured video leads; gallery videos fill the rest of the row.
  const videos = [
    ...(page.video ? [page.video] : []),
    ...galleryVideos.filter((v) => v.youtubeId !== page.video?.youtubeId),
  ].slice(0, 3);
  const whatsappHref = buildWhatsAppUrl(settings.whatsapp, settings.whatsappDefaultMessage);
  // Family history for search engines: founder, founding year, today's owners.
  const person = (name: string) => ({
    "@type": "Person",
    name: name.replace(/^(Sh(ri)?\.?)\s+/i, "").replace(/\s+Ji$/i, ""),
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.businessName,
    url: env.NEXT_PUBLIC_SITE_URL,
    ...(settings.foundedYear && { foundingDate: String(settings.foundedYear) }),
    ...(t.gen1Name.trim() && { founder: person(t.gen1Name) }),
    ...(t.gen4Name.trim() && { employee: { ...person(t.gen4Name), jobTitle: t.gen4Role } }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cocoa-900 text-cream-50">
        <HeroBackdrop
          glows={[
            { className: "size-[640px] -left-[200px] -top-[260px]", drift: [120, 60] },
            {
              className: "size-[520px] -right-[160px] -bottom-[260px]",
              drift: [-80, -40],
              color: "sun",
            },
          ]}
        />
        <Container className="relative flex flex-wrap items-center gap-[clamp(28px,5vw,64px)] py-[clamp(36px,6vw,72px)]">
          <div className="stagger flex min-w-0 flex-[1_1_380px] flex-col gap-[18px] [--stagger-start:100ms]">
            {settings.foundedYear && (
              <div className="flex">
                <Pill>
                  <span className="text-sun-400">★</span> Since {settings.foundedYear}
                </Pill>
              </div>
            )}
            <SectionHeader
              as="h1"
              size="page"
              tone="dark"
              eyebrow={t.heroEyebrow}
              title={
                <>
                  {t.heroTitle}{" "}
                  <em className="text-gold-shine animate-shine pr-[0.08em]">{t.heroAccent}</em>
                </>
              }
            />
            <p className="m-0 font-serif text-[clamp(22px,3vw,30px)] leading-tight text-gold-300">
              {t.heroTagline}
            </p>
            <p className="m-0 max-w-[520px] text-lead text-sand-200">{t.heroText}</p>
          </div>
          <div className="relative aspect-[4/3] min-w-0 flex-[1_1_380px] animate-rise-lg [animation-delay:250ms]">
            <div className="absolute inset-0 overflow-hidden rounded-[20px] shadow-[0_30px_80px_rgb(0_0_0/0.45),0_0_0_1px_rgb(200_149_46/0.45)]">
              <ImageFrame
                image={page.heroImage ?? firstPhoto ?? null}
                sizes="(min-width: 860px) 560px, 100vw"
                priority
                className="size-full"
              />
            </div>
          </div>
        </Container>

        {/* ── Numbers — inside the hero so its glow and dot pattern run behind them ── */}
        {(settings.foundedYear || settings.googleReviewCount !== null) && (
          <Container className="relative pb-[clamp(48px,7vw,88px)]">
            <div className="stagger grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3 [--stagger-start:400ms]">
              {settings.foundedYear && (
                <div className={statClass}>
                  <span className="font-serif text-[44px] leading-none">
                    {settings.foundedYear}
                  </span>
                  <span className="text-[13px] text-sand-200">The year it all began</span>
                </div>
              )}
              {years !== null && years > 0 && (
                <div className={statClass}>
                  <span className="font-serif text-[44px] leading-none">
                    <CountUp to={years} />+
                  </span>
                  <span className="text-[13px] text-sand-200">Years of baraats</span>
                </div>
              )}
              {settings.googleReviewCount !== null && (
                <div className={statClass}>
                  <span className="font-serif text-[44px] leading-none">
                    <CountUp to={settings.googleReviewCount} />+
                  </span>
                  <span className="text-[13px] text-sand-200">Google reviews</span>
                </div>
              )}
              {services.length > 0 && (
                <div className={statClass}>
                  <span className="font-serif text-[44px] leading-none">{services.length}</span>
                  <span className="text-[13px] text-sand-200">Services under one roof</span>
                </div>
              )}
            </div>
          </Container>
        )}
      </section>

      {/* ── Story ────────────────────────────────────────────── */}
      {story.length > 0 && (
        <Section containerClassName="flex flex-wrap items-center gap-[clamp(28px,5vw,64px)]">
          <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-5">
            <SectionHeader eyebrow={t.storyEyebrow} title={t.storyTitle} />
            {story.map((p, i) => (
              <p key={i} className="m-0 text-base leading-[1.75] text-ink-muted">
                {p}
              </p>
            ))}
          </div>
          {storyPhotos.length > 0 && (
            <Reveal className="grid min-w-0 flex-[1_1_380px] grid-cols-2 gap-3">
              {storyPhotos.slice(0, 3).map((img, i) => (
                <ImageFrame
                  key={img?.url ?? i}
                  image={img}
                  sizes="(min-width: 860px) 280px, 50vw"
                  className={
                    i === 0
                      ? "col-span-2 aspect-[16/9] rounded-[18px]"
                      : "aspect-square rounded-[18px]"
                  }
                />
              ))}
            </Reveal>
          )}
        </Section>
      )}

      {/* ── Four generations ─────────────────────────────────── */}
      <FamilyLegacy
        eyebrow={t.familyEyebrow}
        title={t.familyTitle}
        accent={t.familyAccent}
        text={t.familyText}
        since={settings.foundedYear}
        photo={{
          src: "/photos/taj-band-early-years.jpg",
          alt: "Vintage black-and-white photo of the Taj Band brass band in uniform with their horns and drums, in front of a building with a Taj Band sign",
          width: 1110,
          height: 960,
          caption: "Where it all began — the early Taj Band",
        }}
        generations={[
          { role: t.gen1Role, name: t.gen1Name, text: t.gen1Text },
          { role: t.gen2Role, name: t.gen2Name, text: t.gen2Text },
          { role: t.gen3Role, name: t.gen3Name, text: t.gen3Text },
          { role: t.gen4Role, name: t.gen4Name, text: t.gen4Text },
        ]}
      />

      {/* ── Why choose us ─────────────────────────────────────── */}
      <Section tone="sand" spacing="compact">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-4 text-center">
          <SectionHeader
            eyebrow={t.whyEyebrow}
            title={t.whyTitle}
            className="justify-center [&>div]:items-center"
          />
          <p className="m-0 text-lead text-ink-muted">{t.whyText}</p>
        </div>
      </Section>

      <JourneyMap areas={settings.serviceAreas} eyebrow={t.mapEyebrow} title={t.mapTitle} />

      {/* ── What we bring ────────────────────────────────────── */}
      {services.length > 0 && (
        <Section tone="sand">
          <SectionHeader
            eyebrow={t.servicesEyebrow}
            title={t.servicesTitle}
            description={t.servicesText}
            action={{ label: "All services", href: "/services" }}
            className="mb-8"
          />
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {services.slice(0, FEATURED_SERVICES).map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </Section>
      )}

      {/* ── Trailers ─────────────────────────────────────────── */}
      {videos.length > 0 && (
        <Section tone="dark" spacing="compact">
          <SectionHeader
            tone="dark"
            size="sub"
            eyebrow={t.videosEyebrow}
            title={t.videosTitle}
            action={{ label: "More in the gallery", href: "/gallery" }}
            className="mb-6"
          />
          <VideoGallery
            videos={videos}
            className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4"
          />
        </Section>
      )}

      {/* ── Reviews + CTA ────────────────────────────────────── */}
      <Section spacing="compact">
        {reviews.length > 0 && (
          <>
            <SectionHeader
              size="sub"
              title={t.reviewsTitle}
              action={{ label: "All reviews", href: "/reviews" }}
              className="mb-6"
            />
            <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
              {reviews.slice(0, 3).map((r) => (
                <ReviewCard key={r.id} review={r} surface="white" />
              ))}
            </div>
          </>
        )}
        <CtaPanel
          title={t.ctaTitle}
          text={t.ctaText}
          actions={
            <>
              <ButtonLink href="/contact">Check your date</ButtonLink>
              <ButtonLink href={whatsappHref} variant="whatsappOutline">
                WhatsApp us
              </ButtonLink>
            </>
          }
        />
      </Section>
    </>
  );
}

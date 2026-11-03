import type { Metadata } from "next";

import { CountUp } from "@/components/site/CountUp";
import { ReviewCard } from "@/components/site/ReviewCard";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CtaPanel } from "@/components/ui/CtaPanel";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stars } from "@/components/ui/Stars";
import {
  getHighProfileReviews,
  getPage,
  getReviews,
  getSiteSettings,
  getVideos,
} from "@/lib/api/public";
import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("reviews");
}

const tileClass = "flex flex-col gap-1 rounded-2xl border border-gold-500/50 px-6 py-5";

export default async function ReviewsPage() {
  const [page, settings, reviews, highProfile, videos] = await Promise.all([
    getPage("reviews"),
    getSiteSettings(),
    getReviews(),
    getHighProfileReviews(),
    getVideos(),
  ]);
  const netflixStill =
    videos.find((v) => v.title.toLowerCase().includes("netflix"))?.poster ?? null;
  const t = page.text;
  const hasTiles = settings.googleRating !== null || Boolean(settings.netflixUrl);

  return (
    <>
      <section className="relative overflow-hidden bg-cocoa-900 text-cream-50">
        <HeroBackdrop
          glows={[{ className: "size-[640px] -left-[220px] -bottom-[320px]", drift: [140, -80] }]}
        />
        <Container className="relative flex flex-wrap items-end justify-between gap-8 py-[clamp(36px,6vw,72px)]">
          <div className="stagger max-w-[620px] [--stagger-start:100ms]">
            <SectionHeader as="h1" size="page" tone="dark" eyebrow={t.eyebrow} title={t.title} />
          </div>
          {hasTiles && (
            <div className="stagger flex flex-wrap gap-3 [--stagger-start:350ms]">
              {settings.googleRating !== null && (
                <div className={tileClass}>
                  <span className="font-serif text-[44px] leading-none">
                    <CountUp to={settings.googleRating} decimals={1} />
                  </span>
                  <Stars rating={settings.googleRating} animated className="text-sun-400" />
                  {settings.googleReviewCount !== null && (
                    <span className="text-[13px] text-sand-200">
                      <CountUp to={settings.googleReviewCount} />+ Google reviews
                    </span>
                  )}
                </div>
              )}
              {settings.netflixUrl && (
                <div className={tileClass}>
                  <span
                    aria-hidden="true"
                    className="inline-block origin-left animate-pulse-n font-serif text-[44px] leading-none text-netflix"
                  >
                    N
                  </span>
                  <span className="text-[15px] font-semibold">Featured on Netflix</span>
                </div>
              )}
            </div>
          )}
        </Container>
      </section>

      {settings.netflixUrl && (
        <Section
          spacing="compact"
          containerClassName="flex flex-wrap items-center gap-[clamp(28px,5vw,56px)]"
        >
          <ImageFrame
            image={netflixStill}
            sizes="(min-width: 860px) 600px, 100vw"
            placeholder="Netflix feature still"
            className="aspect-[16/10] min-w-0 flex-[1_1_380px] rounded-[18px]"
          />
          <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-3.5">
            <h2 className="m-0 text-subsection text-cocoa-900">As seen on Netflix</h2>
            {settings.netflixBlurb && (
              <p className="m-0 text-base leading-[1.65] text-ink-muted">{settings.netflixBlurb}</p>
            )}
            <ArrowLink
              href={settings.netflixUrl}
              label="Watch on Netflix"
              className="self-start font-bold"
            />
          </div>
        </Section>
      )}

      {highProfile.length > 0 && (
        <Section tone="sand" spacing="compact">
          <h2 className="m-0 mb-6 text-subsection text-cocoa-900">
            Celebrity &amp; high-profile weddings
          </h2>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3 p-0">
            {highProfile.map((c) => (
              <li key={c.id} className="flex flex-col gap-2.5 rounded-2xl bg-cream-50 p-3.5">
                <ImageFrame
                  image={c.image}
                  sizes="(min-width: 1000px) 260px, 50vw"
                  placeholder="Photo with client"
                  className="aspect-square rounded-xl"
                />
                <span className="px-1 text-base font-bold">{c.author}</span>
                {c.meta && <span className="px-1 pb-1 text-[13px] text-ink-muted">{c.meta}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section spacing="compact">
        <SectionHeader
          size="sub"
          title={t.listTitle}
          action={
            settings.googleProfileUrl
              ? { label: "Read all on Google", href: settings.googleProfileUrl }
              : undefined
          }
          className="mb-6"
        />
        <div className="gap-4 [columns:3_280px]">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              surface="white"
              showSource
              className="mb-4 break-inside-avoid"
            />
          ))}
        </div>
        <CtaPanel
          variant="bar"
          className="mt-6"
          title={t.ctaTitle}
          actions={<ButtonLink href="/contact">Check your date</ButtonLink>}
        />
      </Section>
    </>
  );
}

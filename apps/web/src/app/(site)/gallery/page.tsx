import type { Metadata } from "next";

import { GalleryBento } from "@/components/site/GalleryBento";
import { VideoCard } from "@/components/site/VideoCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getGallery, getPage, getVideos } from "@/lib/api/public";
import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("gallery");
}

export default async function GalleryPage() {
  const [page, images, videos] = await Promise.all([getPage("gallery"), getGallery(), getVideos()]);
  const t = page.text;

  return (
    <>
      <Container className="pt-[clamp(36px,6vw,72px)] pb-[clamp(48px,7vw,80px)]">
        <div className="stagger [--stagger-start:80ms]">
          <SectionHeader as="h1" size="page" eyebrow={t.eyebrow} title={t.title} />
        </div>
        <div className="mt-3.5">
          <GalleryBento images={images} />
        </div>
      </Container>

      {videos.length > 0 && (
        <Section tone="dark" spacing="compact">
          <SectionHeader
            tone="dark"
            size="sub"
            title={t.videosTitle}
            description={t.videosText}
            className="mb-6"
          />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

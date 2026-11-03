import type { Metadata } from "next";

import { Reveal } from "@/components/site/Reveal";
import { ServiceRow } from "@/components/site/ServiceRow";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getPage, getServices } from "@/lib/api/public";
import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("services");
}

export default async function ServicesPage() {
  const [page, services] = await Promise.all([getPage("services"), getServices()]);
  const t = page.text;

  return (
    <>
      <section className="relative overflow-hidden bg-cocoa-900 text-cream-50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -bottom-10 animate-drift font-serif text-[clamp(140px,22vw,300px)] leading-none whitespace-nowrap text-transparent [--drift-x:-35%] [--drift-y:0px] [-webkit-text-stroke:1.5px_rgb(232_196_104/0.28)] [animation-duration:40s]"
        >
          {t.backdrop}
        </div>
        <Container className="stagger relative flex flex-col gap-4 pt-[clamp(36px,6vw,72px)] pb-[clamp(56px,8vw,110px)] [--stagger-start:100ms]">
          <SectionHeader
            as="h1"
            size="page"
            tone="dark"
            eyebrow={t.eyebrow}
            title={t.title}
            className="[&>div]:max-w-[760px]"
          />
          <p className="m-0 max-w-[600px] text-lead text-sand-200">{t.text}</p>
        </Container>
      </section>

      <Container className="flex flex-col gap-5 py-[clamp(40px,6vw,80px)]">
        {services.map((s, i) => (
          <Reveal key={s.slug}>
            <ServiceRow service={s} priority={i === 0} />
          </Reveal>
        ))}
      </Container>
    </>
  );
}

"use client";

import {
  type AdminPage,
  type AdminSettings,
  type PageDef,
  pageDefs,
  type PageFieldDef,
  type PageKey,
  parseYouTubeId,
} from "@taj/types";
import type { FormikErrors } from "formik";

import { blankToNull } from "@/lib/admin/form";
import { useSettings } from "@/lib/admin/queries";
import { useEntityForm } from "@/lib/admin/use-entity-form";

import { EntityForm } from "../EntityForm";
import { MediaField } from "../fields/MediaField";
import { TextAreaField } from "../fields/TextAreaField";
import { TextField } from "../fields/TextField";
import { PageHeader } from "../PageHeader";
import { Panel } from "../Panel";

type Values = {
  fields: Record<string, string>;
  heroImageId: string | null;
  youtube: string;
  seoTitle: string;
  seoDescription: string;
  ogImageId: string | null;
};

/** Fields grouped by their `section`, in the order they appear on the page. */
function sections(def: PageDef): [string, [string, PageFieldDef][]][] {
  const groups = new Map<string, [string, PageFieldDef][]>();
  for (const entry of Object.entries(def.fields)) {
    const list = groups.get(entry[1].section) ?? [];
    list.push(entry);
    groups.set(entry[1].section, list);
  }
  return [...groups];
}

export function PageForm({ pageKey }: { pageKey: PageKey }) {
  const def: PageDef = pageDefs[pageKey];

  const { formik, query } = useEntityForm<AdminPage, Values>({
    resource: "pages",
    id: pageKey,
    // Inputs start with the text the site shows now: the saved value, else the default.
    toValues: (p) => ({
      fields: Object.fromEntries(
        Object.entries(def.fields).map(([k, f]) => [k, p?.fields[k] ?? f.default]),
      ),
      heroImageId: p?.heroImageId ?? null,
      youtube: p?.youtubeId ? `https://www.youtube.com/watch?v=${p.youtubeId}` : "",
      seoTitle: p?.seoTitle ?? "",
      seoDescription: p?.seoDescription ?? "",
      ogImageId: p?.ogImageId ?? null,
    }),
    // Text equal to the default is stored blank, so it follows future default changes.
    toPayload: (v) => ({
      ...blankToNull({ seoTitle: v.seoTitle, seoDescription: v.seoDescription }, [
        "seoTitle",
        "seoDescription",
      ]),
      fields: Object.fromEntries(
        Object.entries(v.fields).map(([k, text]) => [
          k,
          text.trim() === def.fields[k]?.default ? "" : text,
        ]),
      ),
      heroImageId: v.heroImageId,
      ogImageId: v.ogImageId,
      youtubeId: v.youtube.trim() ? parseYouTubeId(v.youtube) : null,
    }),
    validate: (v) => {
      const e: FormikErrors<Values> = {};
      if (v.youtube.trim() && !parseYouTubeId(v.youtube))
        e.youtube = "Paste a YouTube link, e.g. https://youtu.be/…";
      return e;
    },
    listHref: "/admin/pages",
    noun: "Page",
  });
  const { values } = formik;
  const site = useSettings<AdminSettings>().data;
  const siteTitle = site?.seoSiteTitle ?? "";
  // Same rules as the site: home shows its title alone; other pages add " | <business name>".
  const defaultTitle = pageKey === "home" ? siteTitle : def.seo.title;
  const seoTitle = values.seoTitle.trim() || defaultTitle;
  const fullTitle = pageKey === "home" ? seoTitle : `${seoTitle} | ${site?.businessName ?? ""}`;
  const seoDescription = values.seoDescription.trim() || def.seo.description;
  const shareFallback = def.heroImage
    ? "the main photo, else the site's default share image"
    : "the site's default share image (Site settings)";

  return (
    <>
      <PageHeader
        title={`${def.label} page`}
        description={`Everything editable on ${def.path}. Clear a box to go back to the original text.`}
        back={{ href: "/admin/pages", label: "All pages" }}
      />
      <EntityForm
        formik={formik}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        cancelHref="/admin/pages"
        viewHref={def.path}
      >
        {(def.heroImage || def.video) && (
          <Panel title="Photo & video">
            {def.heroImage && (
              <MediaField
                name="heroImageId"
                label="Main photo"
                help={def.heroImage.help}
                initialMedia={query.data?.heroImage ?? null}
              />
            )}
            {def.video && (
              <TextField
                name="youtube"
                label="Featured YouTube video (optional)"
                type="url"
                placeholder="https://youtu.be/…"
                help={def.video.help}
              />
            )}
          </Panel>
        )}

        {sections(def).map(([section, fields]) => (
          <Panel key={section} title={section}>
            {fields.map(([k, f]) =>
              f.multiline ? (
                <TextAreaField
                  key={k}
                  name={`fields.${k}`}
                  label={f.label}
                  help={f.help}
                  maxLength={f.max}
                  rows={f.max > 1000 ? 10 : 3}
                  placeholder={f.default}
                />
              ) : (
                <TextField
                  key={k}
                  name={`fields.${k}`}
                  label={f.label}
                  help={f.help}
                  maxLength={f.max}
                  placeholder={f.default}
                />
              ),
            )}
          </Panel>
        ))}

        <Panel
          title="Google & sharing (SEO)"
          description="How this page appears in Google results and when shared on WhatsApp or Facebook. Leave empty to use the defaults shown in grey."
        >
          <TextField
            name="seoTitle"
            label="Search title"
            maxLength={70}
            placeholder={defaultTitle}
            help={`${fullTitle.length}/60 characters recommended (full title as Google shows it).`}
          />
          <TextAreaField
            name="seoDescription"
            label="Search description"
            rows={3}
            maxLength={170}
            placeholder={def.seo.description}
            help={`${seoDescription.length}/155 characters recommended.`}
          />
          <MediaField
            name="ogImageId"
            label="Share image (optional)"
            help={`Shown when the link is shared on WhatsApp or Facebook. Empty = ${shareFallback}. Best size 1200 × 630.`}
            initialMedia={query.data?.ogImage ?? null}
          />
          <div className="flex flex-col gap-1 rounded-lg border border-line bg-cream-50 p-4">
            <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
              Google preview
            </span>
            <span className="text-[13px] text-ink-muted">
              {site?.businessName} › {def.path}
            </span>
            <span className="text-lg leading-snug text-[#1a0dab]">{fullTitle}</span>
            <span className="text-sm leading-relaxed text-ink">{seoDescription}</span>
          </div>
        </Panel>
      </EntityForm>
    </>
  );
}

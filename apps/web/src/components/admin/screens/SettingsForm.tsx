"use client";

import type { AdminSettings } from "@taj/types";
import { FieldArray, type FormikErrors, FormikProvider, useFormik } from "formik";
import { Plus, Save, X } from "lucide-react";

import { AdminApiError, splitFieldErrors } from "@/lib/admin/api";
import { blankToNull, required, toNumberOrNull } from "@/lib/admin/form";
import { useSaveSettings, useSettings } from "@/lib/admin/queries";
import { useAdminUi } from "@/stores/admin-ui-store";

import { AdminButton } from "../AdminButton";
import { ListField } from "../fields/ListField";
import { MediaField } from "../fields/MediaField";
import { TextAreaField } from "../fields/TextAreaField";
import { TextField } from "../fields/TextField";
import { PageHeader } from "../PageHeader";
import { Panel } from "../Panel";
import { ErrorState, LoadingState } from "../States";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Values = {
  businessName: string;
  tagline: string;
  phone: string;
  altPhone: string;
  whatsapp: string;
  email: string;
  whatsappDefaultMessage: string;
  addressLine: string;
  city: string;
  postalCode: string;
  mapEmbedUrl: string;
  hours: { days: string[]; opens: string; closes: string }[];
  googleRating: string;
  googleReviewCount: string;
  googleProfileUrl: string;
  foundedYear: string;
  weddingsPerformed: string;
  netflixUrl: string;
  netflixBlurb: string;
  seoSiteTitle: string;
  seoDescription: string;
  ogImageId: string | null;
  instagram: string;
  facebook: string;
  youtube: string;
  serviceAreas: string[];
  ticker: string[];
};

const str = (n: number | null) => (n === null ? "" : String(n));

const toValues = (s?: AdminSettings): Values => ({
  businessName: s?.businessName ?? "",
  tagline: s?.tagline ?? "",
  phone: s?.phone ?? "",
  altPhone: s?.altPhone ?? "",
  whatsapp: s?.whatsapp ?? "",
  email: s?.email ?? "",
  whatsappDefaultMessage: s?.whatsappDefaultMessage ?? "",
  addressLine: s?.addressLine ?? "",
  city: s?.city ?? "",
  postalCode: s?.postalCode ?? "",
  mapEmbedUrl: s?.mapEmbedUrl ?? "",
  hours: s?.hours ?? [],
  googleRating: str(s?.googleRating ?? null),
  googleReviewCount: str(s?.googleReviewCount ?? null),
  googleProfileUrl: s?.googleProfileUrl ?? "",
  foundedYear: str(s?.foundedYear ?? null),
  weddingsPerformed: str(s?.weddingsPerformed ?? null),
  netflixUrl: s?.netflixUrl ?? "",
  netflixBlurb: s?.netflixBlurb ?? "",
  seoSiteTitle: s?.seoSiteTitle ?? "",
  seoDescription: s?.seoDescription ?? "",
  ogImageId: s?.ogImageId ?? null,
  instagram: s?.socials.instagram ?? "",
  facebook: s?.socials.facebook ?? "",
  youtube: s?.socials.youtube ?? "",
  serviceAreas: s?.serviceAreas ?? [],
  ticker: s?.ticker ?? [],
});

const GOOGLE_MAPS = /^https:\/\/(www\.|maps\.)?google\.[a-z.]+\/maps/;

/** Accepts a link or Google's whole `<iframe src="…">` embed code; returns the link. */
const mapSrc = (input: string) => input.match(/src="([^"]+)"/)?.[1] ?? input.trim();

function validate(v: Values): FormikErrors<Values> {
  const e: Record<string, string | undefined> = {
    businessName: required(v.businessName, "Business name"),
    seoSiteTitle: required(v.seoSiteTitle, "Site title"),
    phone: required(v.phone, "Phone"),
    addressLine: required(v.addressLine, "Address"),
    city: required(v.city, "City"),
    whatsapp: /^\d{10,15}$/.test(v.whatsapp)
      ? undefined
      : "Digits only with country code, e.g. 919876543210",
    mapEmbedUrl:
      v.mapEmbedUrl.trim() && !GOOGLE_MAPS.test(mapSrc(v.mapEmbedUrl))
        ? "Paste a Google Maps link or the embed code from Google Maps → Share → Embed a map"
        : undefined,
    googleRating:
      v.googleRating && !(Number(v.googleRating) >= 1 && Number(v.googleRating) <= 5)
        ? "Between 1 and 5, e.g. 4.9"
        : undefined,
  };
  return Object.fromEntries(Object.entries(e).filter(([, m]) => m)) as FormikErrors<Values>;
}

function toPayload(v: Values) {
  const { instagram, facebook, youtube, ...rest } = blankToNull(v, [
    "email",
    "altPhone",
    "postalCode",
    "mapEmbedUrl",
    "googleProfileUrl",
    "netflixUrl",
    "netflixBlurb",
    "seoDescription",
  ]);
  const socials = Object.fromEntries(
    Object.entries({ instagram, facebook, youtube }).filter(
      ([, url]) => typeof url === "string" && url.trim(),
    ),
  );
  return {
    ...rest,
    mapEmbedUrl: v.mapEmbedUrl.trim() ? mapSrc(v.mapEmbedUrl) : null,
    googleRating: toNumberOrNull(v.googleRating),
    googleReviewCount: toNumberOrNull(v.googleReviewCount),
    foundedYear: toNumberOrNull(v.foundedYear),
    weddingsPerformed: toNumberOrNull(v.weddingsPerformed),
    socials,
    serviceAreas: v.serviceAreas.map((s) => s.trim()).filter(Boolean),
    ticker: v.ticker.map((s) => s.trim()).filter(Boolean),
  };
}

export function SettingsForm() {
  const settings = useSettings<AdminSettings>();
  const save = useSaveSettings<AdminSettings>();
  const toast = useAdminUi((s) => s.toast);

  const formik = useFormik<Values>({
    initialValues: toValues(settings.data),
    enableReinitialize: true,
    validate,
    onSubmit: async (values, helpers) => {
      try {
        await save.mutateAsync(toPayload(values));
        toast("success", "Settings saved — the whole website refreshes within seconds");
      } catch (err) {
        if (err instanceof AdminApiError) {
          const { fieldErrors, rest } = splitFieldErrors(err.messages, Object.keys(values));
          helpers.setErrors(fieldErrors);
          toast("error", rest.join(" ") || "Please fix the highlighted fields.");
        } else toast("error", "Could not save settings.");
      }
    },
  });

  if (settings.isLoading) return <LoadingState />;
  if (settings.error)
    return <ErrorState error={settings.error} onRetry={() => void settings.refetch()} />;

  return (
    <>
      <PageHeader
        title="Site settings"
        description="Contact details, hours and trust badges used across every page of the website."
      />
      <FormikProvider value={formik}>
        <form noValidate onSubmit={formik.handleSubmit} className="flex flex-col gap-5 pb-24">
          <Panel title="Business">
            <div className="grid gap-5 md:grid-cols-2">
              <TextField name="businessName" label="Business name" required maxLength={80} />
              <TextField name="tagline" label="Tagline" maxLength={80} />
            </div>
          </Panel>

          <Panel title="Contact" description="Used by every Call and WhatsApp button on the site.">
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                name="phone"
                label="Phone (as shown)"
                required
                maxLength={30}
                help="e.g. +91 98765 43210"
              />
              <TextField
                name="altPhone"
                label="Second phone (optional)"
                maxLength={30}
                help="Shown next to the main number on the Contact page and footer."
              />
              <TextField
                name="whatsapp"
                label="WhatsApp number"
                required
                inputMode="numeric"
                help="Digits only with country code: 919876543210"
              />
              <TextField name="email" label="Email (optional)" type="email" maxLength={120} />
            </div>
            <TextAreaField
              name="whatsappDefaultMessage"
              label="Default WhatsApp message"
              rows={2}
              maxLength={300}
              help="Pre-filled when a visitor taps WhatsApp."
            />
          </Panel>

          <Panel title="Address & hours">
            <TextField name="addressLine" label="Address" required maxLength={200} />
            <div className="grid gap-5 md:grid-cols-2">
              <TextField name="city" label="City" required maxLength={80} />
              <TextField name="postalCode" label="PIN code" maxLength={12} />
            </div>
            <TextField
              name="mapEmbedUrl"
              label="Google Maps location (optional)"
              help={
                <>
                  Shown as a map on the Contact page. In Google Maps open your business → Share →
                  Embed a map → Copy HTML, and paste it here (the whole code is fine). Or use{" "}
                  <code>https://www.google.com/maps?q=Your+Business+Name&amp;output=embed</code>.
                </>
              }
            />
            <FieldArray name="hours">
              {({ push, remove }) => (
                <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
                  <legend className="mb-1.5 p-0 text-sm font-semibold">Opening hours</legend>
                  {formik.values.hours.map((h, i) => (
                    <div key={i} className="flex flex-col gap-3 rounded-lg border border-line p-3">
                      <div
                        className="flex flex-wrap gap-1.5"
                        role="group"
                        aria-label={`Days for hours row ${i + 1}`}
                      >
                        {DAYS.map((d) => {
                          const on = h.days.includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              aria-pressed={on}
                              onClick={() =>
                                void formik.setFieldValue(
                                  `hours.${i}.days`,
                                  on
                                    ? h.days.filter((x) => x !== d)
                                    : DAYS.filter((x) => x === d || h.days.includes(x)),
                                )
                              }
                              className={`min-h-9 cursor-pointer rounded-full border px-3 text-sm font-semibold ${
                                on
                                  ? "border-cocoa-900 bg-cocoa-900 text-cream-50"
                                  : "border-sand-300 bg-white"
                              }`}
                            >
                              {d.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap items-end gap-3">
                        <TextField name={`hours.${i}.opens`} label="Opens" type="time" />
                        <TextField name={`hours.${i}.closes`} label="Closes" type="time" />
                        <AdminButton size="sm" variant="ghost" onClick={() => remove(i)}>
                          <X aria-hidden="true" className="size-4" />
                          Remove
                        </AdminButton>
                      </div>
                    </div>
                  ))}
                  <AdminButton
                    size="sm"
                    className="self-start"
                    onClick={() => push({ days: [...DAYS], opens: "09:00", closes: "22:00" })}
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    Add hours
                  </AdminButton>
                </fieldset>
              )}
            </FieldArray>
            <ListField
              name="serviceAreas"
              label="Areas served"
              addLabel="Add area"
              maxLength={60}
              help="Each major Indian city gets its own heart on the home and About page map."
            />
          </Panel>

          <Panel
            title="Trust badges"
            description="Shown on the home and reviews pages. Leave a field empty to hide that badge — only enter real, verifiable figures."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <TextField
                name="googleRating"
                label="Google rating"
                inputMode="decimal"
                placeholder="4.9"
              />
              <TextField
                name="googleReviewCount"
                label="Google review count"
                inputMode="numeric"
                placeholder="1200"
              />
              <TextField name="foundedYear" label="Founded (year)" inputMode="numeric" />
            </div>
            <TextField name="googleProfileUrl" label="Google reviews link" type="url" />
            <TextField name="weddingsPerformed" label="Weddings performed" inputMode="numeric" />
            <TextField
              name="netflixUrl"
              label="Netflix feature link"
              type="url"
              help="Shows the “As featured on Netflix” badge and section."
            />
            <TextAreaField
              name="netflixBlurb"
              label="Netflix feature description"
              rows={2}
              maxLength={300}
              help="Which show, and what Taj Band played."
            />
          </Panel>

          <Panel
            title="Home page ticker"
            description="Page headings, photos, videos and SEO are under Pages in the menu."
          >
            <ListField name="ticker" label="Gold ticker words" addLabel="Add word" maxLength={40} />
          </Panel>

          <Panel
            title="Google & sharing (site-wide)"
            description="Defaults for every page. Each page and service can override them in its own Google & sharing section."
          >
            <TextField
              name="seoSiteTitle"
              label="Site title"
              required
              maxLength={70}
              help={`The home page title in Google. Other pages end with the business name instead (“About Us | ${formik.values.businessName || "…"}”), keeping titles short.`}
            />
            <TextAreaField
              name="seoDescription"
              label="Default search description"
              rows={3}
              maxLength={170}
              help="Used when a page has no description of its own. Aim for ~155 characters."
            />
            <MediaField
              name="ogImageId"
              label="Default share image"
              help="Shown when a link is shared on WhatsApp, Facebook or X and the page has no photo of its own. Best size 1200 × 630."
              initialMedia={settings.data?.ogImage ?? null}
            />
          </Panel>

          <Panel title="Social media (optional)">
            <div className="grid gap-5 md:grid-cols-3">
              <TextField name="instagram" label="Instagram link" type="url" />
              <TextField name="facebook" label="Facebook link" type="url" />
              <TextField name="youtube" label="YouTube link" type="url" />
            </div>
          </Panel>

          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur lg:left-64">
            <div className="mx-auto flex max-w-6xl px-4 py-3 sm:px-6">
              <AdminButton type="submit" variant="primary" disabled={formik.isSubmitting}>
                <Save aria-hidden="true" className="size-4" />
                {formik.isSubmitting ? "Saving…" : "Save settings"}
              </AdminButton>
            </div>
          </div>
        </form>
      </FormikProvider>
    </>
  );
}

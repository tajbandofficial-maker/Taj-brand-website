"use client";

import { emptyInquiryForm, type InquiryFormValues, validateInquiryForm } from "@taj/types/inquiry";
import { useFormik } from "formik";
import { useEffect, useId, useRef } from "react";

import { submitInquiry } from "@/actions/submit-inquiry";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChipGroup } from "@/components/ui/form/ChipGroup";
import { TextAreaField } from "@/components/ui/form/TextAreaField";
import { TextField } from "@/components/ui/form/TextField";
import { cn } from "@/lib/cn";
import { type InquiryDraft, isDraftEmpty, useInquiryStore } from "@/stores/inquiry-store";

import { WhatsAppIcon } from "./WhatsAppIcon";

type Status = { kind: "success" } | { kind: "error"; message: string } | undefined;

type Props = {
  /** "dark" = home booking band, "light" = contact page card. */
  tone: "dark" | "light";
  /** "full" adds the visible heading, services legend and message box. */
  variant?: "compact" | "full";
  /** The "Enquiry form" heading of the full variant; off when a dialog titles it. */
  showHeading?: boolean;
  serviceOptions: { value: string; label: string }[];
  defaultServices?: string[];
  sourcePage: string;
  whatsappHref: string;
  submitLabel: string;
};

function pickDraft(v: InquiryFormValues): InquiryDraft {
  const { name, phone, email, weddingDate, venue, services, message } = v;
  return { name, phone, email, weddingDate, venue, services, message };
}

export function InquiryForm({
  tone,
  variant = "compact",
  showHeading = variant === "full",
  serviceOptions,
  defaultServices = [],
  sourcePage,
  whatsappHref,
  submitLabel,
}: Props) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const draftReady = useRef(false);
  const saveDraft = useInquiryStore((s) => s.saveDraft);
  const clearDraft = useInquiryStore((s) => s.clearDraft);

  const formik = useFormik<InquiryFormValues>({
    initialValues: { ...emptyInquiryForm, services: defaultServices, sourcePage },
    validate: validateInquiryForm,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      const result = await submitInquiry(values);
      if (result.ok) {
        clearDraft();
        helpers.setStatus({ kind: "success" } satisfies Status);
        return;
      }
      if (result.fieldErrors) helpers.setErrors(result.fieldErrors);
      helpers.setStatus({ kind: "error", message: result.message } satisfies Status);
    },
  });
  const { setValues } = formik;

  // Restore a saved draft and honour ?service=<slug> (from service-page CTAs).
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve(useInquiryStore.persist.rehydrate()).then(() => {
      if (cancelled) return;
      const draft = useInquiryStore.getState().draft;
      const requested = new URLSearchParams(window.location.search).get("service");
      const known = serviceOptions.some((o) => o.value === requested);
      void setValues((prev) => {
        const base = isDraftEmpty(draft) ? prev : { ...prev, ...draft };
        const services =
          known && requested && !base.services.includes(requested)
            ? [...base.services, requested]
            : base.services;
        return { ...base, services };
      }, false);
      draftReady.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [serviceOptions, setValues]);

  // Persist edits (only after the stored draft has been read, so it isn't overwritten).
  useEffect(() => {
    if (draftReady.current) saveDraft(pickDraft(formik.values));
  }, [formik.values, saveDraft]);

  const status = formik.status as Status;
  const dark = tone === "dark";
  const err = (name: keyof InquiryFormValues) =>
    formik.touched[name] || formik.submitCount > 0
      ? (formik.errors[name] as string | undefined)
      : undefined;

  if (status?.kind === "success") {
    return (
      <div
        role="status"
        className={cn(
          "flex flex-col gap-2.5 rounded-2xl",
          dark ? "border border-gold-500/40 bg-gold-500/12 p-7" : "py-5",
        )}
      >
        <p
          className={cn(
            "m-0 font-serif text-[28px] leading-tight",
            !dark && "text-[32px] text-cocoa-900",
          )}
        >
          Thank you, we&apos;ve got it.
        </p>
        <p className={cn("m-0 text-[15px]", dark ? "text-sand-200" : "text-base text-ink-muted")}>
          We&apos;ll call or WhatsApp you shortly to confirm your date.
        </p>
        <ButtonLink href={whatsappHref} variant="whatsapp" className="mt-3 self-start">
          <WhatsAppIcon className="size-5" />
          Prefer WhatsApp? Message us now
        </ButtonLink>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={formik.handleSubmit} className="flex flex-col gap-3.5">
      {showHeading && <h2 className="m-0 font-serif text-[26px] text-cocoa-900">Enquiry form</h2>}

      <TextField
        id={id("name")}
        label="Your name"
        placeholder="Your name"
        autoComplete="name"
        tone={tone}
        error={err("name")}
        {...formik.getFieldProps("name")}
      />
      <TextField
        id={id("phone")}
        label="Phone or WhatsApp number"
        placeholder="Phone / WhatsApp number"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        tone={tone}
        error={err("phone")}
        {...formik.getFieldProps("phone")}
      />
      <TextField
        id={id("email")}
        label="Email (optional) — we'll send you a confirmation"
        placeholder="Email (optional, for a confirmation)"
        type="email"
        inputMode="email"
        autoComplete="email"
        tone={tone}
        error={err("email")}
        {...formik.getFieldProps("email")}
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        <TextField
          id={id("weddingDate")}
          label="Wedding date"
          type="date"
          tone={tone}
          error={err("weddingDate")}
          {...formik.getFieldProps("weddingDate")}
        />
        <TextField
          id={id("venue")}
          label="Venue or area"
          placeholder="Venue / area"
          tone={tone}
          error={err("venue")}
          {...formik.getFieldProps("venue")}
        />
      </div>

      <ChipGroup
        legend="Services needed"
        showLegend={variant === "full"}
        options={serviceOptions}
        value={formik.values.services}
        onChange={(next) => void formik.setFieldValue("services", next)}
        tone={tone}
      />

      {variant === "full" && (
        <TextAreaField
          id={id("message")}
          label="Anything else"
          placeholder="Anything else? Guest count, timings, songs…"
          rows={3}
          tone={tone}
          error={err("message")}
          {...formik.getFieldProps("message")}
        />
      )}

      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("company")}>Company</label>
        <input
          id={id("company")}
          tabIndex={-1}
          autoComplete="off"
          {...formik.getFieldProps("company")}
        />
      </div>

      <div aria-live="polite">
        {status?.kind === "error" && (
          <p
            role="alert"
            className={cn("m-0 text-sm font-medium", dark ? "text-[#ffb4ab]" : "text-[#b3261e]")}
          >
            {status.message}{" "}
            <a href={whatsappHref} className="underline">
              WhatsApp us
            </a>
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant={dark ? "gold" : "dark"}
        size="lg"
        fullWidth
        disabled={formik.isSubmitting}
        className="mt-1 min-h-[54px]"
      >
        {formik.isSubmitting ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}

"use server";

import {
  coerceInquiryForm,
  type InquiryErrors,
  type InquiryFormValues,
  type InquiryValidationOptions,
  normalizeIndianMobile,
  validateInquiryForm,
} from "@taj/types/inquiry";
import { headers } from "next/headers";

import { env } from "@/lib/env";

export type SubmitInquiryResult =
  { ok: true } | { ok: false; message: string; fieldErrors?: InquiryErrors };

/** Server Action: validate again server-side, then forward to NestJS (§6.6). */
export async function submitInquiry(
  input: InquiryFormValues,
  options: InquiryValidationOptions = {},
): Promise<SubmitInquiryResult> {
  // Action payloads are untrusted: coerce the shape before validating.
  const values = coerceInquiryForm(input);
  const fieldErrors = validateInquiryForm(values, {
    requireMessage: options?.requireMessage === true,
  });
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors };
  }

  const data = {
    ...values,
    name: values.name.trim(),
    email: values.email.trim(),
    venue: values.venue.trim(),
    message: values.message.trim(),
  };
  const h = await headers();
  const clientIp =
    h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  try {
    const res = await fetch(`${env.API_INTERNAL_URL}/public/inquiries`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-token": env.INTERNAL_API_TOKEN,
        ...(clientIp ? { "cf-connecting-ip": clientIp } : {}),
      },
      body: JSON.stringify({
        name: data.name,
        phone: normalizeIndianMobile(data.phone),
        email: data.email || null,
        weddingDate: data.weddingDate || null,
        venue: data.venue || null,
        services: data.services,
        message: data.message || null,
        sourcePage: data.sourcePage || null,
        // Honeypot is forwarded so the API can file bot submissions as SPAM (§7.4).
        company: data.company,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (res.status === 429) {
      return { ok: false, message: "Too many attempts. Please WhatsApp or call us instead." };
    }
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    return { ok: true };
  } catch (err) {
    console.error("[submitInquiry] failed", err);
    return {
      ok: false,
      message: "We couldn't send your enquiry just now. Please WhatsApp or call us.",
    };
  }
}

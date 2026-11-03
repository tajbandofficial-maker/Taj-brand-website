// Dependency-free on purpose: this module ships to the browser with the inquiry
// form, and even zod/mini added ~100 KB (gzip) to public pages. One validator
// is shared by the client form (Formik) and the Server Action.

/** Indian mobile: optional +91 / 91 / 0 prefix, then 10 digits starting 6–9. */
export const INDIAN_MOBILE_REGEX = /^(?:\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}$/;

/** Pragmatic email check (the API re-validates with class-validator). */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Inquiry form values exactly as the form holds them (empty string = not filled). */
export type InquiryFormValues = {
  name: string;
  phone: string;
  /** Optional: where the confirmation email goes. */
  email: string;
  /** YYYY-MM-DD or "" */
  weddingDate: string;
  venue: string;
  /** Service slugs */
  services: string[];
  message: string;
  sourcePage: string;
  /** Honeypot — real users never see or fill this. */
  company: string;
};

export type InquiryErrors = Partial<Record<keyof InquiryFormValues, string>>;

export const emptyInquiryForm: InquiryFormValues = {
  name: "",
  phone: "",
  email: "",
  weddingDate: "",
  venue: "",
  services: [],
  message: "",
  sourcePage: "",
  company: "",
};

function isTodayOrLater(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const picked = new Date(`${value}T00:00:00`);
  if (Number.isNaN(picked.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return picked >= today;
}

/** Returns one message per invalid field; `{}` means valid. */
export function validateInquiryForm(v: InquiryFormValues): InquiryErrors {
  const errors: InquiryErrors = {};
  const name = v.name.trim();
  if (name.length < 2) errors.name = "Please enter your name";
  else if (name.length > 80) errors.name = "Name is too long";

  if (!INDIAN_MOBILE_REGEX.test(v.phone.trim())) {
    errors.phone = "Enter a valid 10-digit Indian mobile number";
  }
  const email = v.email.trim();
  if (email !== "" && (email.length > 120 || !EMAIL_REGEX.test(email))) {
    errors.email = "Enter a valid email address, or leave it empty";
  }
  if (v.weddingDate !== "" && !isTodayOrLater(v.weddingDate)) {
    errors.weddingDate = "Pick today or a later date";
  }
  if (v.venue.trim().length > 120) errors.venue = "Keep this under 120 characters";
  if (!Array.isArray(v.services) || v.services.length > 10) errors.services = "Too many services";
  if (v.message.trim().length > 1000) errors.message = "Keep this under 1000 characters";
  if (v.sourcePage.length > 200) errors.sourcePage = "Invalid source page";
  return errors;
}

/** Coerces untrusted input (e.g. a Server Action payload) into the form shape. */
export function coerceInquiryForm(input: unknown): InquiryFormValues {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const str = (k: keyof InquiryFormValues) => (typeof o[k] === "string" ? (o[k] as string) : "");
  return {
    name: str("name"),
    phone: str("phone"),
    email: str("email"),
    weddingDate: str("weddingDate"),
    venue: str("venue"),
    services: Array.isArray(o.services)
      ? o.services.filter((s): s is string => typeof s === "string")
      : [],
    message: str("message"),
    sourcePage: str("sourcePage"),
    company: str("company"),
  };
}

/** Normalises a valid Indian mobile to E.164 digits without "+", e.g. 919876543210. */
export function normalizeIndianMobile(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `91${digits.slice(-10)}`;
}

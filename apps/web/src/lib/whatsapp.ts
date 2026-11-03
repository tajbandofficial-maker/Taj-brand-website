/** Builds a wa.me deep link. `number` is E.164 without "+", e.g. 91XXXXXXXXXX. */
export function buildWhatsAppUrl(number: string, message?: string): string {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Builds a tel: link from a human-formatted phone number. */
export function buildTelUrl(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

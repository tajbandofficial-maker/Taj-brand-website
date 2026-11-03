/**
 * Gmail-safe HTML email building blocks in the website's look (cocoa, gold,
 * cream; serif headings). Table layout + inline styles only: Gmail drops
 * external CSS and web fonts, so fonts fall back to Georgia / Helvetica.
 */

export const colors = {
  cocoa950: "#140604",
  cocoa900: "#1E0A06",
  gold500: "#C8952E",
  gold300: "#E8C468",
  gold700: "#8A4B12",
  cream50: "#FBF3E4",
  cream100: "#F3E6CF",
  sand200: "#E9DCC6",
  sand400: "#B8A58C",
  line: "#E6D9C6",
  ink: "#2A140E",
  inkMuted: "#5A4038",
  whatsapp: "#25D366",
  whatsappInk: "#0B2A15",
} as const;

const SERIF = "'DM Serif Display',Georgia,'Times New Roman',serif";
const SANS = "'Instrument Sans','Helvetica Neue',Helvetica,Arial,sans-serif";

/** Business details shown in every email (from Site settings). */
export type EmailBrand = {
  name: string;
  tagline: string;
  /** As displayed, e.g. "+91 95608 02046". */
  phone: string;
  /** E.164 digits without "+". */
  whatsapp: string;
  email: string | null;
  address: string;
  /** Public site origin, no trailing slash. Logo and links are absolute. */
  siteUrl: string;
  foundedYear: number | null;
  socials: { instagram?: string; facebook?: string; youtube?: string };
  /** Logo image src; defaults to the site's /email/logo.png (sent mail uses an inline cid:). */
  logoSrc?: string;
};

export const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

/** Escaped text with line breaks kept. */
const multiline = (s: string) => esc(s).replace(/\r?\n/g, "<br>");

type ButtonVariant = "gold" | "dark" | "whatsapp" | "outline";
const buttonStyles: Record<ButtonVariant, string> = {
  gold: `background:${colors.gold500};color:${colors.cocoa900};border:2px solid ${colors.gold500};`,
  dark: `background:${colors.cocoa900};color:${colors.cream50};border:2px solid ${colors.cocoa900};`,
  whatsapp: `background:${colors.whatsapp};color:${colors.whatsappInk};border:2px solid ${colors.whatsapp};`,
  outline: `background:transparent;color:${colors.cocoa900};border:2px solid ${colors.gold500};`,
};

/** Pill button; several in a row wrap on phones. */
export function button(label: string, href: string, variant: ButtonVariant = "gold"): string {
  return `<a href="${esc(href)}" target="_blank" style="display:inline-block;margin:0 8px 10px 0;padding:12px 22px;border-radius:999px;${buttonStyles[variant]}font-family:${SANS};font-size:15px;font-weight:700;line-height:20px;text-decoration:none;">${esc(label)}</a>`;
}

export function heading(text: string): string {
  return `<h2 style="margin:28px 0 12px;font-family:${SERIF};font-size:22px;font-weight:400;line-height:28px;color:${colors.cocoa900};">${esc(text)}</h2>`;
}

export function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:26px;color:${colors.ink};">${html}</p>`;
}

/** Label / value rows. Values are escaped; "—" marks an empty value. */
export function detailsTable(rows: [label: string, value: string | null][]): string {
  const cells = rows
    .map(
      ([label, value]) => `<tr>
  <td valign="top" class="stack" style="width:34%;padding:12px 12px 12px 0;border-bottom:1px solid ${colors.line};font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${colors.inkMuted};">${esc(label)}</td>
  <td valign="top" class="stack" style="padding:12px 0;border-bottom:1px solid ${colors.line};font-family:${SANS};font-size:15px;line-height:22px;color:${colors.ink};">${value ? multiline(value) : "—"}</td>
</tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ${colors.line};">${cells}</table>`;
}

/** Big gold-framed highlight, e.g. the wedding date. */
export function highlight(label: string, value: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px;">
  <tr><td bgcolor="${colors.cream100}" style="background:${colors.cream100};border:1px solid ${colors.gold500};border-radius:14px;padding:18px 22px;">
    <div style="font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${colors.gold700};">${esc(label)}</div>
    <div style="margin-top:4px;font-family:${SERIF};font-size:26px;line-height:32px;color:${colors.cocoa900};">${esc(value)}</div>
  </td></tr>
</table>`;
}

/** Numbered steps with gold circles. */
export function steps(items: [title: string, text: string][]): string {
  const rows = items
    .map(
      ([title, text], i) => `<tr>
  <td valign="top" width="44" style="padding:0 0 16px;">
    <div style="width:30px;height:30px;border-radius:50%;background:${colors.gold500};font-family:${SANS};font-size:14px;font-weight:700;line-height:30px;text-align:center;color:${colors.cocoa900};">${i + 1}</div>
  </td>
  <td valign="top" style="padding:3px 0 16px;font-family:${SANS};font-size:15px;line-height:23px;color:${colors.ink};"><strong style="color:${colors.cocoa900};">${esc(title)}</strong><br>${esc(text)}</td>
</tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
}

type LayoutInput = {
  brand: EmailBrand;
  /** Subject line, also the document title. */
  title: string;
  /** Inbox preview text (hidden in the email itself). */
  preheader: string;
  eyebrow: string;
  headline: string;
  /** Pre-built, already-escaped HTML. */
  body: string;
  /** Small print under the card. */
  footnote: string;
};

/** Full email document: header with logo, gold rule, body, contact footer. */
export function emailLayout({
  brand,
  title,
  preheader,
  eyebrow,
  headline,
  body,
  footnote,
}: LayoutInput): string {
  const logo = brand.logoSrc ?? `${brand.siteUrl}/email/logo.png`;
  const tel = `tel:${brand.phone.replace(/[^\d+]/g, "")}`;
  const socials = (
    [
      ["Instagram", brand.socials.instagram],
      ["Facebook", brand.socials.facebook],
      ["YouTube", brand.socials.youtube],
    ] as const
  )
    .filter(([, href]) => href)
    .map(
      ([label, href]) =>
        `<a href="${esc(href!)}" target="_blank" style="color:${colors.gold300};text-decoration:none;">${label}</a>`,
    )
    .join(` <span style="color:${colors.sand400};">&middot;</span> `);
  const contact = [
    `<a href="${esc(tel)}" style="color:${colors.sand200};text-decoration:none;">${esc(brand.phone)}</a>`,
    brand.email
      ? `<a href="mailto:${esc(brand.email)}" style="color:${colors.sand200};text-decoration:none;">${esc(brand.email)}</a>`
      : null,
  ]
    .filter(Boolean)
    .join(` <span style="color:${colors.sand400};">&middot;</span> `);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
<style>
  @media only screen and (max-width:620px) {
    .wrap { width:100% !important; }
    .px { padding-left:22px !important; padding-right:22px !important; }
    .stack { display:block !important; width:100% !important; }
    .stack + .stack { padding-top:0 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${colors.cream100};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${colors.cream100};">${esc(preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${colors.cream100}" style="background:${colors.cream100};">
<tr><td align="center" style="padding:28px 12px;">

  <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:${colors.cream50};border:1px solid ${colors.line};border-radius:18px;overflow:hidden;">
    <!-- Header -->
    <tr><td align="center" bgcolor="${colors.cocoa900}" style="background:${colors.cocoa900};padding:30px 24px 24px;">
      <a href="${esc(brand.siteUrl)}" target="_blank" style="text-decoration:none;">
        <img src="${esc(logo)}" width="80" height="80" alt="${esc(brand.name)}" style="display:block;width:80px;height:80px;border:0;outline:none;">
      </a>
      <div style="margin-top:12px;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${colors.gold300};">${esc(brand.tagline)}</div>
    </td></tr>
    <tr><td height="4" bgcolor="${colors.gold500}" style="height:4px;line-height:4px;font-size:4px;background:${colors.gold500};">&nbsp;</td></tr>

    <!-- Title -->
    <tr><td class="px" style="padding:34px 40px 4px;">
      <div style="font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${colors.gold700};">${esc(eyebrow)}</div>
      <h1 style="margin:8px 0 18px;font-family:${SERIF};font-size:32px;font-weight:400;line-height:38px;color:${colors.cocoa900};">${esc(headline)}</h1>
    </td></tr>

    <!-- Body -->
    <tr><td class="px" style="padding:0 40px 34px;">
      ${body}
    </td></tr>

    <!-- Footer -->
    <tr><td class="px" align="center" bgcolor="${colors.cocoa950}" style="background:${colors.cocoa950};padding:28px 40px;">
      <div style="font-family:${SERIF};font-size:20px;line-height:26px;color:${colors.cream50};">${esc(brand.name)}</div>
      <div style="margin-top:8px;font-family:${SANS};font-size:13px;line-height:20px;color:${colors.sand400};">${esc(brand.address)}</div>
      <div style="margin-top:8px;font-family:${SANS};font-size:13px;line-height:20px;">${contact}</div>
      ${socials ? `<div style="margin-top:12px;font-family:${SANS};font-size:13px;font-weight:700;line-height:20px;">${socials}</div>` : ""}
      <div style="margin-top:14px;font-family:${SANS};font-size:12px;line-height:18px;">
        <a href="${esc(brand.siteUrl)}" target="_blank" style="color:${colors.gold300};text-decoration:none;">${esc(brand.siteUrl.replace(/^https?:\/\//, ""))}</a>
      </div>
    </td></tr>
  </table>

  <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
    <tr><td class="px" align="center" style="padding:18px 40px 0;font-family:${SANS};font-size:12px;line-height:18px;color:${colors.inkMuted};">${footnote}</td></tr>
  </table>

</td></tr>
</table>
</body>
</html>`;
}

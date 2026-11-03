import { notFound } from "next/navigation";

/** Sends unknown URLs to (site)/not-found.tsx so 404s keep the header and footer. */
export default function CatchAll() {
  notFound();
}

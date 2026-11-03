import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

/**
 * NEXT_PUBLIC_MEDIA_HOST: "media.tajband.in" (https) in production, or a full
 * origin such as "http://localhost:9000" for the local RustFS container.
 */
function mediaPattern(value: string | undefined): RemotePattern | null {
  if (!value) return null;
  const url = new URL(value.includes("://") ? value : `https://${value}`);
  return {
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
  };
}

const media = mediaPattern(process.env.NEXT_PUBLIC_MEDIA_HOST);
const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  // Dev-only badge: keep it off the bottom corners, where the floating Enquire / Call / WhatsApp buttons sit.
  devIndicators: { position: "top-right" },
  // Monorepo root (tracing + Turbopack) is inferred from the root pnpm-lock.yaml.
  images: {
    // WebP only: AVIF encodes several times slower, which is painful on shared-hosting CPUs.
    formats: ["image/webp"],
    qualities: [75],
    // R2 keys are content-hashed and immutable, so optimised variants can live for a year.
    minimumCacheTTL: 31536000,
    remotePatterns: [
      ...(media ? [media] : []),
      // YouTube thumbnails for videos without an uploaded poster.
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      // Seeded sample photos until the client uploads real ones.
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-*" },
    ],
    // Local media storage runs on localhost in development only.
    dangerouslyAllowLocalIP: isDev,
  },
  async headers() {
    // Bundled photos and their pre-built WebP copies (scripts/photo-variants.mjs). Next serves
    // public/ files with max-age=0, so set a week here (not immutable: names don't change when a
    // photo is replaced).
    const cache = [
      { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
    ];
    return [
      { source: "/photos-opt/:path*", headers: cache },
      { source: "/photos/:path*", headers: cache },
    ];
  },
};

export default nextConfig;

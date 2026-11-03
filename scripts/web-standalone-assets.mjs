// Next.js `output: "standalone"` leaves out static assets; copy them next to server.js so
// `node apps/web/.next/standalone/apps/web/server.js` serves CSS/JS/images on its own
// (Hostinger Node.js hosting, or any host without the Docker image).
import { cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "apps", "web");
const target = join(web, ".next", "standalone", "apps", "web");

if (!existsSync(join(target, "server.js"))) {
  console.error(`✗ ${target}/server.js not found — run the web build first.`);
  process.exit(1);
}
cpSync(join(web, ".next", "static"), join(target, ".next", "static"), { recursive: true });
cpSync(join(web, "public"), join(target, "public"), { recursive: true });
console.log("✓ Copied .next/static and public into the standalone server.");

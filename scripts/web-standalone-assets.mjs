// Prepares `apps/web/.next/standalone` to run on its own with
// `node apps/web/.next/standalone/apps/web/server.js` (Hostinger Node.js hosting, or any host
// without the Docker image):
//
// 1. Next.js `output: "standalone"` leaves out static assets: copy .next/static and public next
//    to server.js.
// 2. pnpm links packages together with symlinks (node_modules/.pnpm/...). Hosts that copy the
//    build output without keeping symlinks (Hostinger does) turn those links into plain folders,
//    and packages then cannot find their own dependencies ("Cannot find module '@swc/helpers/…'").
//    Copy every traced package to the top-level standalone node_modules as well, so Node finds
//    it by walking up the folders whether or not the symlinks survive.
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "apps", "web");
const standalone = join(web, ".next", "standalone");
const target = join(standalone, "apps", "web");

if (!existsSync(join(target, "server.js"))) {
  console.error(`✗ ${target}/server.js not found — run the web build first.`);
  process.exit(1);
}
cpSync(join(web, ".next", "static"), join(target, ".next", "static"), { recursive: true });
cpSync(join(web, "public"), join(target, "public"), { recursive: true });
console.log("✓ Copied .next/static and public into the standalone server.");

/** Package folders inside a node_modules dir: `name` and `@scope/name`, skipping `.bin`/`.pnpm`. */
function packagesIn(nodeModules) {
  if (!existsSync(nodeModules)) return [];
  const names = [];
  for (const entry of readdirSync(nodeModules)) {
    if (entry.startsWith(".")) continue;
    if (entry.startsWith("@")) {
      for (const sub of readdirSync(join(nodeModules, entry))) names.push(`${entry}/${sub}`);
    } else {
      names.push(entry);
    }
  }
  return names;
}

const rootModules = join(standalone, "node_modules");
const store = join(rootModules, ".pnpm");
let hoisted = 0;
if (existsSync(store)) {
  // Each store entry's own package first (a real folder), then its symlinked dependencies.
  const sources = [];
  for (const entry of readdirSync(store)) {
    const modules = join(store, entry, "node_modules");
    for (const name of packagesIn(modules)) {
      const path = join(modules, name);
      const isLink = lstatSync(path).isSymbolicLink();
      sources.push({ name, path, isLink });
    }
  }
  sources.sort((a, b) => Number(a.isLink) - Number(b.isLink));
  for (const { name, path } of sources) {
    const dest = join(rootModules, name);
    if (existsSync(dest)) continue;
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(path, dest, { recursive: true, dereference: true });
    hoisted++;
  }
}
console.log(`✓ Copied ${hoisted} packages to the top-level standalone node_modules.`);

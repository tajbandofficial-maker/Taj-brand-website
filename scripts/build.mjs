// `pnpm run build` entry point.
// - Locally / CI (DEPLOY_APP unset): builds every package with Turborepo, as before.
// - Hosting that only offers `pnpm run build` (e.g. Hostinger Node.js apps): set the
//   environment variable DEPLOY_APP=api or DEPLOY_APP=web to build just that app.
import { spawnSync } from "node:child_process";

const targets = {
  api: "pnpm run build:api",
  web: "pnpm run build:web",
};
const app = process.env.DEPLOY_APP?.trim().toLowerCase();

let command = "pnpm exec turbo build";
if (app) {
  command = targets[app];
  if (!command) {
    console.error(`✗ DEPLOY_APP must be "api" or "web" (got "${process.env.DEPLOY_APP}").`);
    process.exit(1);
  }
  console.log(`▸ DEPLOY_APP=${app} → ${command}`);
}

const result = spawnSync(command, { stdio: "inherit", shell: true });
process.exit(result.status ?? 1);

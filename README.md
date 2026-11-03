# Taj Band

Marketing website + admin panel for Taj Band (heritage wedding brass band, Delhi-NCR).
Architecture and build spec: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

| Path             | What                                                    |
| ---------------- | ------------------------------------------------------- |
| `apps/web`       | Next.js 16 — public site, admin, BFF (port 3000)        |
| `apps/api`       | NestJS 12 + Prisma 7 — internal REST API (port 4000)    |
| `packages/types` | Shared zod schemas + TS types (`@taj/types`)            |
| `design/`        | Source page designs (self-unpacking `.dc.html` bundles) |
| `packages/*`     | Shared `tsconfig` and ESLint configs                    |
| `infra`          | Docker Compose files (dev: Postgres + optional Mailpit) |

## Local setup

Requires Node 22+, pnpm 10, and Docker.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env          # set the secrets, local storage + SEED_ADMIN_* (see comments)
cp apps/web/.env.example apps/web/.env.local    # INTERNAL_API_TOKEN + REVALIDATE_SECRET must match the API's
pnpm db:up                                      # Postgres :5432 + RustFS media storage :9000
pnpm --filter api prisma migrate dev            # apply migrations
pnpm --filter api prisma db seed                # client content + first admin (from SEED_ADMIN_*)
pnpm dev                                        # web on :3000, api on :4000
```

To overwrite an already-seeded database with the seed's content (settings, services, packages,
FAQs, comparison; placeholder reviews/add-ons/sample photos are swapped for the real ones), run
`pnpm --filter api prisma db seed -- --refresh`. To refresh only some parts and keep admin edits
elsewhere, list them: `-- --refresh=services,gallery,addons` (sections: settings, pages, services,
packages, addons, reviews, gallery).

Generate secrets with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

Check: `http://localhost:4000/health` → `{"status":"ok","db":"up"}`.

- **Website:** http://localhost:3000
- **Admin panel:** http://localhost:3000/admin — sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `apps/api/.env`
- **API docs (Swagger):** http://localhost:4000/docs when `SWAGGER_ENABLED=true`

After changing `.env` files, restart `pnpm dev` (servers read them at start-up).

## Scripts (root)

| Script                            | Does                                                             |
| --------------------------------- | ---------------------------------------------------------------- |
| `pnpm dev`                        | Runs all apps in watch mode via Turborepo                        |
| `pnpm build`                      | Production build of every package                                |
| `pnpm lint`                       | ESLint everywhere                                                |
| `pnpm typecheck`                  | `tsc --noEmit` everywhere                                        |
| `pnpm test`                       | Unit tests (Vitest, API)                                         |
| `pnpm format`                     | Prettier                                                         |
| `pnpm db:up/down`                 | Start/stop dev Postgres + media storage                          |
| `pnpm --filter api email:preview` | Render the inquiry emails to `apps/api/email-previews/`          |
| `pnpm --filter api email:test`    | Send both sample emails to `BUSINESS_EMAIL` (checks Gmail setup) |

The Prisma client is generated into `apps/api/src/generated/` (git-ignored) by the
Turbo `generate` task, which every other task depends on.

## Web app structure (`apps/web/src`)

| Path                | What                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `components/ui/`    | Generic, reusable building blocks: `Button`, `Section`, `SectionHeader`, `ImageFrame`, `CtaPanel`, form fields… |
| `components/site/`  | Taj Band-specific components (header, footer, cards, gallery, inquiry form). Server by default.                 |
| `stores/`           | Zustand stores: UI (mobile nav, page-aware WhatsApp text), inquiry draft (sessionStorage), gallery.             |
| `actions/`          | Server Actions (`submit-inquiry.ts` → API `POST /public/inquiries`).                                            |
| `components/admin/` | Admin-only UI kit + screens (Formik fields, reorderable lists, image picker). Never loaded on public pages.     |
| `lib/api/`          | Server-only API access: tagged, cached public fetchers (`public.ts`).                                           |
| `lib/admin/`        | Admin client: BFF fetch, TanStack Query hooks, image upload pipeline, session cookie helpers.                   |
| `lib/`              | Helpers: formatting, navigation, WhatsApp links, env.                                                           |

Forms use Formik (`useFormik`). Inquiry validation lives in `@taj/types/inquiry` and is
dependency-free so it can ship to the browser cheaply; the Server Action re-runs it.
Animations are CSS-only and respect `prefers-reduced-motion`.

## Status

Done: Phase 1 (foundations), Phase 3 (backend: auth, all content endpoints, media uploads, inquiries,
cache invalidation, seed, Swagger, unit tests), Phase 4 (public site from the design, reading the API),
Phase 5 (admin panel). Next: Phase 2 (Docker images, CI/CD, VPS + Cloudflare) and Phase 6 (SEO/perf pass).
Implementation decisions are logged in [docs/ARCHITECTURE.md §18](docs/ARCHITECTURE.md).

## Inquiry emails

Each website enquiry sends two Gmail-ready emails (table layout, inline styles, site theme + logo):
an alert to us (`INQUIRY_NOTIFY_EMAILS`, else `BUSINESS_EMAIL`; reply goes to the client) and, when the
visitor leaves an email, a confirmation to them (reply goes to `BUSINESS_EMAIL`).

**Send through Gmail** — in `apps/api/.env` set `SMTP_USER` (the Gmail address) and `SMTP_PASS` (a Gmail
**App Password**: Google Account → Security → 2-Step Verification → App passwords; not the normal
password), then restart `pnpm dev`. Check with `pnpm --filter api email:test`, which sends both sample
emails to `BUSINESS_EMAIL`. Alternatively use Resend: `RESEND_API_KEY` + `MAIL_FROM` on a verified domain.
With neither, the API logs a warning and skips sending.

The logo loads from `PUBLIC_SITE_URL/email/logo.png`, so it shows in Gmail only once the site is on a
public https URL. Templates: `apps/api/src/modules/notifications/`; previews: `pnpm --filter api email:preview`.

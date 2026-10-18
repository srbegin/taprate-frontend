# Frontends — TapRate & Cleanpulse

npm-workspaces monorepo. One backend (`srbegin/taprate-backend`) serves both brands.

```
apps/taprate/       TapRate app (taprate.app) — Vercel Root Directory apps/taprate
apps/cleanpulse/    Cleanpulse app (cleanpulse.app) — Vercel Root Directory apps/cleanpulse
packages/shared/    @platform/shared — API client, auth (config + login/signup/reset pages), hooks,
                    public survey/claim UI, Wordmark
```

Each app sets `NEXT_PUBLIC_PRODUCT` in its `next.config.mjs`; `@platform/shared/brand` reads it to
send the `X-Product` header and show the right brand name and wordmark. Each app's `globals.css`
defines the `brand` accent colours (`--color-brand`, `-hover`, `-ring`, `-soft`, `-softer`) that
shared UI uses (`bg-brand`, `text-brand-soft`, …).

## Commands (from the repo root)

```bash
npm install              # installs every workspace (one lockfile at the root)
npm run dev:taprate      # http://localhost:3000
npm run dev:cleanpulse   # http://localhost:3001
npm run build:taprate
npm run build:cleanpulse
npm run lint             # lints every workspace
```

Env for local dev lives in `apps/<app>/.env.local` (`NEXT_PUBLIC_API_URL` includes `/api`).

## Adding shared code

Put it in `packages/shared/` and import it as `@platform/shared/<path>` (no extension).
Use `brand-*` colours (not a specific palette) for accents so it fits both apps.
Apps compile it via `transpilePackages`, and their `globals.css` has `@source "../../../packages/shared"`
so Tailwind sees its classes. Inside the package, use relative imports.

If Tailwind classes or `@theme` changes don't show up in `next dev`, delete `apps/<app>/.next`
(Turbopack's on-disk cache can serve stale CSS) and restart.

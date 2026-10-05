# Frontends — TapRate & Cleanpulse

npm-workspaces monorepo. One backend (`srbegin/taprate-backend`) serves both brands.

```
apps/taprate/       TapRate app (taprate.app) — Vercel project "cleanpulse", Root Directory apps/taprate
apps/cleanpulse/    Cleanpulse app (cleanpulse.app) — not created yet
packages/shared/    @platform/shared — API client, auth config, hooks, public survey/claim UI
```

Each app sets `NEXT_PUBLIC_PRODUCT` in its `next.config.mjs`; `@platform/shared/brand` reads it to
send the `X-Product` header and show the right brand name.

## Commands (from the repo root)

```bash
npm install              # installs every workspace (one lockfile at the root)
npm run dev:taprate      # http://localhost:3000
npm run build:taprate
npm run lint             # lints every workspace
```

Env for local dev lives in `apps/<app>/.env.local` (`NEXT_PUBLIC_API_URL` includes `/api`).

## Adding shared code

Put it in `packages/shared/` and import it as `@platform/shared/<path>` (no extension).
Apps compile it via `transpilePackages`, and their `globals.css` has `@source "../../../packages/shared"`
so Tailwind sees its classes. Inside the package, use relative imports.

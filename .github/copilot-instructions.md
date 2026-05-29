# Project Guidelines

## Code Style
- Frontend uses strict TypeScript (`"strict": true`) and Next ESLint defaults; preserve explicit typing in edited code (`tsconfig.json`, `eslint.config.mjs`).
- Keep import paths on the `@/*` alias pattern instead of long relative chains (`tsconfig.json`, `components.json`).
- Prefer named exports for reusable components and default exports for route pages (`components/*.tsx`, `app/**/page.tsx`).
- Use Tailwind utility classes and existing CSS variables/tokens from `app/globals.css`; avoid introducing hard-coded theme values.
- Use `cn` from `@/lib/utils` for conditional class composition.

## Architecture
- Workspace has two apps: `kji-dashboard` (Next.js App Router frontend) and `Backend KP` (Express + Mongoose API).
- Frontend route tree lives under `app/`; shared UI primitives are under `components/ui/`; feature components under `components/`.
- Root wrappers are centralized in `app/layout.tsx` (`AuthCheck`, `ThemeProvider`, `Toaster`, `PageTransition`).
- Backend mounts route modules at `/api/auth`, `/api/inventory`, `/api/activity`, `/api/checkout` from `server.js`.
- Inventory/checkout flows log audit entries into the Activity model from route handlers (`Backend KP/routes/inventory.routes.js`).

## Build and Test
- Frontend (run in `kji-dashboard`): `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.
- Backend (run in `Backend KP`): `npm run dev`, `npm run start`.
- No automated test scripts are currently defined in either `package.json`; do not assume `npm test` exists.

## Project Conventions
- Preserve existing bilingual UX copy (Indonesian + English) when editing UI text (`components/login-form.tsx`, `app/checkout/page.tsx`).
- Frontend API calls typically use `NEXT_PUBLIC_API_URL` with localhost fallback (`app/inventory/page.tsx`, `components/login-form.tsx`).
- Keep Shadcn-generated primitives consistent; avoid broad edits in `components/ui/*` unless the task is a shared UI change.
- Some pages still use mock/static data; treat those as transitional and do not infer backend truth from them (`app/dashboard/data.json`, `app/report/page.tsx`).

## Integration Points
- Auth flow: backend returns JWT from `/api/auth/login`; frontend stores token in `localStorage` and sends `Authorization: Bearer <token>`.
- Auth guard is client-side (`components/auth-check.tsx`), while backend route protection is middleware-based (`Backend KP/middleware/auth.middleware.js`).
- Backend security middleware is configured globally in `Backend KP/server.js` (`helmet`, CORS, rate limiter, JSON parser).
- Supabase client/schema files exist (`lib/supabase.ts`, `supabase_schema.sql`) but current primary runtime data path is Express + MongoDB.

## Security
- Never hardcode or print secrets (`MONGODB_URI`, `JWT_SECRET`, Supabase keys); rely on `.env*` files (ignored by git).
- Keep JWT-protected routes behind `protect`; apply `authorize(...)` only where role constraints are required.
- Password handling relies on model hooks and bcrypt (`Backend KP/models/user.model.js`); do not bypass hashing paths.
- Treat `BYPASS_AUTH_FOR_DEV = true` in `app/inventory/page.tsx` as temporary dev-only behavior; do not propagate it to new features.

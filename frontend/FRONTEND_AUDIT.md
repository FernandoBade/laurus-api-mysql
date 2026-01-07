# Frontend Architecture Audit (TailAdmin Next.js)

Date: 2026-01-05

## Current Structure Evaluation
- Routing uses Next.js App Router under `src/app`, with grouped segments for admin, auth, and full-width pages.
- Domain and API logic lives in `src/features/<feature>` with `api.ts`, `hooks.ts`, and `types.ts` per feature.
- Cross-cutting infrastructure is centralized under `src/shared` (API client, error normalization, formatters, UI states, shared types, shared contexts).
- UI is still centralized in `src/components` (TailAdmin), with shared UI states added in `src/shared/ui`.
- i18n lives at repo root `frontend/i18n` with runtime language utilities consumed across pages and API.

## Major Layers Identified
- Routes/pages: `src/app/**/page.tsx`
- Layouts: `src/app/**/layout.tsx`, `src/shared/layout/*`
- Shared UI components: `src/components/ui/*`, `src/components/common/*`, `src/components/form/*`, `src/shared/ui/*`
- Feature modules: `src/features/*` (accounts, auth, credit-cards, transactions, categories, tags, users)
- API client: `src/shared/lib/api/*`
- Feature APIs/hooks: `src/features/*/api.ts`, `src/features/*/hooks.ts`
- Auth flow: `src/features/auth/*`, `src/components/auth/*`
- State management patterns: React Query within feature hooks
- Error handling patterns: `src/shared/lib/api/errors.ts` + shared state components
- Forms patterns: local state per page, field validation inline

## Pain Points and Inconsistencies
- Feature-specific UI still lives in `src/components`, mixing with generic UI and making ownership boundaries less clear.
- Form validation and input parsing are repeated across pages; no shared pattern yet.
- Table pagination, filtering, and query param handling are not standardized across features.
- Some naming inconsistencies remain in legacy files (mixed casing and pluralization).
- Auth/session usage is centralized, but more pages can migrate to `useAuthSession` as they are touched.

## What To Change Now (Phase 1)
1. Establish `src/shared` and `src/features` directories with clear ownership and import boundaries.
2. Implement a single API client with `baseUrl` from env, `credentials: include`, and normalized errors.
3. Standardize error/loading/empty UI states on auth, dashboard, accounts, credit-cards, and transactions.
4. Centralize auth ownership under `features/auth` and expose `useAuthSession`.
5. Ensure dashboard remains an orchestration layer only (no direct business logic).
6. Introduce shared formatters (`money`, `date`) and apply consistently.
7. Document conventions and boundaries.

## What To Change Later (Phase 2+)
- Move remaining feature UI out of `src/components` into `src/features/*/components` or `src/shared/ui`.
- Add a lightweight, consistent form/validation pattern once form debt becomes a bottleneck.
- Standardize table pagination, filters, and URL-synced query params.
- Consolidate page-specific logic into feature-level container components/hooks.
- Add typed API mocks and contract tests once backend schema is stabilized.

## Conventions (Source of Truth)

### Folder Structure
- `src/app/`: Next.js App Router routes and layouts only.
- `src/features/<feature>/`: domain modules with `api.ts`, `hooks.ts`, `types.ts`, and optional `components/`.
- `src/shared/`:
  - `shared/ui/`: shared UI primitives and state components.
  - `shared/lib/`: shared logic (API client, error normalization, formatters).
  - `shared/types/`: shared type contracts (API, enums, query params).
  - `shared/context/`: global providers (theme, sidebar).

### Naming
- Folders: `kebab-case` (e.g., `credit-cards`, `user-profile`).
- React components: `PascalCase` file + export name.
- Hooks: `useXyz` in `hooks.ts` or `hooks/useXyz.ts`.
- Types: `types.ts` within a feature or `shared/types/*`.

### Import Boundaries
- `app` can import from `features` and `shared`.
- `features` can import from `shared`.
- `shared` does not import from `features` or `app`.

### API and Data
- All network access goes through `shared/lib/api/client`.
- API modules return typed envelopes and throw normalized errors on non-success.
- Query params use typed `QueryParams` instead of `Record<string, any>`.

### UI State Patterns
- Use shared `LoadingState`, `EmptyState`, `ErrorState` components.
- Keep page-level components thin; move repeated UI sections into feature components.

### Forms and Validation
- Keep field validation inline for now; consider shared helpers only when duplication becomes costly.
- Use `Alert` for form submission errors (not general data-fetch errors).

## Migration Checklist
- [ ] Create a feature module with `api.ts`, `hooks.ts`, `types.ts`, and optional `components/`.
- [ ] Move API functions into the feature module and update imports.
- [ ] Ensure API functions use the shared client and error normalization.
- [ ] Replace inline money/date formatting with shared formatters.
- [ ] Replace inline loading/empty/error blocks with shared state components.
- [ ] Update query key params to typed `QueryParams`.
- [ ] Migrate auth usage to `useAuthSession` as pages are touched.
- [ ] Validate `npm run build` before merging.

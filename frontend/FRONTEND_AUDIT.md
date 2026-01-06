# Frontend Architecture Audit (TailAdmin Next.js)

Date: 2026-01-05

## Current Structure Evaluation
- Routing uses Next.js App Router under `src/app`, with grouped segments for admin, auth, and full-width pages.
- Domain/API logic lives in `src/api` with per-resource `*.api.ts`, `*.hooks.ts`, and `*.types.ts`.
- Cross-cutting state is split across `src/context` (Auth/Theme/Sidebar), `src/hooks`, and `src/layout`.
- UI is centralized in `src/components`, but mixes generic UI, feature components, and page content.
- i18n lives at repo root `frontend/i18n` with runtime language utilities consumed across pages and API.

## Major Layers Identified
- Routes/pages: `src/app/**/page.tsx`
- Layouts: `src/app/**/layout.tsx`, `src/layout/*`
- Shared UI components: `src/components/ui/*`, `src/components/common/*`, `src/components/form/*`
- Feature modules: currently implicit via `src/api/*` and pages under `src/app/(admin)/app/*`
- API calls/fetch wrappers: `src/api/httpClient.ts`, `src/api/*.api.ts`
- Auth flow: `src/components/auth/*`, `src/context/AuthContext.tsx`, `src/api/auth.*`
- State management patterns: React Query in `src/api/*.hooks.ts`, local component state in pages
- Error handling patterns: `src/api/errorHandling.ts` and inline `try/catch` per page
- Forms patterns: local state per page, field validation inline

## Pain Points and Inconsistencies
- API layer returns envelopes without consistent error normalization; UI receives raw Axios errors.
- Type looseness in hooks via `Record<string, any>` for query params and cache keys.
- Form validation, loading, and empty states are repeated across pages (accounts, credit cards, transactions).
- Mixed ownership in `src/components` (feature-specific + shared) makes imports and boundaries unclear.
- Auth/session handling is split between context, token store, and HTTP client without clear ownership.
- Formatting logic (money/date) is repeated inline; no shared formatter.
- Naming conventions vary (`creditCards` vs `credit-cards`, mixed file casing).

## What To Change Now (Phase 1)
1. Establish `src/shared` and `src/features` directories with clear ownership:
   - `shared`: API client, error normalization, formatters, shared types, base UI states.
   - `features`: auth, accounts, credit-cards, transactions, categories, tags, users.
2. Implement a single API client with:
   - `baseUrl` from env, `credentials: include`, standard headers.
   - Typed response envelopes and centralized error normalization.
   - Auth refresh + unauthorized handlers.
3. Standardize error/loading/empty UI states and apply to:
   - Auth pages, dashboard, transactions, accounts, credit-cards.
4. Introduce shared formatters (money/date) and typed query params.
5. Add minimal tests for:
   - API error normalization.
   - Auth client functions.
   - Money/date formatting utilities.
6. Document conventions and import boundaries.

## What To Change Later (Phase 2+)
- Move remaining UI elements from `src/components` into `src/shared/ui` or feature modules.
- Add a lightweight form abstraction (field registry + validation schema) to reduce boilerplate.
- Standardize table pagination and filter state with URL-synced query params.
- Consolidate page-specific logic into feature-level container components/hooks.
- Add typed API mocks and contract tests if backend schema is stabilized.

## Conventions (Source of Truth)

### Folder Structure
- `src/app/`: Next.js App Router routes and layouts only.
- `src/features/<feature>/`: domain modules with `api/`, `hooks/`, `types/`, `components/`.
- `src/shared/`:
  - `shared/ui/`: generic UI primitives and state components.
  - `shared/lib/`: cross-cutting logic (api client, formatters, guards).
  - `shared/types/`: shared type contracts (API, enums, query params).
  - `shared/constants/`: cross-cutting constants.

### Naming
- Folders: `kebab-case` (e.g., `credit-cards`, `user-profile`).
- React components: `PascalCase` file + export name.
- Hooks: `useXyz` in `hooks.ts` or `hooks/useXyz.ts`.
- Types: `*.types.ts` or `types.ts` within a feature.

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
- Use shared validation helpers for required/number/email rules.
- Use a consistent error rendering component for form errors.

## Migration Checklist
- [ ] Create a feature module with `api`, `hooks`, `types`, and `components` folders.
- [ ] Move API functions from `src/api` into the feature module and update imports.
- [ ] Ensure API functions use the shared client and error normalization.
- [ ] Replace inline formatting with shared formatters.
- [ ] Replace inline loading/empty/error blocks with shared state components.
- [ ] Update query key params to typed `QueryParams`.
- [ ] Add or update tests for new shared utilities.
- [ ] Validate `npm test` and `npm run build` before merging.

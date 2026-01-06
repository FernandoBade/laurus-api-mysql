# Frontend Conventions

## Directory Layout
- `src/app/`: Next.js App Router routes and layouts only.
- `src/features/<feature>/`: domain modules with `api.ts`, `hooks.ts`, `types.ts`, and `components/`.
- `src/shared/`:
  - `shared/ui/`: shared UI primitives and state components.
  - `shared/lib/`: shared logic (API client, formatters, validation helpers).
  - `shared/types/`: shared contracts (API envelopes, enums).
  - `shared/context/`: global providers (theme, sidebar).

## Naming
- Folders: `kebab-case`.
- Components: `PascalCase` file + export name.
- Hooks: `useXyz` functions, stored in `hooks.ts` or `hooks/useXyz.ts`.
- Types: `types.ts` inside a feature or `shared/types/*`.

## Imports
- Order: external deps → shared → features → local.
- `app` can import from `features` and `shared`.
- `features` can import from `shared`.
- `shared` must not import from `features` or `app`.

## API + Data
- All requests go through `shared/lib/api/client`.
- API functions return typed envelopes (`ApiResponse`, `ApiListResponse`) and throw normalized errors on failure.
- Use `QueryParams` for list/search params; avoid `Record<string, any>`.
- Use `getApiErrorMessage` for UI-friendly error messages.

## UI State
- Prefer `LoadingState`, `EmptyState`, `ErrorState` for consistent UX.
- For tables: show empty state inside a `<TableCell>` and keep headers stable.

## Forms + Validation
- Use shared helpers (`shared/lib/validation`) to avoid duplicated parsing logic.
- Validate required fields before calling mutations.
- Use `Alert` for form submission errors (not general data-fetch errors).

## Formatting
- Use `formatMoney` and `formatDate` for consistent display.
- Keep formatting in `shared/lib/formatters` and do not inline in pages.

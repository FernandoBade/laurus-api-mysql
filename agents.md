# Frontend Architecture Guidelines - Agents.md

## 📋 Project Context

This repository is a monorepo containing:

- **`backend/`** — Node.js + TypeScript backend, source of truth for domain rules and API behavior
- **`shared/`** — monorepo shared contracts: types, enums, i18n keys, DTOs, etc. (**single source of truth**)
- **`frontend/`** — Preact + Vite + TypeScript frontend (**this migration target**)

### Core Principle

The frontend must be architected as a **structural mirror** of the backend.

**Goal:** Anyone familiar with the backend can navigate the frontend instantly.

---

## 🏗️ Frontend Stack (Non-Negotiable)

- **Preact** — lightweight React alternative
- **Vite** — build tool and dev server
- **TypeScript** — strict typing and correctness
- **History API Router** — NO hash router allowed
- **Mobile-first** — UI mindset from day one

### 📱 Capacitor Future Readiness (Important)

This frontend must be compatible with a **future Capacitor migration**, but:

**❌ FORBIDDEN:**
- Capacitor must NOT be installed
- No Capacitor plugin usage
- UI components cannot directly depend on native APIs

**✅ REQUIRED:**
- All future-native integration must be abstracted behind the `platform/` layer
- Navigation must be centralized (for future Android back button integration)
- Storage must be isolated behind drivers (for future native storage replacement)

---

## 🎨 UI Layer Policy (Tailwind + DaisyUI)

This project will use **TailwindCSS + DaisyUI** as the **visual styling layer**.

### Non-Negotiable UI Rules

**DaisyUI is styling-only.** It must not affect architectural decisions.

**✅ REQUIRED:**
- DaisyUI classes may be used **only inside** `src/components/` (reusable UI building blocks) and (when truly page-only) inside `src/pages/<page>/<page>Assets/`
- Pages must consume internal components (`<Button />`, `<Modal />`, `<DataTable />` etc.), never Daisy classes directly
- Theme switching is centralized using `data-theme` on the `<html>` root element

**❌ FORBIDDEN:**
- DaisyUI class names directly in page markup (`src/pages/**`) except inside page-exclusive assets (`<page>Assets/`)
- Hardcoded colors or ad-hoc styling decisions spread across pages
- Treating DaisyUI as "the component library": the component library is **our own** `src/components/` layer

### Theme Management (Strict)

We support **exactly two themes**:

- **Light** (default)
- **Dark**

**Implementation requirements:**
- Theme state must live in `src/state/theme.store.ts`
- The store must apply the theme by setting `document.documentElement.setAttribute("data-theme", theme)`
- Theme names must be typed (enum/union) and never hardcoded

---


## 🧠 TypeScript & Enums Policy (Hard Rule)

This codebase must maximize TypeScript advantages.

### Non-Negotiable Rules

- **Always type everything.** No `any` unless justified and contained
- Prefer `unknown` + narrowing over `any`
- All public APIs (`services/`, `api/`, `platform/`, `state/`) must be fully typed
- **No hard strings** for identifiers, modes, variants, route names, event names, storage keys, theme names, UI variants, etc.
- If a string value is repeated or represents a "system concept", it must be represented as an enum (or a typed constant object if required)

### Enums Location Policy (Strict)

All enums and typed constants must live in the monorepo shared folder:

```
shared/enums/
```

Frontend and backend must consume these enums via:

```typescript
import { Something } from "@shared/enums/...";
```

**This ensures:**

- Consistent contracts across frontend/backend
- Zero duplication
- Maximum TypeScript safety
- Predictable code navigation

### Enums Organization

Enums must be subdivided into domain-specific files inside `shared/enums/`.

**Examples:**

- `shared/enums/ui.enums.ts`
- `shared/enums/routes.enums.ts`
- `shared/enums/storage.enums.ts`
- `shared/enums/theme.enums.ts`
- `shared/enums/auth.enums.ts`

**Rule:** If an enum grows too large, it must be split into smaller files rather than becoming a dumping ground.

### Enums Must Be Used For

- UI variants (Button variants, Alert variants, Modal sizes)
- Route paths and route names
- Storage keys
- Theme names
- Authentication modes
- Feature flags / environment modes
- Any system-level "category" string used across multiple files

### UI Variants Must Be Typed and Shared

UI variants must come from `@shared/enums/*`.

**Example:**

File: `@shared/enums/ui.enums.ts`

Containing definitions such as:

```typescript
UI.ButtonVariant.PRIMARY
UI.ButtonVariant.SECONDARY
UI.AlertVariant.SUCCESS
UI.ModalSize.LG
```

**Rule:** Components may map these typed variants to DaisyUI classes internally, but pages/services must never deal with DaisyUI strings.

**Example pattern:**

- Page code uses: `UI.ButtonVariant.PRIMARY`
- Button component internally maps to Daisy: `"btn-primary"`

**Important:** If a UI enum does not exist yet, it must be added under `shared/enums/` (never duplicated inside frontend).



---

## ✨ Golden Rule

> **UI is composition. Business logic never lives inside components.**

This is the cornerstone principle for all frontend architecture decisions.

---

## 🔄 Structural Mirroring Rules (Backend ⇄ Frontend)

The backend is organized by **layers**, not by feature folders.
The frontend must mirror the same mental model.

### Backend Layer Model

```
routes/        → HTTP routes
controller/    → HTTP controllers (request/response orchestration)
service/       → business rules / usecases
repositories/  → persistence layer (DB access)
utils/         → cross-cutting utilities
shared/        → shared contracts (types, enums, i18n)
```

### Frontend Equivalent Model

Frontend must mirror the backend conceptually:

| Backend Layer | Frontend Layer | Responsibility |
|---|---|---|
| `routes/` | `src/routes/` | UI routes composition (History API) |
| `controller/` | `src/pages/*/*.controller.ts` | screen orchestration (state + flows) |
| `service/` | `src/services/` | frontend usecases (pure, testable) |
| `repositories/` | `src/api/` | HTTP access layer (API clients) |
| `utils/` | `src/utils/` | cross-cutting frontend utilities |
| `/shared` | `@shared/*` alias | monorepo shared contracts |

---

## 📁 Folder Architecture (Canonical)

The frontend must follow this structure:

```
src/
├── pages/           → pages and page controllers
├── components/      → reusable UI components (cross-domain)
├── services/        → business usecases (frontend services)
├── api/             → HTTP API clients
├── routes/          → routing and navigation control
├── platform/        → native-ready abstractions (storage/network/back button)
├── state/           → global state (auth/session/locale/theme)
├── utils/           → cross-cutting helpers
├── config/          → env and route constants
└── styles/          → global styling only
```

### ⚠️ Important Rule: No `src/shared/` Folder

The monorepo already contains `/shared`.

To prevent confusion:

- ❌ The frontend must NOT create any folder called `shared/`
- ✅ Reusable UI must live in `src/components/`
- ✅ Shared contracts must be imported only from `@shared/*`

---

## 📝 Naming Conventions (Strict)

### Pages

Each page must live in its own folder:

```
src/pages/<pageName>/<pageName>.tsx
```

**Examples:**
- `src/pages/login/login.tsx`
- `src/pages/dashboard/dashboard.tsx`

### Controllers (Mandatory)

Controllers must NOT be named `useSomethingController`.

Instead, they must follow one of these patterns:

- `<pageName>.controller.ts`
- `<pageName>.controller.tsx` (only if JSX is strictly needed)

**Examples:**
- `src/pages/login/login.controller.ts`
- `src/pages/dashboard/dashboard.controller.ts`
- `src/pages/tags/tags.controller.ts`

**Responsibility:**
- Orchestrating page state and flows
- Must call services, never API clients directly
- Must not contain HTTP, storage access, or navigation hacks

### Page Exclusive Assets (Mandatory for non-reusable UI)

If a page needs internal components that must NOT be reused globally, create:

```
src/pages/<pageName>/<pageName>Assets/
```

**Examples:**
- `src/pages/login/loginAssets/LoginForm.tsx`
- `src/pages/tags/tagsAssets/TagFormModal.tsx`

**Rationale:** Avoid polluting global `components/` with page-specific UI.

### Services

Services must be grouped by domain:

```
src/services/<domain>/<domain>.service.ts
```

**Examples:**
- `src/services/auth/auth.service.ts`
- `src/services/tags/tags.service.ts`

**Responsibility:**
- Business flows and usecases
- Must remain UI-agnostic
- Must be testable and deterministic
- Must use typed inputs/outputs from `@shared/*`

### API Clients

API clients must be grouped by domain:

```
src/api/<domain>/<domain>.api.ts
```

**Examples:**
- `src/api/auth/auth.api.ts`
- `src/api/tags/tags.api.ts`

**Rule:** All HTTP must live inside `src/api/`.

### Components

All reusable UI must live under:

```
src/components/<componentName>/
```

**Examples:**
- `src/components/button/button.tsx`
- `src/components/modal/modal.tsx`
- `src/components/data-table/data-table.tsx`

**Rule:** Components must be pure UI (no business rules, no HTTP, no storage).

---

## 🔗 Dependency Rules (Strict Direction)

### ✅ Allowed Imports

| From | Can Import | Example |
|------|-----------|---------|
| `pages/` | `components/`, `services/`, `utils/`, `state/`, `config/` | page composes UI + calls controller |
| `services/` | `api/`, `utils/`, `@shared/*` | usecases call API, use shared types |
| `api/` | `utils/`, `platform/`, `@shared/*` | HTTP + types + platform |
| `routes/` | `pages/`, `state/`, `config/` | compose routes + auth guards |
| `components/` | `components/`, `utils/`, `@shared/*` | UI composition + typed enums |
| `platform/` | `utils/`, `@shared/*` | platform abstractions |

### ❌ Forbidden Imports

- ❌ `components/` importing `services/`
- ❌ `components/` importing `api/`
- ❌ `pages/` importing `api/` directly
- ❌ Any page or component calling `fetch()`
- ❌ Any page accessing `localStorage` directly
- ❌ Any page setting `data-theme` directly (theme store only)

---

## 📦 Shared Contracts (Monorepo `/shared`) Rules

### Source of Truth

The `/shared` folder is the single source of truth for:

- Domain types
- DTOs
- Enums
- Translation keys
- i18n utilities
- UI typed enums/constants (when relevant)

Frontend must import these via:

```typescript
import { Something } from "@shared/...";
```

### ❌ Forbidden in Shared Import Pattern

- Duplicating types that already exist in `/shared`
- Rewriting enums that already exist in `/shared`
- Copying i18n keys or translations into frontend
- Creating frontend-only "enum mirrors" for values that should be shared

**Rule:** If a type/enum is missing, it must be added to `/shared`, not duplicated in frontend.

---

## 🌐 HTTP Rules (Non-Negotiable)

### Absolute Rule

> No `fetch()` outside `src/api/`.

### HTTP Client Layer

All requests must go through:

```typescript
src/api/http/httpClient.ts
```

The HTTP client must support:

- `baseURL` from `VITE_API_BASE_URL`
- `credentials: "include"` (cookie refresh tokens)
- Global error normalization (typed)
- Retry/backoff for idempotent GET requests
- Global handling of 401 with refresh + request replay

**Rule:** No page or service should implement retry logic directly.

---

## 🔐 Auth Architecture (Mandatory)

Auth must be centralized:

- Token management must live in `auth.service.ts`
- Refresh must be automatic and transparent
- 401 must be handled globally by the HTTP client
- Session must be represented with typed state (`auth.store.ts`)

### ❌ Forbidden Auth Patterns

- Storing token directly in a page
- Reading token directly from `localStorage`
- Calling refresh endpoint from pages
- Hardcoded auth event strings (must be typed constants)

---

## 🧭 Navigation Rules (Non-Negotiable)

### ❌ Forbidden

- `window.location`
- Direct `history.pushState` calls

### ✅ Allowed

All navigation must go through:

```typescript
src/routes/navigation.ts
```

**Rule:** Required for future Capacitor integration and consistent back-button behavior.

---

## 💾 Storage Rules (Capacitor-ready)

### ❌ Forbidden

- `localStorage` access outside `src/platform/storage`

### ✅ Required

All storage must be routed through:

```typescript
src/platform/storage/storage.ts
```

Storage must support drivers:

- Web localStorage driver
- Memory driver (for tests / fallback)

**Rule:** All storage keys must be typed (enum or `as const`).

---

## 🔌 Platform Layer Rules (Future Native Support)

The platform layer exists because mobile migration is expected.

This folder must exist:

```
src/platform/
```

It must contain:

- `isNative.ts` (single source of truth)
- `storage/` (encapsulated storage access)
- `network/` (encapsulated network access)
- `backButton/` (encapsulated back button handling)

### ❌ Forbidden

- Calling native APIs directly from UI
- Adding Capacitor dependencies
- "Temporary" direct platform calls in pages

---

## 🎨 UI Componentization Rules (Mandatory)

The frontend must have reusable building blocks in `src/components/`.

### Minimum Required Components

- `Button`
- `Table`
- `DataTable`
- `Modal`
- `Form`
- `Input`
- `Select`
- `Card`
- `Accordion`
- `Bullets`
- `Layout`
- `PageContainer`
- `Loader`
- `ErrorState`
- `Alert`

### DaisyUI Encapsulation Rule

- Components may use DaisyUI classes internally
- Pages must not reference DaisyUI class names directly (except inside `<page>Assets/` when truly page-exclusive)
- UI variants must be typed and come from `@shared` enums/constants
- Reusable components must be domain-neutral and typed

### ❌ Forbidden UI Patterns

- Duplicated markup across pages
- Domain logic inside components
- Components tied to a single page context
- Hardcoded UI variant strings (e.g. `"primary"`, `"secondary"`) outside component internals

---

## 📄 Page Composition Rule

Pages must be thin.

A page file must only:

- Render layout
- Render reusable components
- Call its controller
- Bind UI events

### Responsibility Distribution

Business logic belongs in:

- `<pageName>.controller.ts`
- `services/`

HTTP belongs in:

- `api/`

DaisyUI belongs in:

- `components/` (and only page-only assets inside `<page>Assets/`)

---

## 📚 Documentation Rules

Every exported function in:

- `services/`
- `api/`
- `platform/`
- `state/` (store actions)

Must have JSDoc with:

- `@summary`
- `params`
- `return` shape

**Example:**

```typescript
/**
 * @summary Fetches all tags available for the authenticated user.
 */
export async function listTags(): Promise<ApiResponse<TagEntity[]>> {
  ...
}
```

---

## 🔍 Required "Necessary Differences" Policy

If the frontend differs from backend structure, it must be documented as:

```
NECESSARY DIFFERENCE
```

### Examples of Necessary Differences

- `components/` exists (backend does not render UI)
- `platform/` exists (backend does not need Capacitor abstractions)
- `frontend` uses `api/` instead of `repositories/` (because its repository is HTTP)
- `theme.store.ts` exists (backend does not manage UI themes)

**Important:** Any difference not explicitly documented is considered a bug.

---

## ✅ PR Checklist (Mandatory)

- [ ] No folder named `shared/` exists inside frontend
- [ ] All shared types/enums/constants are imported from `@shared/*`
- [ ] No duplicated enums/types exist in frontend
- [ ] No hardcoded repeated strings for variants/keys/routes/events (must use enums or typed consts)
- [ ] Theme is controlled via `state/theme.store.ts` and applied through `data-theme`
- [ ] Only two themes exist: light (default) and dark
- [ ] No DaisyUI class names appear directly inside `src/pages/**` (except inside `<page>Assets/`)
- [ ] No `fetch()` exists outside `src/api/`
- [ ] No `window.location` exists
- [ ] Navigation uses `routes/navigation.ts`
- [ ] `localStorage` is only used inside `platform/storage`
- [ ] Services do not depend on UI
- [ ] Components do not contain business logic
- [ ] Pages contain no duplicated markup
- [ ] Any structural difference is documented as "NECESSARY DIFFERENCE"
- [ ] Auth refresh flow works and is centralized
- [ ] Router uses History API only (no hash router)

---

## 📖 Good vs Bad Examples

### ✅ Good: Page uses controller + typed UI enums

**File:** `pages/login/login.tsx` calls:

- `login.controller.ts`
- `auth.service.ts`

And uses:

- `UI.ButtonVariant.PRIMARY` (from `@shared`), not `"primary"`

### ❌ Bad: Hard strings + DaisyUI in page

```html
<button class="btn btn-primary">Login</button>
```

**Violations:**

- DaisyUI used directly in page
- Hardcoded `"primary"` styling logic bypassing our typed API

---

### ✅ Good: Component maps typed variant to DaisyUI internally

Page code:

```typescript
<Button variant={UI.ButtonVariant.PRIMARY}>Save</Button>
```

Component internally maps:

```typescript
UI.ButtonVariant.PRIMARY → "btn-primary"
```

---

### ✅ Good: Service uses API

**File:** `services/tags/tags.service.ts` calls:

- `api/tags/tags.api.ts`
- All types come from `@shared/domains/*`

### ❌ Bad: HTTP in page

```typescript
fetch("/tags");
```

This violates architecture. HTTP must be in `api/`.

---

### ❌ Bad: Component knows domain rules

A `Button` component checking:

```typescript
if (user.role === "admin") { ... }
```

This is business logic leaking into UI.

---

### ✅ Good: Page exclusive component isolated

**File:** `src/pages/tags/tagsAssets/TagFormModal.tsx`

Not reusable, so it must not pollute global `components/`.

---

## 🤖 Enforcement Notes for Agents

Any code generation must:

- Follow the folder structure exactly
- Respect layer boundaries
- Avoid introducing "shortcuts"
- Avoid inventing new modules/domains not present in backend
- Avoid inventing types/enums/constants already available in `@shared`
- Keep DaisyUI encapsulated inside `components/` (or page-only `<page>Assets/`)
- Ensure theme management is centralized and typed
- Avoid hard strings by using enums or typed constants

If something is missing, create a placeholder file with a clear TODO comment describing what is missing and why. Prefer adding shared enums/constants to the monorepo `shared/` folder rather than duplicating them in frontend.

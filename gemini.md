# Laurus Frontend Architecture Guide

## Backend-Mirrored, IA-Friendly, Maintenance-Oriented

## Purpose

This document defines the **mandatory architectural structure** for the new Laurus frontend.

The primary goals are:

-   Maximum clarity for new developers and AI agents

-   Strong alignment with backend architecture

-   Long-term maintainability

-   Explicit separation of responsibilities

This document is **normative**.

If something is unclear, follow this document over assumptions.

* * *

## System Context

### Authoritative Source of Truth

-   `/backend`

    -   Node.js

    -   TypeScript

    -   MySQL

    -   Domain-Driven architecture

All **domain names, boundaries, and business rules** originate here.

* * *

### Legacy Reference (Read-Only)

-   `/frontend_old` (Next.js)

May be used **only** as:

-   Business rule reference

-   UX/layout inspiration

Must **NOT** be copied:

-   React components

-   Hooks

-   JSX

-   Framework-specific abstractions

* * *

### Development Target

-   `/frontend`

    -   Vanilla TypeScript

    -   Vite

    -   Tailwind CSS

    -   DaisyUI

* * *

## Core Architectural Principle

> **The frontend must mirror the backend structure and naming.**

If a backend developer opens the frontend repository, it should feel familiar within minutes.

* * *

## Global Folder Structure

```
frontend/
├── public/
├── src/
│   ├── core/
│   ├── shared/
│   ├── modules/
│   ├── styles/
│   ├── main.ts
│   └── index.html
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

* * *

## `core/` – Application Infrastructure

The `core` folder contains **cross-cutting concerns**.

Nothing here belongs to a specific business domain.

```
core/
├── router/
├── http/
├── auth/
├── settings/
└── state/
```

### Rules

-   No domain-specific logic

-   No UI rendering (except layout bootstrap)

-   Shared by the entire application

* * *

### `core/router/`

```
router/
├── router.ts
└── routes.ts
```

**Responsibilities**

-   Map URLs to controllers

-   Inject rendered content into `#router-outlet`

**Forbidden**

-   Business rules

-   Repository access

-   Authentication logic

* * *

### `core/http/`

```
http/
└── httpClient.ts
```

**Responsibilities**

-   Centralized HTTP configuration

-   Base URL

-   Headers

-   Token injection

-   Global error handling

Mirrors backend HTTP clients or database connectors.

* * *

### `core/auth/`

```
auth/
├── AuthState.ts
├── authStore.ts
└── authGuard.ts
```

**Responsibilities**

-   Authentication state

-   Token lifecycle

-   Route protection

UI reacts to auth state.

Auth logic never lives in controllers.

* * *

### `core/settings/`

```
settings/
├── UserSettings.ts
├── settingsStore.ts
└── settingsService.ts
```

**Examples**

-   Theme (dark/light)

-   Currency

-   Date format

-   Locale

Mirrors backend configuration modules.

* * *

### `core/state/`

```
state/
└── store.ts
```

Minimal observable store used by:

-   auth

-   settings

-   global UI state

No domain data belongs here.

* * *

## `shared/` – Reusable UI & Utilities

```
shared/
├── layout/
├── components/
└── utils/
```

Contains **reusable technical assets**, not business logic.

* * *

### `shared/layout/`

```
layout/
├── LayoutShell.ts
├── Header.ts
└── Sidebar.ts
```

**LayoutShell**

-   Rendered once

-   Contains `<main id="router-outlet">`

-   Never re-created on navigation

* * *

### `shared/components/` – UI Primitives

```
components/
├── Button.ts
├── Input.ts
├── Modal.ts
└── Select.ts
```

**Rules**

-   No business logic

-   No fetch

-   No domain knowledge

-   Only HTML + DaisyUI classes

* * *

### `shared/utils/`

```
utils/
├── formatCurrency.ts
├── formatDate.ts
└── parseLocale.ts
```

Pure helpers. No side effects.

* * *

## `modules/` – Business Domains (Backend Mirror)

This is the **most important folder**.

```
modules/
├── auth/
├── users/
├── accounts/
├── transactions/
└── receipts/
```

Each module **must match backend naming and boundaries**.

* * *

## Mandatory Module Structure

Example: `modules/users/`

```
users/
├── domain/
├── services/
├── repositories/
├── controllers/
└── index.ts
```

Names are intentionally aligned with backend concepts.

* * *

## Layer Responsibilities (Strict)

### `domain/` – Business Rules

```
domain/
├── User.ts
├── UserErrors.ts
└── UserRepository.ts
```

**Allowed**

-   Entities

-   Value objects

-   Validation

-   Business rules

-   Interfaces (ports)

**Forbidden**

-   DOM

-   HTTP

-   UI

-   Frameworks

This code must be runnable in Node.js without changes.

* * *

### `services/` – Use Cases

```
services/
├── registerUser.ts
├── confirmEmail.ts
└── loginUser.ts
```

**Responsibilities**

-   Orchestrate domain logic

-   Coordinate repositories

-   Represent user actions

**Forbidden**

-   Rendering

-   Styling

-   Direct HTTP calls

-   Domain redefinition

* * *

### `repositories/` – API Adapters

```
repositories/
└── UserApiRepository.ts
```

**Responsibilities**

-   Implement domain repository interfaces

-   Call backend endpoints

-   Map API data to domain models

Only this layer changes if the backend changes.

* * *

### `controllers/` – UI Entry Points

```
controllers/
├── UserFormController.ts
└── UserPageController.ts
```

**Responsibilities**

-   Handle DOM events

-   Call services

-   Render UI

**Forbidden**

-   Business rules

-   Calculations

-   Repository access

Controllers must remain thin.

* * *

## Styling Strategy (DaisyUI)

-   DaisyUI is used for **visual consistency**

-   Themes are centralized in `tailwind.config.js`

-   UI primitives encapsulate repeated patterns

-   Screen-specific markup may use DaisyUI classes directly

DaisyUI does **not** define architecture.

* * *

## Compilation & Development

### Tooling

-   Vite

-   TypeScript

-   Tailwind

-   DaisyUI

### Behavior

-   Instant rebuild on save

-   Hot reload without shell recreation

-   No framework runtime errors

All bootstrapping happens in `main.ts`.

* * *

## Guiding Principles

When in doubt:

1.  Mirror the backend

2.  Keep the domain pure

3.  Keep controllers thin

4.  Prefer clarity over cleverness

5.  Optimize for the next developer

* * *

## Final Note

This architecture prioritizes:

-   Understanding over speed

-   Maintenance over novelty

-   Explicit structure over convention magic

If it feels strict, that is intentional.

* * *

Agora sim:

✔ Markdown válido

✔ Renderiza corretamente

✔ Pronto para IA e humanos

✔ Dá para versionar, revisar e usar como régua técnica

Se quiser, o próximo passo natural é transformar isso em:
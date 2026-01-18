Project Overview
You are acting as a Senior Frontend Architect. The project is a financial management system called Laurus.

System Context
Authoritative Source of Truth: /backend (Node.js/TypeScript/MySQL).

Legacy Reference: /frontend_old (Next.js - to be used for logic/layout inspiration only).

Development Target: /frontend (New Vanilla TypeScript implementation).

Architectural Principles (DDHA - Domain-Driven Hexagonal Architecture)
Mirror the backend modularity. Every domain module must be strictly layered:

Domain Layer: Pure TypeScript logic, Entities, and Repository Interfaces (Ports). No dependencies on UI or API.

Application/Service Layer: Use Cases and orchestration of business rules.

Infrastructure Layer:

API/Repositories: Secondary Adapters implementing repository ports using Axios.

UI/Controllers: Primary Adapters handling DOM events and rendering using Daisy UI/Tailwind.

Coding Standards
Language: 100% English for code, comments, and documentation.

Documentation: Use JSDoc with @summary tags for every class and method, matching the backend style.

Naming: Follow backend component naming conventions (e.g., AuthService, AuthRepository).

Minimalism: Keep components thin and logic encapsulated in the Domain or Service layers.

Icons: Use Phosphor Icons and Hero Icons.

Routing & Layout
Use a Shell Architecture (Single Page Application).

Persistent Header/Sidebar rendered once in a LayoutShell.

Dynamic content injected into a #router-outlet.
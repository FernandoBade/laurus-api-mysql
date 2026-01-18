# Testing Guide

## Structure
- Unit tests live under `tests/unit`, organized by layer:
  - `tests/unit/controllers` for HTTP/controller logic.
  - `tests/unit/services` for business rules with repositories mocked.
  - `tests/unit/utils` for shared helpers and middleware.
- Shared factories and express mocks are in `tests/helpers` to keep specs lean.

## Commands
- `npm test` runs the Jest suite.
- `npm run test:watch` reruns tests on file changes.
- `npm run test:coverage` collects coverage (thresholds set globally; raise as the suite grows).
- `npm run test:ci` runs Jest serially with coverage for CI usage.

## Conventions
- Test files end with `.test.ts` and mirror source names where possible.
- Controllers mock their services; services mock repositories and cross-service calls; middleware mocks external utilities.
- Prefer the factories in `tests/helpers/factories.ts` for building valid inputs/entities; express mocks in `tests/helpers/mockExpress.ts` cover common request/response shapes.
- Keep tests deterministic: no real DB, network, or filesystem writes. Use Jest spies/mocks for side effects like logging.

## Coverage
- Coverage focuses on application logic (controllers, services, auth). Database setup, routes, and generated files are excluded.
- Thresholds are intentionally modest for the initial suite; increase them as more areas gain test coverage.

## Adding Tests
- Place new service specs in `tests/unit/services` and controller specs in `tests/unit/controllers`.
- Reuse factories/mocks, add small helpers with `@summary` JSDoc when patterns repeat.
- Assert on behavior and contracts (status codes, return shapes, guards) rather than internal implementation details.

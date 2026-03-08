# Web Implementation Plan (Based on web-example)

## Goal
- Rebuild the frontend in `web/` using `web-example` component architecture.
- Keep visual patterns from `project-images` and `design-system.md`.
- Replace PocketBase auth with FinanceApp API JWT auth.

## Current Status
- Base React + TypeScript app initialized.
- Tailwind configured with semantic tokens and utility aliases.
- Core UI primitives migrated to TSX (`Button`, `Input`, `Card`, `Select`, `DropdownMenu`, `Toast`, etc.).
- Routing skeleton and protected area created.

## Phased Execution

### Phase 1 - Foundation (done)
- Project setup, deps, alias, tailwind tokens.
- Basic route structure.

### Phase 2 - Auth Architecture (in progress)
- Zustand auth store with persistence.
- Axios interceptor with token injection and 401 logout.
- Session bootstrap via `/auth/me` at app startup.
- ProtectedRoute with loading gate.

### Phase 3 - Web-example Component Port
- Layout: `Header`, `Sidebar`, `PageWrapper`, `ScrollToTop`.
- UI primitives complete and reusable.
- Keep component API compatibility for fast page migration.

### Phase 4 - Page Parity
- Login/Register parity with reference images.
- Dashboard and Transfers composition from reusable components.
- Replace placeholder data with API hooks/services.

### Phase 5 - Data and State
- Hooks: `useSummary`, `useMonthlySummary`, `useCategorySummary`, `useTransactions`.
- Cache invalidation and pagination patterns.

### Phase 6 - Quality
- Loading skeletons, empty/error states.
- Responsive adjustments.
- Accessibility and keyboard interactions.

## Auth Optimization Tactics
- Bootstrap strategy: load persisted token, validate once using `/auth/me`, then unblock UI.
- Fail-fast on invalid token: clear state on 401 and redirect to `/login`.
- Single source of truth: auth store owns token/user/session lifecycle.
- Guarded navigation: protected routes wait for bootstrap before redirect.
- Future-ready extension:
  - Refresh token flow (if backend adds refresh endpoint).
  - Role/permission checks in route guards.
  - BroadcastChannel sync for multi-tab logout.

## Next Execution Batch
1. Refine Login/Register to exact spacing/typography from `project-images`.
2. Implement `KpiCard`, charts and transaction table components from `web-example` patterns.
3. Wire summary/transactions hooks to backend endpoints.
4. Replace remaining placeholder sections with real API data.

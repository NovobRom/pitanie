# Design: Comprehensive Review Improvements

## Context

Dose is a nutrition-tracking PWA built on Next.js 16 + React 19 + Supabase + Tailwind CSS 4. The current codebase is a single-page `'use client'` application where all routing is handled via `useState` tabs, all state lives in a single component tree rooted in `page.tsx`, and Supabase calls are made directly from components. A comprehensive audit surfaced 27+ issues spanning security, architecture, performance, testing, accessibility, error handling, and visual design.

### Current State Summary

| Area | Current State | Risk |
|---|---|---|
| **Credentials** | Hardcoded Supabase URL + anon key in `supabaseClient.ts` with fallback literals | Critical — key rotation impossible, leaked in git history |
| **Components** | 12 flat files in `src/components/`, three exceeding 300 lines (AuthWall, ProfileModal, FoodSearchModal) | God components, untestable, violate 250-line rule |
| **Routing** | Single `page.tsx` (209 lines), no URL routes, no deep linking | No code splitting, no back-button support |
| **Types** | `Macros` in `nutrition.ts`, `DailyGoals` in `types.ts` — identical shapes; `FoodProduct` vs `Product` vs `CatalogFood` | Duplication causes mismatches and casting |
| **State** | All state lifted to `page.tsx`, props drilled 2–3 levels deep | Tight coupling, re-render cascade on every keystroke |
| **Data access** | Supabase calls inline in `page.tsx`, `cloud.ts`, and components | No error normalization, no retry, no caching |
| **Security** | No auth middleware on API routes, no security headers, no input validation | Open proxy abuse, XSS/clickjacking vectors |
| **Testing** | Zero tests, no test framework installed | Regressions ship silently |
| **A11y** | No ARIA labels, no `lang` attribute, no focus management | Fails WCAG AA |
| **Design** | Warm-neutral palette with `@theme` tokens, no animations, no glassmorphism | Flat, static feel; does not meet premium bar |

### Route Structure After Migration

```
src/app/
├── (auth)/
│   └── login/page.tsx          # AuthWall content
├── (app)/
│   ├── layout.tsx              # Authenticated shell (header + nav)
│   ├── page.tsx                # Dashboard (redirect target)
│   ├── diary/page.tsx          # MealDiary
│   ├── profile/page.tsx        # Profile (full page, not modal)
│   └── plans/page.tsx          # Saved plans list
├── share/[id]/page.tsx         # Public shared plan (no auth)
├── api/
│   ├── search-food/route.ts
│   └── ai-chat/route.ts
├── layout.tsx                  # Root: fonts, metadata, providers
└── globals.css
```

---

## Goals / Non-Goals

### Goals

1. **Eliminate all critical security vulnerabilities** — no hardcoded secrets, validated inputs, protected API routes, defence-in-depth headers.
2. **Decompose god components** below 250 lines each, extract a service layer, and unify duplicate types into a single source of truth.
3. **Migrate to App Router** with URL-based routes, enabling deep linking, browser back-button, per-route code splitting, and SSR where beneficial.
4. **Establish a premium design system** with glassmorphism, gradient accents, micro-animations, dark-mode support, and responsive mobile-first layouts.
5. **Add performance guardrails** — memoization, lazy loading, DB indexes, pagination, and debouncing.
6. **Bootstrap testing infrastructure** with unit, integration, and e2e coverage for critical paths.
7. **Reach WCAG AA compliance** — ARIA, focus traps, keyboard nav, semantic HTML, `lang` attribute.
8. **Implement structured error handling** — error boundaries, user-facing toasts, input validation feedback, and centralized logging.

### Non-Goals

- **SSR for all pages.** Only the shared-plan page (`/share/[id]`) benefits from server rendering (SEO, OG meta); all authenticated pages stay client-rendered.
- **Full offline / PWA support.** Service worker caching is out of scope; the app requires network for Supabase.
- **Backend migration.** Supabase remains the sole backend; no custom server, no API gateway.
- **Complete i18n overhaul.** We fix the known bugs (Russian text in Ukrainian dictionary) and split bundles, but do not add new languages.
- **CI/CD pipeline.** The testing infrastructure is local-first; CI integration is a follow-up task.

---

## Decisions

### D1 — Security Hardening

#### D1.1 Credential management: env-only with fail-fast

**Decision:** Remove all hardcoded fallback values from `supabaseClient.ts`. The client constructor reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `process.env` and throws at module-load time if either is missing. `.env.example` retains keys with `"your-…-here"` placeholder values.

**Why this over alternatives:**
- *Keeping fallbacks* (current state) means the app silently works even when `.env` is misconfigured — and ships real credentials in git.
- *Runtime warning without crash* would let the app boot in a broken state, producing confusing Supabase 401 errors downstream.
- *Build-time env validation* (e.g. `@t3-oss/env-nextjs`) was considered but adds a dependency for a two-variable check; a simple guard is sufficient at this scale.

#### D1.2 Security headers via `next.config.ts`

**Decision:** Add a `headers()` function in `next.config.ts` returning CSP, HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy for all routes.

**Why `next.config.ts` and not middleware:**
- Headers are static and apply globally — config-level is the idiomatic Next.js approach and avoids middleware cold-start cost.
- Middleware is reserved for dynamic logic (auth checks, redirects).

#### D1.3 API route auth middleware

**Decision:** Create a shared `withAuth` higher-order function (`src/lib/middleware/withAuth.ts`) that wraps API route handlers. It extracts the Supabase session from the request cookies, returns 401 if absent, and passes the authenticated `user` to the handler.

**Why HOF over Next.js middleware matcher:**
- The middleware matcher approach applies to all matching routes, making it hard to exempt public endpoints.
- A per-handler wrapper is explicit, composable, and testable in isolation.

#### D1.4 Input validation in `calcGoals()`

**Decision:** Add range checks (weight 20–500 kg, height 50–300 cm, age 1–150, bodyFat 1–70%) before computation. Return a structured `ValidationError` instead of `null`.

**Why structured errors over `null`:**
- `null` tells the caller "something failed" but not what — the UI cannot show field-specific feedback.
- A `{ field, message }` array enables inline validation UX without guessing.

---

### D2 — Layered Architecture

#### D2.1 Service layer with repository pattern

**Decision:** Introduce a `src/services/` directory with domain-specific modules:

| Service | Responsibility |
|---|---|
| `diary.service.ts` | Load / save / delete diary entries for a date |
| `profile.service.ts` | Read / update user profile + goals |
| `plans.service.ts` | CRUD shared plans, pagination |
| `food-search.service.ts` | OpenFoodFacts API proxy, result normalization |

Each service function accepts typed inputs and returns `Promise<Result<T, AppError>>`, a discriminated union that forces callers to handle errors explicitly. Services call Supabase via a thin repository layer (`src/repositories/`) that maps DB rows to domain types.

**Why repository + service instead of direct Supabase calls:**
- Components currently mix UI logic with data-fetching and error-swallowing `console.error` calls.
- A service boundary lets us swap Supabase for another backend without touching 12 component files.
- The repository layer centralizes row-to-type mapping, eliminating scattered `as` casts.

**Why `Result<T, E>` over thrown exceptions:**
- TypeScript does not type-check thrown exceptions. A result type makes the error path visible at the call site.
- Aligns with the error-handling capability (D8).

#### D2.2 Component decomposition strategy

**Decision:** Split each god component into a feature folder:

```
src/components/auth/
├── AuthWall.tsx          # Shell: layout + routing logic (~80 lines)
├── LoginForm.tsx         # Email/password form
├── SignUpForm.tsx        # Registration form
└── SocialProviders.tsx   # OAuth buttons

src/components/profile/
├── ProfilePage.tsx       # Layout + tabs (~100 lines)
├── GoalCalculator.tsx    # CalcParams form + result display
├── PersonalInfoForm.tsx  # Weight, height, age, sex
└── MacroSliders.tsx      # Protein/fat ratio adjusters

src/components/food-search/
├── FoodSearchModal.tsx   # Modal shell + state (~80 lines)
├── SearchInput.tsx       # Debounced input + recent searches
├── SearchResults.tsx     # Virtualized product list
└── FoodDetailCard.tsx    # Portion selector + macro preview
```

**Why feature folders over flat files:**
- Flat structure scales poorly past ~15 files; feature folders co-locate related code and enable per-feature lazy loading.
- Each sub-component stays under 120 lines, well within the 250-line rule.

#### D2.3 Type unification

**Decision:** Create a single `src/types/nutrition.ts` defining:

```typescript
interface NutritionValues {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}
```

Retire `Macros` from `nutrition.ts`, `DailyGoals` from `types.ts`, and inline anonymous types from `page.tsx`. All imports point to the canonical `NutritionValues`.

**Why one interface over type aliases:**
- `Macros` and `DailyGoals` have identical shapes `{ calories, protein, fat, carbs }`. Two names for the same shape create confusion about which to import.
- A single name (`NutritionValues`) eliminates the "which type do I use?" question and prevents future divergence.

#### D2.4 Context splitting

**Decision:** Replace the monolithic state in `page.tsx` with three domain-specific React contexts:

| Context | State | Provider location |
|---|---|---|
| `AuthContext` | `user`, `session`, `isLoading` | Root layout |
| `DiaryContext` | `meals`, `currentDate`, CRUD operations | `(app)/layout.tsx` |
| `ProfileContext` | `goals`, `profile`, update operations | `(app)/layout.tsx` |

**Why three contexts over a single store (Zustand, Redux):**
- The app has three clearly-bounded domains. React Context + `useReducer` handles each with zero dependencies.
- External state libraries add bundle weight and learning curve for what is currently a small-team project.
- If state complexity grows (offline sync, optimistic updates), Zustand can be introduced per-context without a full rewrite.

---

### D3 — App Router Navigation

#### D3.1 Route group layout strategy

**Decision:** Use two route groups: `(auth)` for unauthenticated pages (login) and `(app)` for authenticated pages (dashboard, diary, profile, plans). The `(app)` group shares a layout with the header, nav bar, and auth guard.

**Why route groups over a single layout with conditional rendering:**
- Route groups let Next.js generate separate JS bundles per group — an unauthenticated user never downloads dashboard code.
- The auth guard lives in one layout instead of being duplicated in every page.

#### D3.2 Navigation component

**Decision:** Replace the `useState`-based tab bar in `Header.tsx` with a `<NavBar>` component using `next/link` and `usePathname()` for active-state detection. The nav bar lives in `(app)/layout.tsx`.

**Why `next/link` over `useRouter().push()`:**
- `next/link` prefetches on viewport entry, enabling instant navigation.
- Declarative links are accessible by default (anchor elements with `href`).

#### D3.3 Profile as a page, not a modal

**Decision:** Move ProfileModal from a conditional overlay to a dedicated `/profile` route.

**Why a page over a modal:**
- The profile form is complex (7+ fields, calculator, result display) — too heavy for a modal on mobile screens.
- A dedicated route enables deep linking (`/profile`), browser back-button, and independent lazy loading.
- FoodSearch remains a modal because it is a transient action within the diary page.

---

### D4 — Design System v2

#### D4.1 Visual language: glassmorphism + gradient accents

**Decision:** Evolve the existing warm-neutral palette with:
- **Glassmorphism cards:** `backdrop-filter: blur(16px)`, semi-transparent backgrounds (`rgba(255,255,255,0.7)`), subtle 1px border with `rgba(255,255,255,0.3)`.
- **Gradient accents:** Primary-to-accent gradient (`#7c9885 → #f39c6b`) for CTAs, progress bars, and active nav states.
- **Extended palette:** Add success, warning, error semantic colors; add a dark-mode layer using `prefers-color-scheme`.

**Why glassmorphism over flat / neumorphism:**
- Glassmorphism adds visual depth without heavy shadows, works well with the existing warm palette, and is the current premium trend in health/wellness apps.
- Neumorphism has known contrast/accessibility issues; flat design is too plain for the premium goal.

#### D4.2 Micro-animations via CSS + Framer Motion

**Decision:** Use CSS transitions for simple hover/focus effects (opacity, transform, color). Use Framer Motion for orchestrated animations (page transitions, list reorder, modal enter/exit, progress bar fills).

**Why Framer Motion over CSS-only or GSAP:**
- Framer Motion integrates natively with React's component model (`AnimatePresence`, layout animations).
- CSS alone cannot handle exit animations (unmounting elements) or layout animations.
- GSAP is more powerful but imperative, harder to maintain in a declarative React codebase, and heavier (44 KB vs 32 KB).

#### D4.3 Typography via `next/font`

**Decision:** Load Inter (body) and Nunito (headings) via `next/font/google` in the root layout, eliminating render-blocking Google Fonts stylesheet requests.

**Why `next/font` over `<link>` tags:**
- Automatic self-hosting, font-display optimization, zero layout shift.
- Already partially configured (CSS references `Inter` and `Nunito`) but not loaded through `next/font`.

#### D4.4 Mobile-first responsive approach

**Decision:** Default styles target mobile (< 640px). Use Tailwind `sm:`, `md:`, `lg:` breakpoints to enhance for larger screens. The nav bar switches from a bottom tab bar (mobile) to a sidebar or top bar (desktop).

**Why mobile-first over desktop-first:**
- Nutrition tracking is primarily a mobile activity (logging meals on the go).
- Mobile-first CSS produces smaller default stylesheets.

---

### D5 — Performance Optimization

#### D5.1 Memoization strategy

**Decision:** Apply `React.memo` to pure presentational components (`SearchResults`, `FoodDetailCard`, `MacroSliders`). Use `useMemo` for derived data (`calculateConsumed()` in `page.tsx`). Use `useCallback` for event handlers passed as props across context boundaries.

**Why selective memoization over blanket `memo()`:**
- Blanket memoization adds memory overhead and props-comparison cost on every render.
- Target components that (a) receive stable props but sit under frequently-updating parents, or (b) perform expensive computations.
- The `calculateConsumed()` function currently re-runs on every render even when `meals` hasn't changed — a clear `useMemo` candidate.

#### D5.2 Route-level code splitting (automatic via App Router)

**Decision:** Leverage App Router's per-route code splitting. Additionally, lazy-load heavy sub-components (`FoodSearchModal`, charts) via `React.lazy()` + `Suspense`.

**Why not manual `dynamic()` everywhere:**
- App Router already splits at the route level. `React.lazy` adds value only for large components loaded conditionally within a route.

#### D5.3 Database indexes

**Decision:** Add composite indexes:
- `diary_entries(user_id, date)` — the primary query pattern for loading a day's diary.
- `weight_history(user_id, date)` — the primary query pattern for weight trend charts.
- `plans(owner_id, title)` — used for upsert conflict detection (currently without index).

**Why composite over single-column indexes:**
- All queries filter by `user_id` AND `date`/`title`. A composite index satisfies the full WHERE clause in a single index scan; two single-column indexes would require an index intersection.

#### D5.4 Debouncing and pagination

**Decision:** Add 300ms debounce to food search input. Add cursor-based pagination to `listMyPlans()` and diary history queries (20 items per page).

**Why cursor-based over offset-based pagination:**
- Offset pagination breaks when items are inserted/deleted between pages.
- Cursor-based (`created_at < ?`) is stable and performs better with large datasets.

---

### D6 — Testing Infrastructure

#### D6.1 Framework: Vitest + React Testing Library + Playwright

**Decision:**
- **Unit / Integration:** Vitest + `@testing-library/react` + `@testing-library/user-event`.
- **E2E:** Playwright.

**Why Vitest over Jest:**
- Vitest uses the same Vite transform pipeline as Next.js 16's Turbopack-compatible tooling, eliminating separate Babel/Jest transform config.
- Native ESM support — no `transformIgnorePatterns` gymnastics for `@supabase/supabase-js`.
- 2–5× faster test execution via worker pool and smart caching.
- API-compatible with Jest (`describe`, `it`, `expect`), so migration cost is near zero.

**Why Playwright over Cypress:**
- Multi-browser support out of the box (Chromium, Firefox, WebKit).
- Faster execution — no Electron wrapper overhead.
- Better async handling with auto-waiting.

#### D6.2 Testing strategy by layer

| Layer | What to test | Tool |
|---|---|---|
| **Utils / business logic** | `calcGoals()`, `macrosForGrams()`, validation | Vitest unit tests |
| **Services** | `diary.service.ts`, `plans.service.ts` with mocked repos | Vitest + vi.mock |
| **Components** | Render, user interaction, a11y assertions | React Testing Library |
| **Pages (E2E)** | Login flow, add food, save diary, navigate between routes | Playwright |

#### D6.3 Coverage targets

**Decision:** Aim for 80% line coverage on `src/services/` and `src/lib/`, 60% on components, no mandatory coverage on e2e. Coverage gating is a non-goal for the first iteration (see Non-Goals: no CI).

---

### D7 — Accessibility Compliance

#### D7.1 WCAG AA scope

**Decision:** Target WCAG 2.1 AA for all interactive elements. Key deliverables:

| Requirement | Implementation |
|---|---|
| `lang` attribute | `<html lang="uk">` (or dynamic from i18n context) in root layout |
| Headings hierarchy | Single `<h1>` per page, `<h2>`–`<h4>` for sections |
| ARIA labels | All icon buttons, inputs, modals get `aria-label` or `aria-labelledby` |
| Focus traps | Modals (`FoodSearchModal`) trap focus and return it on close |
| Keyboard nav | All interactive elements reachable via Tab; Enter/Space activate; Escape closes modals |
| Color contrast | All text meets 4.5:1 ratio; large text meets 3:1 |
| Skip link | "Skip to main content" link as first focusable element |

#### D7.2 Focus management for modals

**Decision:** Use `@radix-ui/react-dialog` (or implement manually with `inert` attribute) for modal focus trapping. On open, focus moves to the first focusable element inside the modal. On close, focus returns to the trigger element.

**Why `inert` over `aria-hidden` + manual trap:**
- The `inert` attribute natively prevents all interaction and focus on elements behind the modal — simpler and more reliable than manual `aria-hidden` + `tabindex` manipulation.
- Browser support is now universal (Baseline 2023).

---

### D8 — Error Handling

#### D8.1 Error boundary hierarchy

**Decision:** Place error boundaries at three levels:

```
RootErrorBoundary          → catches catastrophic failures, shows full-page fallback
  └── RouteErrorBoundary   → per-route `error.tsx` files (App Router convention)
       └── SectionBoundary → wraps independent UI sections (e.g., chart, food search)
```

**Why three levels over a single global boundary:**
- A single boundary means any error nukes the entire page. Granular boundaries let unrelated sections keep working.
- App Router's `error.tsx` convention provides route-level boundaries for free.

#### D8.2 User-facing error states

**Decision:** Define a `<ErrorCard>` component for recoverable errors (network failures, validation errors) with:
- An icon + human-readable message (i18n-keyed).
- A "Retry" button that re-invokes the failed operation.
- An optional "Details" expandable section for technical info (in dev mode).

**Why a dedicated component over `alert()` or console-only:**
- `alert()` blocks the UI thread and is not styleable.
- Console-only errors are invisible to users.
- A branded error card maintains UX consistency and gives users an actionable recovery path.

#### D8.3 `Result<T, E>` for service layer

**Decision:** All service functions return `Result<T, AppError>`:

```typescript
type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

interface AppError {
  code: string;         // e.g. 'DIARY_LOAD_FAILED'
  message: string;      // user-facing, i18n key
  details?: unknown;    // technical details for logging
}
```

**Why discriminated union over try/catch:**
- TypeScript cannot infer thrown exception types, so `catch (e: unknown)` requires manual narrowing.
- A result type makes the error path explicitly typed, self-documenting, and impossible to forget.
- Services remain pure functions — easier to test without mocking `throw` behaviour.

#### D8.4 Structured logging

**Decision:** Create a `logger.ts` utility with `info`, `warn`, `error` methods that format messages as structured JSON (`{ timestamp, level, code, message, context }`). In development, output to console. In production, integrate with Vercel's log drain (no custom infrastructure).

**Why structured JSON over unstructured `console.error`:**
- Structured logs are searchable and filterable in Vercel / Datadog / any log aggregator.
- Current `console.error('Failed to load diary:', err)` loses context (which user, which date, what error type).

---

## Risks / Trade-offs

### R1 — Breaking changes during App Router migration

**Risk:** Moving from single-page `useState` tabs to multi-route App Router breaks all existing bookmarks (there are none — the app has no URL routes today) and requires significant restructuring of state management.

**Mitigation:** The migration is atomic per route — start with the dashboard, then diary, then profile. Each route can be developed and tested independently. The old single-page flow is removed only after all routes are verified.

### R2 — Bundle size increase from Framer Motion

**Risk:** Adding Framer Motion adds ~32 KB gzipped to the client bundle.

**Mitigation:** Import only the used components (`motion`, `AnimatePresence`), enable tree-shaking, and lazy-load animation-heavy sections. The visual quality improvement justifies the cost for a consumer-facing app.

### R3 — Over-engineering for current scale

**Risk:** The service layer + repository pattern + Result types add abstraction overhead for an app that currently has 7 lib files and 12 components.

**Mitigation:** The architecture is designed to be *just enough* — services are plain functions (no classes, no DI container), repositories are thin wrappers over Supabase calls, and Result types are a 5-line type alias. The benefit of testability and clear boundaries outweighs the small indirection cost.

### R4 — Vitest ecosystem maturity with Next.js

**Risk:** Vitest's Next.js integration is less battle-tested than Jest + `next/jest`.

**Mitigation:** `@vitejs/plugin-react` handles JSX transform. Server components are tested as plain functions. If Vitest integration proves problematic, fallback to Jest is low-cost due to API compatibility.

### R5 — Glassmorphism accessibility

**Risk:** Semi-transparent backgrounds with `backdrop-filter: blur()` can reduce text readability, especially on busy backgrounds.

**Mitigation:** All glass-effect surfaces will have a minimum background opacity of 0.7 and will be tested against WCAG 4.5:1 contrast ratios. Fallback to solid backgrounds on `prefers-reduced-transparency` media query.

### R6 — Credential rotation for existing deployment

**Risk:** Removing hardcoded credentials means any deployment without proper `.env` configuration will fail immediately.

**Mitigation:** This is intentional (fail-fast is the goal). Documentation in `README.md` and `.env.example` will clearly guide setup. The existing production deployment on Vercel already uses environment variables — the hardcoded fallbacks are a safety net that should never have been relied on.

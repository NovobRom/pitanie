## Why

A comprehensive code review revealed 27+ critical and significant issues across the Dose nutrition tracking app. The app has hardcoded production credentials in source code, god components exceeding 350 lines, zero test coverage, no server-side validation, unused Next.js App Router, and a monotone UI lacking visual depth. These issues create security vulnerabilities, technical debt, and a poor user experience that will compound as the app grows. Addressing them now prevents data breaches, improves maintainability, and elevates the product to a premium standard.

## What Changes

### Security (Priority 1)
- **BREAKING**: Remove hardcoded Supabase credentials from `supabaseClient.ts` — app will fail fast if env vars are missing
- **BREAKING**: Replace real credentials in `.env.example` with placeholders
- Add authentication middleware to API routes (`/api/search-food`, `/api/ai-chat`)
- Add security headers (CSP, HSTS, X-Frame-Options) via `next.config.ts`
- Add database check constraints for numeric fields (weight > 0, age > 0, etc.)
- Split overly permissive RLS policies into separate SELECT/INSERT/UPDATE/DELETE
- Add rate limiting on `create_shared_plan` for anon users
- Add input validation with proper range checks in `calcGoals()`

### Architecture (Priority 2)
- **BREAKING**: Decompose god components (AuthWall 320→ sub-components, ProfileModal 350→ sub-components, FoodSearchModal 305→ sub-components)
- Introduce service layer between components and Supabase (repository pattern)
- Migrate from single-page `useState` tabs to Next.js App Router with URL-based routing
- Split single React context into domain-specific contexts (auth, diary, profile)
- Remove dead code: AuthModal.tsx, CheatSheet.tsx, DayCard.tsx, MealCard.tsx (legacy), MacroBar.tsx (duplicate)
- Unify duplicate product types (FoodProduct, CatalogFood, Product → single interface)
- Unify DailyGoals and Macros interfaces
- Extract business logic from components into shared utilities

### Scalability (Priority 3)
- Add database indexes on `diary_entries(user_id, date)`, `weight_history(user_id, date)`
- Add pagination to data queries (diary entries, plans list, weight history)
- Add date-range filtering to cloud.ts queries instead of loading ALL data
- Add debouncing to food search and save operations
- Add React.memo, useMemo, useCallback for performance-critical paths
- Split i18n into per-language files with lazy loading

### Design / UX (Priority 4)
- New design system with depth, glassmorphism, gradients, and visual hierarchy
- Micro-animations and transitions for all interactive elements
- Empty states with illustrations instead of plain text
- Onboarding flow for new users
- Real weight trend chart visualization
- Responsive design with mobile-first approach
- Functional AI Chat section (currently dead UI)
- Delete confirmation dialogs

### Code Quality (Priority 5)
- Add unit tests, integration tests, and e2e test infrastructure
- Replace all `any` types with proper TypeScript types
- Add Error Boundaries for graceful error handling
- Add accessibility (ARIA labels, focus traps, keyboard navigation, html lang)
- Add type-safe i18n keys
- Fix i18n bug: Russian text in Ukrainian dictionary (line 299)
- Wrap localStorage access in try/catch

## Capabilities

### New Capabilities
- `security-hardening`: Credential management, security headers, input validation, rate limiting, and RLS policy improvements
- `layered-architecture`: Service layer, repository pattern, domain-specific contexts, and unified type system
- `app-router-navigation`: URL-based routing with Next.js App Router, deep linking, and code splitting
- `design-system-v2`: New premium visual design with glassmorphism, gradients, micro-animations, responsive layout, and empty states
- `performance-optimization`: Memoization, lazy loading, debouncing, DB indexes, pagination, and i18n splitting
- `testing-infrastructure`: Unit test setup, integration test patterns, and e2e testing framework
- `accessibility-compliance`: WCAG AA compliance, ARIA labels, focus management, keyboard navigation
- `error-handling`: Error boundaries, user-facing error states, input validation feedback, and structured error logging

### Modified Capabilities
_(No existing specs found in `openspec/specs/` — all capabilities are new)_

## Impact

### Code
- **All 12 components** in `src/components/` — decomposition, type fixes, a11y
- **All 7 lib files** — security fixes, service extraction, validation
- **All 5 data files** — type unification, dead code removal
- **API routes** — auth middleware, rate limiting
- **`src/app/`** — App Router migration, new route structure
- **`globals.css`** — complete design system overhaul

### Database
- New indexes, check constraints, split RLS policies
- Migration files needed

### Dependencies
- Potential new: chart library (weight trend), test framework (vitest/jest), animation library (framer-motion)

### Infrastructure
- `vercel.json` / `next.config.ts` — security headers
- `.env.example` — placeholder credentials

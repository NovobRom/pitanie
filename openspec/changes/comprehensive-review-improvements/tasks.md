## 1. Security Hardening

- [x] 1.1 Remove hardcoded fallback credentials from `supabaseClient.ts`
- [x] 1.2 Update `.env.example` with generic placeholder values
- [x] 1.3 Add authentication middleware to `/api/search-food` and `/api/ai-chat`
- [x] 1.4 Add `next.config.ts` security headers (CSP, HSTS)
- [x] 1.5 Implement input validation in `nutrition.ts`
- [x] 1.6 Update Supabase migration to split RLS policies (SELECT/INSERT/UPDATE/DELETE)

## 2. Layered Architecture & Routing

- [x] 2.1 Migrate from single page to Next.js App Router structure (`/`, `/diary`, `/profile`)
- [x] 2.2 Create `src/services/` layer for Supabase data fetching
- [x] 2.3 Split `shareState.ts` into multiple domain contexts (AuthContext, DiaryContext, ProfileContext)
- [x] 2.4 Unify product types across `foodCatalog.ts`, `products.ts`, and `types.ts`
- [x] 2.5 Decompose `AuthWall.tsx` into smaller sub-components
- [x] 2.6 Decompose `ProfileModal.tsx` into smaller sub-components
- [x] 2.7 Decompose `FoodSearchModal.tsx` into smaller sub-components
- [x] 2.8 Remove unused legacy components (AuthModal, CheatSheet, DayCard, MealCard, MacroBar)

## 3. Design System & UI

- [x] 3.1 Define CSS variable token system in `globals.css` (colors, spacing, typography)
- [x] 3.2 Implement Glassmorphism utility classes and apply to cards/modals
- [x] 3.3 Add smooth transitions and hover animations to all interactive elements
- [x] 3.4 Create empty state illustration components (Dashboard, Diary, Search)
- [x] 3.5 Implement weight trend line chart component using a chart library
- [x] 3.6 Update mobile responsive layout and bottom navigation bar
- [x] 3.7 Add delete confirmation dialogs for all destructive actions

## 4. Performance & Reliability

- [x] 4.1 Add `React.memo` and `useMemo`/`useCallback` to heavy components and calculations
- [x] 4.2 Implement input debouncing for food search in `FoodSearchModal`
- [x] 4.3 Add pagination/date-filtering to Supabase data fetching in services
- [x] 4.4 Set up React Error Boundaries to catch UI crashes
- [x] 4.5 Split `i18n.tsx` translations into separate loaded files
- [x] 4.6 Implement accessible ARIA attributes across all interactive components
- [x] 4.7 Configure Vitest and write basic tests for core nutrition logic

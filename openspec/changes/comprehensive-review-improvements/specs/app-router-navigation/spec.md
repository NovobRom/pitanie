# App Router Navigation

Delta spec for the `app-router-navigation` capability introduced by the comprehensive-review-improvements change.

## ADDED Requirements

### Requirement: App Router Route Structure

The application SHALL migrate from single-page `useState` tab switching to Next.js App Router with file-system based routing. Each major section of the app MUST have its own route segment under `src/app/`.

#### Scenario: Dashboard route exists
- **WHEN** a user navigates to `/dashboard`
- **THEN** the Dashboard page component SHALL render with the user's daily summary, macro progress, and quick actions

#### Scenario: Diary route exists
- **WHEN** a user navigates to `/diary`
- **THEN** the Meal Diary page component SHALL render with the selected date's food entries and meal sections

#### Scenario: Profile route exists
- **WHEN** a user navigates to `/profile`
- **THEN** the Profile page component SHALL render with user settings, goals configuration, and weight history

#### Scenario: AI Chat route exists
- **WHEN** a user navigates to `/ai-chat`
- **THEN** the AI Chat page component SHALL render with the chat interface

#### Scenario: Shared Plans route exists
- **WHEN** a user navigates to `/shared-plans`
- **THEN** the Shared Plans page component SHALL render with the list of available shared meal plans

#### Scenario: Root redirect
- **WHEN** a user navigates to `/`
- **THEN** the application SHALL redirect to `/dashboard` if the user is authenticated
- **AND** SHALL redirect to a login/auth page if the user is not authenticated

---

### Requirement: URL-Based Navigation

Navigation between app sections MUST be performed via URL changes using Next.js `<Link>` components or `useRouter()` navigation. The application MUST NOT use `useState` to toggle between tab views for primary navigation.

#### Scenario: Navigation updates URL
- **WHEN** a user clicks a navigation item for "Diary"
- **THEN** the browser URL SHALL change to `/diary`
- **AND** the Diary page content SHALL render

#### Scenario: No useState tab switching for primary nav
- **WHEN** the codebase is analyzed for primary navigation logic
- **THEN** no component SHALL use `useState` with tab index or tab name to switch between Dashboard, Diary, Profile, AI Chat, or Shared Plans views

#### Scenario: Browser back/forward works
- **WHEN** a user navigates from `/dashboard` to `/diary` to `/profile`
- **AND** the user presses the browser Back button
- **THEN** the browser SHALL navigate back to `/diary`
- **AND** pressing Back again SHALL navigate to `/dashboard`

---

### Requirement: Deep Linking Support

Every route in the application SHALL be directly accessible via its URL. Users MUST be able to bookmark, share, or directly type a URL to reach a specific page.

#### Scenario: Direct URL access to diary
- **WHEN** a user directly enters `https://app.example.com/diary` in the browser address bar
- **THEN** the application SHALL render the Diary page (after authentication if required)

#### Scenario: Deep link to specific date in diary
- **WHEN** a user navigates to `/diary?date=2026-06-28`
- **THEN** the Diary page SHALL render showing entries for June 28, 2026

#### Scenario: Shared link to a plan
- **WHEN** a user accesses `/shared-plans/[planId]`
- **THEN** the application SHALL render the specific shared plan detail page

---

### Requirement: Route-Level Code Splitting

Each route segment SHALL be automatically code-split by Next.js App Router. The JavaScript bundle for a given route MUST NOT include component code exclusive to other routes.

#### Scenario: Dashboard bundle excludes profile code
- **WHEN** the production build is analyzed with a bundle analyzer
- **THEN** the chunk loaded for `/dashboard` SHALL NOT include the ProfileForm, GoalsEditor, or WeightTracker components

#### Scenario: Diary page loads only diary-related code
- **WHEN** a user navigates to `/diary`
- **THEN** only the JavaScript chunks required for the Diary page and shared layout SHALL be downloaded
- **AND** AI Chat or Shared Plans component code SHALL NOT be included

#### Scenario: Dynamic imports for heavy components
- **WHEN** a route contains heavy components (e.g., chart libraries, rich text editors)
- **THEN** those components SHALL be dynamically imported with `next/dynamic` or `React.lazy`

---

### Requirement: Layout Component Hierarchy

The application SHALL use Next.js App Router layout components to define shared UI structure. A root layout SHALL provide the global shell (header, navigation, footer), and nested layouts MAY provide section-specific chrome.

#### Scenario: Root layout provides global shell
- **WHEN** any authenticated route is rendered
- **THEN** the root layout SHALL render the Header component with navigation and the main content area
- **AND** the layout SHALL persist across route transitions (no full re-mount)

#### Scenario: Navigation is always visible on authenticated routes
- **WHEN** a user navigates between `/dashboard`, `/diary`, `/profile`
- **THEN** the navigation bar SHALL remain mounted and visible throughout transitions
- **AND** the active navigation item SHALL update to reflect the current route

#### Scenario: Auth pages use a minimal layout
- **WHEN** the login or registration page is rendered
- **THEN** a separate minimal layout SHALL be used without the full app navigation shell

---

### Requirement: Navigation State Persistence

The application SHALL preserve navigation-relevant state across route transitions where appropriate, such as the selected date in the diary or scroll position.

#### Scenario: Selected date persists in diary
- **WHEN** a user selects a date on the `/diary` page, navigates to `/profile`, and returns to `/diary`
- **THEN** the previously selected date SHALL still be active in the diary view

#### Scenario: Scroll position is maintained
- **WHEN** a user scrolls down on the `/dashboard` page, navigates to `/diary`, and navigates back to `/dashboard`
- **THEN** the scroll position SHALL be restored to where the user left off

---

### Requirement: Protected Routes

All routes that require authentication (Dashboard, Diary, Profile, AI Chat) SHALL be protected by authentication middleware or a layout-level auth check. Unauthenticated users attempting to access protected routes MUST be redirected to the authentication page.

#### Scenario: Unauthenticated user redirected from dashboard
- **WHEN** an unauthenticated user navigates to `/dashboard`
- **THEN** the user SHALL be redirected to the login page
- **AND** the dashboard content SHALL NOT be rendered

#### Scenario: Authenticated user accesses protected route
- **WHEN** an authenticated user navigates to `/diary`
- **THEN** the diary page SHALL render normally

#### Scenario: Auth redirect preserves intended destination
- **WHEN** an unauthenticated user navigates to `/profile`
- **AND** the user is redirected to the login page and successfully authenticates
- **THEN** the user SHALL be redirected back to `/profile` (not to a default page)

#### Scenario: Shared plans route allows anonymous access
- **WHEN** an unauthenticated user navigates to `/shared-plans/[planId]`
- **THEN** the shared plan detail page SHALL render without requiring authentication

---

### Requirement: Loading States Per Route

Each route SHALL display a meaningful loading state while its data is being fetched. Loading states MUST use skeleton screens or loading indicators rather than blank pages.

#### Scenario: Dashboard shows loading skeleton
- **WHEN** the `/dashboard` route is loading and data has not yet arrived
- **THEN** a skeleton screen SHALL be displayed showing placeholder shapes matching the dashboard layout

#### Scenario: Diary shows loading indicator
- **WHEN** the `/diary` route is transitioning to a new date and entries are being fetched
- **THEN** a loading indicator or skeleton SHALL be displayed in the entries area
- **AND** the date selector SHALL remain interactive

#### Scenario: Route loading does not block navigation
- **WHEN** a route is in a loading state
- **THEN** the navigation bar SHALL remain interactive and the user SHALL be able to navigate to another route

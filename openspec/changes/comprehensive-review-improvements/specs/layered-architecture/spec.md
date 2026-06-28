# Layered Architecture

Delta spec for the `layered-architecture` capability introduced by the comprehensive-review-improvements change.

## ADDED Requirements

### Requirement: Component Size Limits

Every React component file SHALL contain no more than 250 lines of code. Components currently exceeding this limit (AuthWall.tsx ~320 lines, ProfileModal.tsx ~350 lines, FoodSearchModal.tsx ~305 lines) MUST be decomposed into smaller, focused sub-components. Each sub-component SHALL have a single, clear responsibility.

#### Scenario: AuthWall decomposition
- **WHEN** the AuthWall component is refactored
- **THEN** the main `AuthWall.tsx` file SHALL not exceed 250 lines
- **AND** authentication UI logic SHALL be extracted into sub-components (e.g., `LoginForm`, `RegisterForm`, `AuthLayout`)
- **AND** each sub-component file SHALL not exceed 250 lines

#### Scenario: ProfileModal decomposition
- **WHEN** the ProfileModal component is refactored
- **THEN** the main `ProfileModal.tsx` file SHALL not exceed 250 lines
- **AND** profile sections SHALL be extracted into sub-components (e.g., `ProfileForm`, `GoalsEditor`, `WeightTracker`, `ProfileHeader`)
- **AND** each sub-component file SHALL not exceed 250 lines

#### Scenario: FoodSearchModal decomposition
- **WHEN** the FoodSearchModal component is refactored
- **THEN** the main `FoodSearchModal.tsx` file SHALL not exceed 250 lines
- **AND** search and results logic SHALL be extracted into sub-components (e.g., `SearchInput`, `SearchResults`, `FoodItemCard`, `PortionSelector`)
- **AND** each sub-component file SHALL not exceed 250 lines

#### Scenario: New component respects size limit
- **WHEN** any new component is created as part of refactoring
- **THEN** the component file SHALL not exceed 250 lines

---

### Requirement: Service Layer with Repository Pattern

The application SHALL introduce a service layer between React components and Supabase database access. Components MUST NOT import or call `supabaseClient` directly. All data operations SHALL go through service modules that encapsulate database queries, error handling, and data transformation.

#### Scenario: Diary service encapsulates diary operations
- **WHEN** a component needs to read, create, update, or delete diary entries
- **THEN** it SHALL call methods on a `diaryService` module (e.g., `diaryService.getEntries(userId, date)`, `diaryService.addEntry(...)`)
- **AND** the `diaryService` module SHALL be the only module that executes diary-related Supabase queries

#### Scenario: Profile service encapsulates profile operations
- **WHEN** a component needs to read or update user profile data
- **THEN** it SHALL call methods on a `profileService` module
- **AND** the `profileService` SHALL handle all Supabase queries for user profiles and goals

#### Scenario: Auth service encapsulates authentication
- **WHEN** a component needs to perform sign-in, sign-up, sign-out, or session checks
- **THEN** it SHALL call methods on an `authService` module
- **AND** the `authService` SHALL be the only module that calls `supabase.auth.*` methods

#### Scenario: Components do not import supabaseClient
- **WHEN** a static analysis scan is performed on all files in `src/components/`
- **THEN** no component file SHALL contain an import of `supabaseClient` or direct usage of the Supabase SDK

---

### Requirement: Domain-Specific React Contexts

The monolithic React context SHALL be split into separate domain-specific contexts. Each context MUST manage state for a single domain and expose only the state and actions relevant to that domain.

#### Scenario: Auth context manages authentication state
- **WHEN** the `AuthContext` is used in a component
- **THEN** it SHALL provide: `user`, `session`, `isLoading`, `signIn()`, `signUp()`, `signOut()`
- **AND** it SHALL NOT contain diary entries, profile data, or meal plan state

#### Scenario: Diary context manages diary state
- **WHEN** the `DiaryContext` is used in a component
- **THEN** it SHALL provide: `entries`, `selectedDate`, `addEntry()`, `removeEntry()`, `updateEntry()`
- **AND** it SHALL NOT contain authentication or profile state

#### Scenario: Profile context manages profile state
- **WHEN** the `ProfileContext` is used in a component
- **THEN** it SHALL provide: `profile`, `goals`, `updateProfile()`, `updateGoals()`, `weightHistory`
- **AND** it SHALL NOT contain authentication or diary state

#### Scenario: Context providers are composable
- **WHEN** the context providers are composed in the application layout
- **THEN** each provider SHALL be independently removable without breaking the others
- **AND** there SHALL be no circular dependencies between contexts

---

### Requirement: Dead Code Removal

All identified dead or legacy code MUST be removed from the codebase. Removed files SHALL NOT be referenced by any remaining module.

#### Scenario: Legacy AuthModal is removed
- **WHEN** the codebase is scanned after refactoring
- **THEN** `src/components/AuthModal.tsx` SHALL NOT exist
- **AND** no remaining file SHALL import from `AuthModal`

#### Scenario: Legacy CheatSheet is removed
- **WHEN** the codebase is scanned after refactoring
- **THEN** `src/components/CheatSheet.tsx` SHALL NOT exist
- **AND** no remaining file SHALL import from `CheatSheet`

#### Scenario: Legacy DayCard is removed
- **WHEN** the codebase is scanned after refactoring
- **THEN** `src/components/DayCard.tsx` SHALL NOT exist
- **AND** no remaining file SHALL import from `DayCard`

#### Scenario: Legacy MealCard is removed
- **WHEN** the codebase is scanned after refactoring
- **THEN** `src/components/MealCard.tsx` SHALL NOT exist (or is replaced by a new, non-legacy version)
- **AND** no remaining file SHALL import the legacy `MealCard`

#### Scenario: Duplicate MacroBar is removed
- **WHEN** the codebase is scanned after refactoring
- **THEN** `src/components/MacroBar.tsx` SHALL NOT exist (its functionality consolidated into the design system)
- **AND** no remaining file SHALL import from the legacy `MacroBar`

---

### Requirement: Unified Type System

Duplicate type definitions for the same domain concept SHALL be consolidated into a single canonical interface. All modules MUST use the canonical type.

#### Scenario: Product type unification
- **WHEN** the types are refactored
- **THEN** there SHALL be exactly one `Product` interface (or equivalent canonical name) in a shared types file
- **AND** the duplicate types `FoodProduct`, `CatalogFood`, and `Product` SHALL be replaced by the single canonical interface
- **AND** all modules that previously used any of these types SHALL import the canonical interface

#### Scenario: Goals type unification
- **WHEN** the types are refactored
- **THEN** there SHALL be exactly one `DailyGoals` interface (or equivalent canonical name) in a shared types file
- **AND** the duplicate `Macros` interface SHALL be removed
- **AND** all modules SHALL use the unified `DailyGoals` interface

#### Scenario: Types are co-located in a shared types module
- **WHEN** the type system is refactored
- **THEN** all shared domain types SHALL be defined in `src/types/` or a `src/lib/types.ts` module
- **AND** no component file SHALL define its own domain types inline

---

### Requirement: Business Logic Extraction

Business logic (calculations, data transformations, validation rules) MUST be extracted from component files into shared utility or service modules. Components SHALL only contain rendering logic and event handler delegation.

#### Scenario: Nutrition calculations are in utility modules
- **WHEN** calorie or macronutrient calculations are needed
- **THEN** the calculation logic SHALL reside in `src/lib/nutrition.ts` or a dedicated utility module
- **AND** no component file SHALL contain inline BMR, TDEE, or macro-split formulas

#### Scenario: Meal generation logic is separated
- **WHEN** meal plan generation is performed
- **THEN** the generation algorithm SHALL reside in `src/lib/mealGenerator.ts`
- **AND** the component that triggers generation SHALL only call the service function and render the result

#### Scenario: Data formatting is centralized
- **WHEN** date formatting, number formatting, or unit conversions are needed
- **THEN** a shared utility module SHALL provide these functions
- **AND** components SHALL NOT contain inline formatting logic

---

### Requirement: Dependency Direction Enforcement

The codebase SHALL follow a strict layered dependency direction: `components → services → repositories/lib`. Lower layers MUST NOT import from higher layers. No circular dependencies SHALL exist between modules.

#### Scenario: Service modules do not import components
- **WHEN** a static analysis scan checks import paths in `src/lib/` and `src/services/`
- **THEN** no service or library module SHALL import from `src/components/`

#### Scenario: No circular dependencies
- **WHEN** a dependency graph analysis is performed on the codebase
- **THEN** there SHALL be zero circular dependency cycles between any modules

#### Scenario: Components import only from services and shared modules
- **WHEN** a component file's imports are analyzed
- **THEN** it SHALL import from `src/services/`, `src/lib/`, `src/types/`, `src/contexts/`, or other component files
- **AND** it SHALL NOT import from `supabaseClient` or execute raw database queries

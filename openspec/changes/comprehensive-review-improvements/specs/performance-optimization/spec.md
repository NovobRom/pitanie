## ADDED Requirements

### Requirement: Component Memoization
All complex or frequently re-rendered React components SHALL implement memoization strategies to prevent unnecessary re-renders.

#### Scenario: Heavy components avoid re-renders
- **WHEN** a parent component re-renders but the props of a heavy child component have not changed
- **THEN** the child component SHALL NOT re-render (e.g. wrapped in React.memo)

### Requirement: Expensive Calculation Memoization
All expensive calculations (like BMR, TDEE, or summing daily totals) SHALL be memoized.

#### Scenario: Computations use useMemo
- **WHEN** state changes that does not affect the calculation's dependencies
- **THEN** the calculation SHALL NOT run again, using the cached value from useMemo

### Requirement: Lazy Loading
Non-critical UI components (like modals or charts below the fold) SHALL be lazy-loaded to reduce initial bundle size.

#### Scenario: Modals load on demand
- **WHEN** the application first loads
- **THEN** the code for modals (e.g. FoodSearchModal, ProfileModal) SHALL NOT be included in the initial JavaScript bundle, but loaded dynamically when requested

### Requirement: Database Pagination
All list-based database queries SHALL implement pagination or limit/offset to prevent loading excessive data into memory.

#### Scenario: Diary loads by date range
- **WHEN** fetching diary entries for the week
- **THEN** the query SHALL include date range filters, rather than fetching all historical entries and filtering on the client

### Requirement: Input Debouncing
All text inputs that trigger API calls or database updates SHALL implement debouncing.

#### Scenario: Food search avoids excessive requests
- **WHEN** a user types rapidly in the food search input
- **THEN** API requests to the food database SHALL wait for a brief pause (e.g. 300ms) before firing, preventing a request per keystroke

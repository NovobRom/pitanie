# Design System V2

Delta spec for the `design-system-v2` capability introduced by the comprehensive-review-improvements change.

## ADDED Requirements

### Requirement: Design Token System

The application SHALL define a comprehensive design token system using CSS custom properties (variables). All visual properties (colors, spacing, typography, shadows, border radii) MUST be derived from tokens. No component SHALL use hardcoded color values, pixel sizes, or font declarations outside of the token system.

#### Scenario: Color tokens define the full palette
- **WHEN** the design token system is implemented
- **THEN** `globals.css` SHALL define CSS custom properties for at least: `--color-primary`, `--color-primary-hover`, `--color-secondary`, `--color-accent`, `--color-success`, `--color-warning`, `--color-error`, `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-card`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-border`

#### Scenario: Spacing tokens use a consistent scale
- **WHEN** the spacing tokens are defined
- **THEN** the system SHALL provide a scale of spacing tokens (e.g., `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`, `--space-2xl`) based on a 4px or 8px grid

#### Scenario: Typography tokens define the type scale
- **WHEN** the typography tokens are defined
- **THEN** the system SHALL provide font family tokens (`--font-primary`, `--font-mono`), font size tokens (`--text-xs` through `--text-3xl`), font weight tokens (`--font-normal`, `--font-medium`, `--font-semibold`, `--font-bold`), and line height tokens
- **AND** the primary font SHALL use a modern typeface (e.g., Inter, Outfit, Roboto) loaded via Google Fonts

#### Scenario: Components use only token values
- **WHEN** any component CSS is inspected
- **THEN** all color values SHALL reference CSS custom properties (e.g., `var(--color-primary)`)
- **AND** no hardcoded hex, rgb, or hsl values SHALL appear in component styles

---

### Requirement: Glassmorphism and Depth Effects

Card and modal components SHALL employ glassmorphism effects to create visual depth and a premium feel. Depth SHALL be conveyed through layered `backdrop-filter`, semi-transparent backgrounds, subtle borders, and elevation-based shadows.

#### Scenario: Card components have glass effect
- **WHEN** a card component (e.g., meal card, stats card) is rendered
- **THEN** the card SHALL have a semi-transparent background (e.g., `rgba(255,255,255,0.05)` to `rgba(255,255,255,0.15)`)
- **AND** the card SHALL apply `backdrop-filter: blur()` with a minimum blur radius of 8px
- **AND** the card SHALL have a subtle border (e.g., `1px solid rgba(255,255,255,0.1)`)

#### Scenario: Modals have elevated glass effect
- **WHEN** a modal (e.g., FoodSearchModal, ProfileModal) is opened
- **THEN** the modal content SHALL have a stronger glass effect than cards
- **AND** the modal SHALL have a higher elevation shadow than surrounding cards
- **AND** a backdrop overlay SHALL dim the background content

#### Scenario: Depth hierarchy is consistent
- **WHEN** multiple depth levels are visible simultaneously (e.g., page background, cards, modal)
- **THEN** there SHALL be at least 3 distinct elevation levels with progressively stronger shadows and blur effects

---

### Requirement: Gradient System

The application SHALL use a cohesive gradient system for backgrounds, accents, and interactive elements. Gradients MUST be defined as reusable CSS custom properties or utility classes.

#### Scenario: Primary gradient is defined
- **WHEN** the gradient system is implemented
- **THEN** there SHALL be a primary gradient token (e.g., `--gradient-primary`) used for key action buttons and hero elements

#### Scenario: Background gradients create atmosphere
- **WHEN** the main app background is rendered
- **THEN** it SHALL use a subtle gradient or radial gradient accents rather than a flat solid color

#### Scenario: Progress bars use gradients
- **WHEN** a macro progress bar (calories, protein, fats, carbs) is rendered
- **THEN** the filled portion SHALL use a gradient that transitions through related hues (e.g., green to emerald for protein)

---

### Requirement: Micro-Animations and Transitions (Emil Kowalski Craft Bar)

All interactive elements SHALL include micro-animations and smooth transitions that feel right, following strict design engineering principles.

#### Scenario: Button hover and press animations
- **WHEN** a user hovers over a button or interactive element
- **THEN** the hover animation SHALL be gated behind `@media (hover: hover) and (pointer: fine)`
- **AND** on press (`:active`), the button SHALL instantly scale down (e.g., `transform: scale(0.97)`) for immediate physical feedback
- **AND** the release transition SHALL use `ease-out` (duration ~150-200ms)

#### Scenario: Popovers and dropdowns are origin-aware
- **WHEN** a popover or tooltip opens
- **THEN** it SHALL NOT animate from `scale(0)`, but start from at least `scale(0.95)` with `opacity: 0`
- **AND** it SHALL scale from its trigger location (`transform-origin`), NOT the center
- **AND** the entry easing SHALL use a strong `ease-out` custom curve, NEVER `ease-in`

#### Scenario: List items use fast stagger
- **WHEN** a list of diary entries or search results is rendered
- **THEN** list items SHALL animate into view with a staggered fade-in or slide-up effect
- **AND** the stagger delay between items SHALL be strictly short (30-80ms) so it feels fast, not blocking

#### Scenario: Reduced motion is respected
- **WHEN** the user has `prefers-reduced-motion: reduce` enabled in their OS settings
- **THEN** all transform-based animations SHALL be removed, falling back to gentle opacity/color transitions

#### Scenario: Modal and Drawer animations are physical
- **WHEN** a modal or drawer is opened or closed
- **THEN** it SHALL use asymmetric timing (e.g., fast entry 200ms ease-out, snappy or slightly different exit)
- **AND** it SHALL be fully interruptible (using CSS transitions or springs instead of keyframes that restart)

---

### Requirement: Empty State Illustrations

All views that can display empty content SHALL show a visually engaging empty state with an illustration, a descriptive message, and a call-to-action button where applicable.

#### Scenario: Empty diary shows illustration
- **WHEN** the Diary page is rendered for a date with no food entries
- **THEN** the page SHALL display an illustration (SVG or image) related to food/nutrition
- **AND** a message such as "No meals logged for this day"
- **AND** a call-to-action button to add the first meal

#### Scenario: Empty weight history shows prompt
- **WHEN** the weight tracking section has no entries
- **THEN** it SHALL display an illustration and a message encouraging the user to log their first weight

#### Scenario: Empty search results
- **WHEN** a food search returns zero results
- **THEN** the search results area SHALL display a friendly illustration and message (e.g., "No foods found. Try a different search term.")

---

### Requirement: Onboarding Flow

The application SHALL provide an onboarding flow for new users that guides them through initial setup. The onboarding MUST collect essential profile information and explain key app features.

#### Scenario: New user sees onboarding
- **WHEN** a user signs up and has no profile data
- **THEN** the application SHALL display an onboarding wizard instead of the main dashboard

#### Scenario: Onboarding collects profile data
- **WHEN** the onboarding flow is active
- **THEN** it SHALL guide the user through steps to enter: gender, age, height, weight, activity level, and nutritional goals
- **AND** each step SHALL have clear labels, input validation, and a progress indicator

#### Scenario: Onboarding is skippable
- **WHEN** the onboarding flow is displayed
- **THEN** the user SHALL have the option to skip onboarding and set up their profile later

#### Scenario: Onboarding completes to dashboard
- **WHEN** the user finishes all onboarding steps
- **THEN** the application SHALL save the profile data and navigate to the Dashboard
- **AND** the onboarding SHALL NOT appear again on subsequent logins

---

### Requirement: Weight Trend Chart Visualization

The weight history section SHALL display a visual chart showing the user's weight trend over time instead of only displaying raw numbers.

#### Scenario: Weight chart renders with data
- **WHEN** the user has 2 or more weight entries
- **THEN** a line chart SHALL render showing weight values on the Y-axis and dates on the X-axis
- **AND** the chart SHALL use smooth curves or connected line segments

#### Scenario: Chart supports date range selection
- **WHEN** the weight chart is displayed
- **THEN** the user SHALL be able to filter the chart by time period (e.g., 1 week, 1 month, 3 months, all time)

#### Scenario: Chart shows goal line
- **WHEN** the user has set a target weight
- **THEN** the chart SHALL display a horizontal reference line at the target weight value with a distinct style (dashed, different color)

#### Scenario: Single data point shows value
- **WHEN** the user has only 1 weight entry
- **THEN** the weight section SHALL display the single value with a message encouraging more entries to see a trend

---

### Requirement: Mobile-First Responsive Design

The application SHALL be designed with a mobile-first approach. The layout MUST be fully usable on viewport widths from 320px to 1440px+. All interactive elements MUST meet minimum touch target sizes of 44x44px on mobile.

#### Scenario: Mobile viewport renders correctly
- **WHEN** the app is viewed on a 375px wide viewport
- **THEN** all content SHALL be visible without horizontal scrolling
- **AND** navigation SHALL collapse to a bottom tab bar or hamburger menu
- **AND** all buttons and interactive elements SHALL have a minimum touch target of 44x44px

#### Scenario: Tablet viewport adapts layout
- **WHEN** the app is viewed on a 768px wide viewport
- **THEN** the layout SHALL adapt to use available space (e.g., wider cards, side-by-side layout for macro progress)

#### Scenario: Desktop viewport maximizes content
- **WHEN** the app is viewed on a 1440px wide viewport
- **THEN** the layout SHALL use a constrained max-width container with centered content
- **AND** sidebar navigation SHALL be visible

---

### Requirement: Delete Confirmation Dialogs

All destructive actions (deleting diary entries, removing weight entries, deleting shared plans, account deletion) SHALL require explicit user confirmation via a dialog before execution.

#### Scenario: Deleting a diary entry shows confirmation
- **WHEN** a user clicks the delete button on a diary entry
- **THEN** a confirmation dialog SHALL appear with the message identifying the item being deleted
- **AND** the dialog SHALL have a "Cancel" button and a destructive-styled "Delete" button
- **AND** the entry SHALL NOT be deleted until the user clicks "Delete"

#### Scenario: User cancels deletion
- **WHEN** a user clicks "Cancel" in a delete confirmation dialog
- **THEN** the dialog SHALL close and the item SHALL remain unchanged

#### Scenario: Confirmation dialog is accessible
- **WHEN** a delete confirmation dialog is displayed
- **THEN** focus SHALL be trapped within the dialog
- **AND** the dialog SHALL be closeable via the Escape key
- **AND** the dialog SHALL have appropriate ARIA attributes (`role="alertdialog"`, `aria-modal="true"`)

---

### Requirement: Premium Visual Hierarchy

The application SHALL establish a clear visual hierarchy that guides the user's attention to the most important information first. Primary actions, current macro progress, and critical alerts MUST be visually prominent.

#### Scenario: Primary actions are visually distinct
- **WHEN** a page with both primary and secondary actions is rendered
- **THEN** the primary action button SHALL use the primary gradient and be larger than secondary action buttons
- **AND** secondary actions SHALL use outlined or ghost button styles

#### Scenario: Macro progress is the hero element on dashboard
- **WHEN** the Dashboard page is rendered
- **THEN** the calorie/macro progress display SHALL be the most visually prominent element, using larger typography, gradient fills, and prominent positioning

#### Scenario: Typography hierarchy is clear
- **WHEN** any page is rendered
- **THEN** there SHALL be a clear distinction between heading levels (h1 > h2 > h3) using size, weight, and color
- **AND** body text SHALL be clearly differentiated from labels and captions

## ADDED Requirements

### Requirement: Global Error Boundaries
The application SHALL implement React Error Boundaries to catch unhandled JavaScript errors in the component tree and display a fallback UI instead of crashing.

#### Scenario: Component crash shows fallback
- **WHEN** a child component throws an unexpected error
- **THEN** the Error Boundary SHALL catch it and display a user-friendly error message with a "Reload" button

### Requirement: API Error States
All network requests and database operations SHALL have defined error states that provide clear feedback to the user.

#### Scenario: Failed data load shows error
- **WHEN** fetching diary entries from Supabase fails
- **THEN** the UI SHALL show an inline error message allowing the user to retry the request

### Requirement: Input Validation Feedback
Form inputs SHALL provide immediate, inline validation feedback when users enter invalid data.

#### Scenario: Invalid age entry
- **WHEN** a user enters a negative number for age
- **THEN** the input SHALL display a red outline and an error message below stating "Age must be greater than 0"

### Requirement: Structured Error Logging
Critical errors SHALL be captured and formatted consistently for easier debugging (e.g. logging to a central service or structured console logs).

#### Scenario: Auth failure logging
- **WHEN** authentication fails due to an invalid token
- **THEN** the error SHALL be logged with the context (timestamp, error code) without exposing sensitive user data

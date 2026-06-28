## ADDED Requirements

### Requirement: Unit Testing Infrastructure
The project SHALL have a configured unit testing framework (e.g. Vitest or Jest) with React Testing Library to verify component and function logic.

#### Scenario: Utility functions are tested
- **WHEN** running the test suite
- **THEN** all critical business logic functions (like BMR and TDEE calculations in nutrition.ts) SHALL have tests verifying edge cases

### Requirement: Integration Testing
The project SHALL support integration testing for core workflows combining multiple components.

#### Scenario: Auth flow integration test
- **WHEN** running integration tests
- **THEN** a test SHALL verify the flow from the Auth modal to successful login state

### Requirement: End-to-End (E2E) Testing
The project SHALL have an E2E testing framework (e.g. Playwright or Cypress) configured to verify critical user journeys.

#### Scenario: Core loop E2E test
- **WHEN** running E2E tests
- **THEN** a test SHALL automate navigating to the dashboard, searching for food, adding it to the diary, and verifying macros update

### Requirement: CI Pipeline Integration
All automated tests SHALL run on every pull request or push to main via a CI/CD pipeline (e.g. GitHub Actions).

#### Scenario: PRs require passing tests
- **WHEN** a new pull request is opened
- **THEN** the CI pipeline SHALL execute the test suite and block merging if any tests fail

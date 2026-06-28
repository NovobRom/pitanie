## ADDED Requirements

### Requirement: ARIA Landmark and Roles
All interactive elements and major page sections SHALL implement correct ARIA roles and labels to ensure screen reader accessibility.

#### Scenario: Modals define ARIA roles
- **WHEN** a modal is rendered
- **THEN** it SHALL have `role="dialog"` or `role="alertdialog"` and an `aria-labelledby` pointing to its title

### Requirement: Keyboard Navigation
All interactive UI elements SHALL be fully navigable and operable using only a keyboard.

#### Scenario: Focus management in modals
- **WHEN** a modal opens
- **THEN** keyboard focus SHALL be trapped within the modal until it is closed, and Escape key SHALL close it

### Requirement: HTML Language Attribute
The application SHALL dynamically set the `<html lang>` attribute to match the currently selected user language.

#### Scenario: Language switch updates HTML lang
- **WHEN** the user switches the app language to Ukrainian
- **THEN** the DOM SHALL reflect `<html lang="uk">`

### Requirement: Color Contrast Compliance
Text and essential visual elements SHALL meet WCAG AA contrast ratio standards (4.5:1 for normal text, 3:1 for large text).

#### Scenario: Text remains readable
- **WHEN** rendering text on any background (including gradients or glassmorphism)
- **THEN** the contrast ratio SHALL meet the minimum WCAG AA threshold

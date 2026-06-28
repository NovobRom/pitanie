# Security Hardening

Delta spec for the `security-hardening` capability introduced by the comprehensive-review-improvements change.

## ADDED Requirements

### Requirement: Environment-Based Credential Management

The application SHALL load all Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) exclusively from environment variables. The `supabaseClient.ts` module MUST NOT contain any hardcoded URLs, API keys, or other secrets. If any required environment variable is missing or empty at startup, the module MUST throw a descriptive error immediately (fail-fast) rather than silently using fallback values.

#### Scenario: Application starts with valid environment variables
- **WHEN** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in the environment
- **THEN** the Supabase client SHALL initialize successfully using those values

#### Scenario: Application starts with missing SUPABASE_URL
- **WHEN** `NEXT_PUBLIC_SUPABASE_URL` is not set or is an empty string
- **THEN** the application SHALL throw an error with a message containing "NEXT_PUBLIC_SUPABASE_URL" before any Supabase client is created

#### Scenario: Application starts with missing SUPABASE_ANON_KEY
- **WHEN** `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not set or is an empty string
- **THEN** the application SHALL throw an error with a message containing "NEXT_PUBLIC_SUPABASE_ANON_KEY" before any Supabase client is created

#### Scenario: Source code contains no hardcoded credentials
- **WHEN** a static analysis scan is performed on all `.ts` and `.tsx` files in the `src/` directory
- **THEN** no file SHALL contain Supabase project URLs (matching pattern `https://*.supabase.co`) or API keys (matching pattern `eyJ*`) as string literals

---

### Requirement: Env Example Placeholder Safety

The `.env.example` file MUST contain only placeholder values for all secrets and credentials. Real Supabase URLs, API keys, or any other production/staging credentials MUST NOT appear in this file.

#### Scenario: .env.example contains safe placeholders
- **WHEN** the `.env.example` file is read
- **THEN** the value for `NEXT_PUBLIC_SUPABASE_URL` SHALL be `https://your-project-id.supabase.co` or similar placeholder text
- **AND** the value for `NEXT_PUBLIC_SUPABASE_ANON_KEY` SHALL be `your-anon-key-here` or similar placeholder text
- **AND** no value SHALL match a real Supabase URL pattern (`https://[a-z]{20}.supabase.co`) or JWT pattern (`eyJ[A-Za-z0-9_-]{100,}`)

---

### Requirement: API Route Authentication Middleware

All API routes that access user data or external services SHALL require a valid authenticated Supabase session. The middleware MUST extract the user's JWT from the `Authorization` header, verify it against Supabase Auth, and reject unauthenticated requests with a `401 Unauthorized` response.

#### Scenario: Authenticated request to /api/search-food
- **WHEN** a request is made to `/api/search-food` with a valid Supabase JWT in the `Authorization: Bearer <token>` header
- **THEN** the API route SHALL process the request and return a `200` response with search results

#### Scenario: Unauthenticated request to /api/search-food
- **WHEN** a request is made to `/api/search-food` without an `Authorization` header
- **THEN** the API route SHALL return a `401 Unauthorized` response with a JSON body `{ "error": "Unauthorized" }`
- **AND** the request SHALL NOT be forwarded to any external food API

#### Scenario: Unauthenticated request to /api/ai-chat
- **WHEN** a request is made to `/api/ai-chat` without a valid JWT
- **THEN** the API route SHALL return a `401 Unauthorized` response
- **AND** no AI model API call SHALL be made

#### Scenario: Expired or invalid JWT
- **WHEN** a request is made to any protected API route with an expired or malformed JWT
- **THEN** the API route SHALL return a `401 Unauthorized` response

---

### Requirement: Security Headers Configuration

The application SHALL configure security headers via `next.config.ts` to protect against common web vulnerabilities. The following headers MUST be present on all responses.

#### Scenario: Content-Security-Policy header is set
- **WHEN** any page or API response is served
- **THEN** the response SHALL include a `Content-Security-Policy` header that restricts `script-src` to `'self'` (with nonce or hash for inline scripts), restricts `frame-ancestors` to `'none'`, and sets `default-src` to `'self'`

#### Scenario: HSTS header is set
- **WHEN** any response is served over HTTPS
- **THEN** the response SHALL include a `Strict-Transport-Security` header with `max-age` of at least `31536000` (1 year), `includeSubDomains`, and `preload`

#### Scenario: X-Frame-Options header is set
- **WHEN** any page response is served
- **THEN** the response SHALL include `X-Frame-Options: DENY`

#### Scenario: Additional security headers
- **WHEN** any response is served
- **THEN** the response SHALL include `X-Content-Type-Options: nosniff`
- **AND** the response SHALL include `Referrer-Policy: strict-origin-when-cross-origin`

---

### Requirement: Database Check Constraints

The database schema SHALL enforce check constraints on all numeric input fields to prevent storage of invalid data. Constraints MUST be applied via Supabase migrations.

#### Scenario: Weight field rejects non-positive values
- **WHEN** an INSERT or UPDATE is attempted on a user profile with `weight <= 0`
- **THEN** the database SHALL reject the operation with a constraint violation error

#### Scenario: Age field rejects invalid values
- **WHEN** an INSERT or UPDATE is attempted on a user profile with `age < 1` or `age > 150`
- **THEN** the database SHALL reject the operation with a constraint violation error

#### Scenario: Height field rejects non-positive values
- **WHEN** an INSERT or UPDATE is attempted on a user profile with `height <= 0`
- **THEN** the database SHALL reject the operation with a constraint violation error

#### Scenario: Calorie target rejects non-positive values
- **WHEN** an INSERT or UPDATE is attempted on goals with `calories <= 0`
- **THEN** the database SHALL reject the operation with a constraint violation error

#### Scenario: Food entry portion rejects non-positive grams
- **WHEN** an INSERT or UPDATE is attempted on a diary entry with `grams <= 0`
- **THEN** the database SHALL reject the operation with a constraint violation error

---

### Requirement: Granular RLS Policies

Row Level Security policies on all user-facing tables MUST be split into separate policies per operation type (SELECT, INSERT, UPDATE, DELETE) instead of using a single permissive policy for all operations. Each policy MUST verify that `auth.uid()` matches the row's `user_id`.

#### Scenario: SELECT policy allows only own data
- **WHEN** an authenticated user queries `diary_entries`
- **THEN** only rows where `user_id = auth.uid()` SHALL be returned

#### Scenario: INSERT policy enforces ownership
- **WHEN** an authenticated user inserts into `diary_entries`
- **THEN** the insert SHALL succeed only if the `user_id` field matches `auth.uid()`

#### Scenario: UPDATE policy prevents cross-user modification
- **WHEN** an authenticated user attempts to UPDATE a row in `diary_entries` belonging to another user
- **THEN** the database SHALL reject the update (0 rows affected)

#### Scenario: DELETE policy prevents cross-user deletion
- **WHEN** an authenticated user attempts to DELETE a row in `weight_history` belonging to another user
- **THEN** the database SHALL reject the deletion (0 rows affected)

#### Scenario: Anonymous users cannot modify protected tables
- **WHEN** an unauthenticated (anon) user attempts INSERT, UPDATE, or DELETE on `diary_entries` or `user_profiles`
- **THEN** the database SHALL reject all such operations

---

### Requirement: Rate Limiting for Anonymous Operations

The `create_shared_plan` function and any endpoints accessible to anonymous users SHALL implement rate limiting to prevent abuse. Rate limits MUST be enforced per IP address or session identifier.

#### Scenario: Anonymous user creates shared plan within rate limit
- **WHEN** an anonymous user calls `create_shared_plan` for the first time within a 1-minute window
- **THEN** the operation SHALL succeed and return the shared plan data

#### Scenario: Anonymous user exceeds rate limit
- **WHEN** an anonymous user calls `create_shared_plan` more than 5 times within a 1-minute window from the same IP
- **THEN** subsequent calls SHALL be rejected with a `429 Too Many Requests` response
- **AND** the response SHALL include a `Retry-After` header indicating when the user can try again

#### Scenario: Rate limit resets after window expires
- **WHEN** an anonymous user was previously rate-limited
- **AND** the rate limit window (1 minute) has expired
- **THEN** the next call to `create_shared_plan` SHALL succeed

---

### Requirement: Input Validation with Range Checks

The `calcGoals()` function and all user input processing functions SHALL validate all numeric inputs against reasonable biological ranges before performing calculations. Invalid inputs MUST result in descriptive validation errors rather than silent computation with garbage values.

#### Scenario: Valid profile input produces correct goals
- **WHEN** `calcGoals()` is called with weight=70, height=175, age=30, gender="male", activity="moderate"
- **THEN** the function SHALL return calculated daily calorie and macro goals without errors

#### Scenario: Negative weight is rejected
- **WHEN** `calcGoals()` is called with weight=-5
- **THEN** the function SHALL throw a validation error or return an error result indicating "weight must be positive"

#### Scenario: Extreme age is rejected
- **WHEN** `calcGoals()` is called with age=200
- **THEN** the function SHALL throw a validation error or return an error result indicating "age must be between 1 and 150"

#### Scenario: Zero height is rejected
- **WHEN** `calcGoals()` is called with height=0
- **THEN** the function SHALL throw a validation error or return an error result indicating "height must be positive"

#### Scenario: Non-numeric input is rejected
- **WHEN** `calcGoals()` is called with weight="abc" (type coercion scenario)
- **THEN** the function SHALL throw a validation error rather than returning NaN-based results

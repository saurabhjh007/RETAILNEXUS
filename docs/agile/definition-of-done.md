# Definition of Done (DoD) — RetailNexus

The **Definition of Done** governs the exit criteria required for any user story or sprint increment before it can be merged, closed, and demonstrated to stakeholders.

---

## DoD Quality Gate Checklist

A user story or feature increment is declared **DONE** only when:

### 1. Code Quality & Standards
- [x] Code strictly adheres to Java Spring Boot and React Vite engineering standards.
- [x] No credentials, passwords, database URLs, or API keys are hardcoded in source files.
- [x] Bean Validation annotations (`@NotNull`, `@Min`, `@DecimalMin`, `@NotBlank`) protect all incoming DTOs.
- [x] Preserved and meaningful comments and docstrings are present across services and entities.
- [x] No console warnings or unhandled Promise rejections in frontend runtime.

### 2. Testing & Verification
- [x] Backend JUnit 5 and Mockito tests run and pass without failure via `mvnw test`.
- [x] Frontend Vitest unit and component tests run and pass without failure via `npm test`.
- [x] Positive and negative edge cases (e.g., negative stock attempts, over-receiving, invalid transfer quantities) explicitly covered.
- [x] Full production build succeeds via `npm run build` and `mvnw compile`.

### 3. Database & Concurrency Verification
- [x] Relational schema changes versioned via Flyway migration scripts (`V1__...`, `V2__...`).
- [x] All database transactions modifying stock run inside `@Transactional(isolation = Isolation.READ_COMMITTED)`.
- [x] Race condition safety guaranteed via `@Version` optimistic locking on `inventories` table.
- [x] Every stock-altering transaction inserts an immutable record into `inventory_movements`.

### 4. User Experience & Design Compliance
- [x] Matches the RetailNexus design system: Midnight Navy sidebar (`#0B1120`), clean slate background, Violet accents, and status badges.
- [x] Responsive layout verified on desktop and mobile viewports.
- [x] Complete state handling: Loading skeletons/spinners, empty states, error banners, and Toast notifications.
- [x] All monetary figures formatted in Indian Rupees (INR, ₹) using `Intl.NumberFormat('en-IN')`.

### 5. Deployment & Demo
- [x] Running live and verified on port `8080` (Backend) and port `5173` (Frontend).
- [x] Successfully demonstrated to Product Owner during the formal Sprint Review.

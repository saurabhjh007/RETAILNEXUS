# Sprint Retrospectives & Process Improvement — RetailNexus

This document captures the Scrum team's **Retrospective findings** across development phases, structured using the *What Went Well*, *What Needs Improvement*, and *Action Items* framework.

---

## Retrospective 1: Architecture & Foundations (Sprints 1 – 4)
### What Went Well:
- Flyway automated migrations eliminated manual SQL synchronization issues across environments.
- Spring Security with stateless JWT provided predictable authorization without session state bugs.
- Early adoption of the Midnight Navy enterprise UI palette established a high aesthetic standard.

### What Needed Improvement:
- Initial peer dependency conflict on React Hook Form resolvers required manual resolution.
- Native MySQL on port 3307 required explicit JDBC configuration to avoid colliding with default port 3306.

### Action Items & Experiments:
- Standardized package installation using `--legacy-peer-deps` for Vite plugins.
- Added explicit port and connection timeouts in `application.yml`.

---

## Retrospective 2: Concurrency & Transactional Integrity (Sprints 5 – 8)
### What Went Well:
- Adding `@Version` optimistic locking to the `Inventory` entity successfully prevented lost updates during concurrent operations.
- Composite primary key (`product_id` + `warehouse_id`) simplified relationship mapping in Hibernate.
- Unit tests written for `InventoryService` caught edge cases in same-warehouse transfer attempts.

### What Needed Improvement:
- Attempting to modify immutable collections in `DataInitializer` caused an unexpected startup exception.
- Long database transactions during bulk testing risked connection starvation.

### Action Items & Experiments:
- Refactored `DataInitializer` to wrap `Set.of()` into mutable `new HashSet<>()`.
- Kept transaction scope tight: moved non-database operations outside `@Transactional` blocks.

---

## Retrospective 3: Inbound Procurement & Goods Receiving (Sprints 9 – 12)
### What Went Well:
- Strict over-receiving validation prevented inventory inflation during vendor delivery testing.
- Partial receiving status transitions (`PARTIALLY_RECEIVED`) accurately modeled real-world logistics.
- Top-bar notification bell and badge for low-stock alerts improved operator responsiveness.

### What Needed Improvement:
- Recharts chart rendering required `react-is` dependency resolution during production bundling.
- Date format inconsistencies between ISO UTC timestamps and Indian local time required normalization.

### Action Items & Experiments:
- Explicitly installed `react-is` and configured `Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'`.
- Validated all monetary values with `formatINR` formatter.

---

## Retrospective 4: Fulfillment, Valuation & Final Capstone (Sprints 13 – 15)
### What Went Well:
- Clean decoupling between stock reservation and physical stock deduction prevented overselling completely.
- Streaming RFC-4180 CSV export handled large datasets without heap memory pressure.
- Interactive Agile Delivery page with 8 epics and 15 sprints provided complete transparency into project execution.
- 100% test pass rate across both backend (JUnit) and frontend (Vitest).

### What Needed Improvement:
- Initial test assertions failed due to expectations of US comma formatting instead of Indian Lakhs format.
- Vite build needed custom chunking configuration to optimize bundle size warnings.

### Action Items & Experiments:
- Updated test assertions to validate authentic Indian numbering standards (`12,50,000`).
- Configured dynamic imports and modular components in Vite build.

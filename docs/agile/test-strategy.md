# Quality Assurance & Test Strategy — RetailNexus

## 1. Testing Philosophy & Test Pyramid
RetailNexus implements a multi-layer verification strategy adhering to the testing pyramid:
- **Unit Tests (Base):** Fast, isolated tests for domain calculations, formatters, and service logic.
- **Integration Tests (Middle):** Spring Boot tests with Mockito and Spring Data JPA repositories validating transactions, locking, and constraints.
- **End-to-End / API Tests (Top):** HTTP REST endpoint verification and browser-level component testing.

```
       / \
      / E2E \       <-- Browser Flow & Postman Tests
     /-------\
    /  Integ  \     <-- JUnit 5 + Mockito + Spring Data Repositories
   /-----------\
  /    Unit     \   <-- Vitest (React) + JUnit Math & Business Rules
 /---------------\
```

---

## 2. Test Execution Commands & Verified Results

### Backend JUnit Test Suite
- **Tool:** Maven Wrapper (`backend/mvnw.cmd test`)
- **Framework:** JUnit 5, Mockito, AssertJ, Spring Boot Test
- **Suite Files:**
  - `InventoryServiceTest.java` (5 tests):
    1. `testStockTransfer_Success`: Validates atomic source debit and destination credit.
    2. `testStockTransfer_InsufficientStock`: Validates rejection when transfer quantity exceeds available stock.
    3. `testStockTransfer_NegativeQuantity`: Validates business exception on invalid quantities.
    4. `testStockTransfer_SameWarehouse`: Validates rejection of transfers to the same warehouse.
    5. `testAdjustStock_Success`: Validates physical count adjustments and movement logging.
  - `PurchaseOrderServiceTest.java` (2 tests):
    1. `testReceiveGoods_Success`: Validates goods receipt, status change, and inventory increment.
    2. `testReceiveGoods_OverReceivingRejected`: Validates rejection when receiving exceeds PO remaining quantity.
- **Execution Result:**
  ```text
  [INFO] Running com.retailnexus.service.InventoryServiceTest
  [INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.085 s -- in com.retailnexus.service.InventoryServiceTest
  [INFO] Running com.retailnexus.service.PurchaseOrderServiceTest
  [INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.169 s -- in com.retailnexus.service.PurchaseOrderServiceTest
  [INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
  [INFO] BUILD SUCCESS
  ```

---

### Frontend Vitest Suite
- **Tool:** `npm test` (`vitest run` in `frontend/`)
- **Framework:** Vitest, React Testing Library, JSDOM
- **Suite Files:**
  - `App.test.jsx` (6 tests):
    1. `renders Button with text and handles clicks`
    2. `renders Badge with custom label and dot indicator`
    3. `renders Card container with CardHeader`
    4. `formats Indian Rupee (INR) currency correctly with symbol`
    5. `formats regular numbers with Indian numbering system`
    6. `formats ISO dates into readable DD MMM YYYY`
- **Execution Result:**
  ```text
  ✓ src/__tests__/App.test.jsx (6 tests) 66ms
  Test Files  1 passed (1)
  Tests       6 passed (6)
  Duration    2.79s
  ```

---

## 3. Production Build Verification
- **Frontend Production Bundle:** `npm run build`
  - Output: `dist/index.html` (0.74 kB), `dist/assets/index-*.css` (35.28 kB), `dist/assets/index-*.js` (913 kB).
  - Status: Built cleanly in under 5 seconds with zero compilation errors.
- **Backend Production Compile:** `mvnw.cmd compile`
  - Status: Built cleanly with zero compilation errors.

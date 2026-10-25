# Risk Register & Mitigation Strategy — RetailNexus

This register documents key operational, architectural, and business risks identified during Scrum planning, along with severity scores, owners, and active technical mitigations.

---

## 1. Risk Matrix

| Risk ID | Risk Description | Category | Probability (1-5) | Impact (1-5) | Severity (PxI) | Technical Mitigation Strategy | Status | Owner |
|:-------:|------------------|:--------:|:-----------------:|:------------:|:--------------:|-------------------------------|:------:|:-----:|
| **RSK-01** | Concurrent order reservations oversell limited stock | Technical / Concurrency | 4 | 5 | **20 (High)** | Enforced JPA `@Version` optimistic locking on `Inventory` entity and pessimistic locking query `findWithLockByProductIdAndWarehouseId`. | MITIGATED | Tech Lead |
| **RSK-02** | Warehouse staff over-receive goods exceeding approved PO commitments | Operational / Financial | 3 | 4 | **12 (Med)** | Backend checks in `PurchaseOrderService.receiveGoods` preventing receiving quantity > remaining ordered quantity. | MITIGATED | Backend Eng |
| **RSK-03** | Inter-warehouse transfers fail halfway leaving stock lost in limbo | Transactional | 2 | 5 | **10 (Med)** | Spring `@Transactional` ensures atomic debit from source and credit to destination in single ACID commit. | MITIGATED | Backend Eng |
| **RSK-04** | Disconnected client app continues operating with stale token | Security | 3 | 4 | **12 (Med)** | Stateless JWT with 24-hour expiration, Axios 401 response interceptor auto-redirecting to `/login`. | MITIGATED | Security Eng |
| **RSK-05** | Memory exhaustion during large CSV export streaming | Performance | 2 | 4 | **8 (Low)** | Apache Commons CSV streaming directly to HTTP response `InputStreamResource` without loading full dataset into heap memory. | MITIGATED | Tech Lead |
| **RSK-06** | Accidental hard-deletion of products breaking order history | Data Integrity | 2 | 5 | **10 (Med)** | Enforced active/inactive boolean flags; REST endpoints disallow hard deletion if inventory or order history exists. | MITIGATED | DB Architect |
| **RSK-07** | Non-standard numeric display confusing Indian retail users | UX / Localization | 3 | 3 | **9 (Low)** | Centralized `formatINR` formatter utilizing `en-IN` locale and ₹ symbol consistently across all views. | MITIGATED | Frontend Lead |

---

## 2. Contingency & Fallback Procedures
1. **OptimisticLockingFailureException Handling:** Spring Boot's global exception handler maps JPA optimistic locking exceptions to HTTP 409 Conflict with descriptive advice: *"Inventory was updated concurrently by another operation. Please refresh and retry."*
2. **Database Failure or Port Contention:** Native MySQL 8 runs on dedicated port 3307 with automatic connection pooling (`HikariCP`) configured for 10 active connections and 30-second connection timeouts.
3. **Audit Log Failure:** Movement ledger insertions occur within the same transactional context as stock updates. If the audit insertion fails, the entire stock adjustment rolls back.

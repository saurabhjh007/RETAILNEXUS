# System Architecture & Technical Design — RetailNexus

## 1. High-Level Architecture Overview
RetailNexus follows an enterprise 3-tier architecture with clean separation of concerns:
- **Presentation Tier:** React 19 Single Page Application built with Vite, Tailwind CSS, Lucide Icons, and Recharts.
- **Application Tier:** Java 24 / Spring Boot 3.4.3 REST API with Spring Security (stateless JWT), Spring Data JPA, Hibernate ORM, and Bean Validation.
- **Data Tier:** MySQL 8 Relational Database on dedicated port `3307` (`retailnexus_db`) managed via Flyway schema migrations.

```mermaid
graph TD
    subgraph Client Tier ["Client Tier (Browser)"]
        SPA["React 19 + Vite SPA (Port 5173)"]
        AuthCtx["Auth Context (JWT In-Memory + LocalStorage)"]
        AxiosInterceptor["Axios Interceptor (Bearer Token Injection)"]
    end

    subgraph Application Tier ["Application Tier (Spring Boot 3.4.3 - Port 8080)"]
        SecFilter["Spring Security Filter Chain / JWT Validator"]
        Controllers["REST Controllers (/api/*)"]
        Services["Transactional Service Layer (@Transactional)"]
        LockingEngine["Optimistic (@Version) & Row-Level Locking"]
        AuditService["Audit & Movement Logging Engine"]
        Repos["Spring Data JPA Repositories"]
    end

    subgraph Data Tier ["Data Tier (MySQL 8 - Port 3307)"]
        DB[("retailnexus_db")]
        Tables["16 Relational Tables with Foreign Keys & Constraints"]
    end

    SPA --> AuthCtx
    AuthCtx --> AxiosInterceptor
    AxiosInterceptor -->|HTTP / JSON + Bearer Token| SecFilter
    SecFilter --> Controllers
    Controllers --> Services
    Services --> LockingEngine
    Services --> AuditService
    LockingEngine --> Repos
    AuditService --> Repos
    Repos -->|HikariCP Connection Pool| DB
    DB --> Tables
```

---

## 2. Inventory Concurrency & Locking Architecture

To guarantee zero negative stock balances and prevent overselling during concurrent transactions, RetailNexus combines:
1. **Optimistic Locking (`@Version`):**
   - The `inventories` table contains a `version BIGINT NOT NULL DEFAULT 0` column.
   - Any concurrent update detecting an outdated version throws `OptimisticLockingFailureException` and automatically triggers a safe retry or friendly rejection.
2. **Pessimistic Row Locking (`PESSIMISTIC_WRITE`):**
   - For high-contention critical operations such as customer order reservation, `InventoryRepository.findWithLockByProductIdAndWarehouseId` executes `SELECT ... FOR UPDATE` ensuring serialized execution at the database level.
3. **Database Check Constraints:**
   - Database table constraints enforce `CHECK (on_hand_quantity >= 0)` and `CHECK (reserved_quantity >= 0)`.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer / Channel
    participant Controller as CustomerOrderController
    participant OrderService as CustomerOrderService
    participant InvRepo as InventoryRepository
    participant DB as MySQL Database

    Customer->>Controller: POST /api/orders (SKU, Qty)
    Controller->>OrderService: createCustomerOrder(request)
    critical Transactional Boundary
        OrderService->>InvRepo: findWithLockByProductIdAndWarehouseId()
        InvRepo->>DB: SELECT * FROM inventories WHERE ... FOR UPDATE
        DB-->>InvRepo: Inventory Row (Locked)
        Note over OrderService: Validate: (onHand - reserved) >= requestedQty
        alt Insufficient Stock
            OrderService-->>Controller: throw InsufficientStockException
            Controller-->>Customer: HTTP 400 Bad Request
        else Stock Available
            OrderService->>DB: UPDATE inventories SET reserved_quantity = reserved + qty
            OrderService->>DB: INSERT INTO inventory_movements (RESERVATION)
            OrderService->>DB: INSERT INTO customer_orders & order_items
            DB-->>OrderService: Commit Transaction
            OrderService-->>Controller: CustomerOrderDto
            Controller-->>Customer: HTTP 201 Created (Stock Reserved)
        end
    end
```

---

## 3. Atomic Inter-Warehouse Transfer Workflow

Inter-warehouse transfers operate across two warehouse nodes within a single atomic database transaction. If any step fails, the entire transaction rolls back cleanly.

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Warehouse Staff
    participant InvService as InventoryService
    participant DB as MySQL Database

    Staff->>InvService: transferStock(productId, fromWh, toWh, qty)
    Note over InvService: Check: fromWarehouse != toWarehouse
    Note over InvService: Check: qty > 0
    InvService->>DB: Lock source inventory row
    Note over InvService: Validate: sourceAvailable >= qty
    InvService->>DB: source.onHand = source.onHand - qty
    InvService->>DB: dest.onHand = dest.onHand + qty
    InvService->>DB: INSERT movement (TRANSFER_OUT from source)
    InvService->>DB: INSERT movement (TRANSFER_IN to dest)
    DB-->>InvService: Commit ACID Transaction
    InvService-->>Staff: Return Transfer Confirmation
```

---

## 4. Security & Role-Based Access Architecture

| Role Identifier | Assigned UI Navigation Scopes | Permitted Backend REST Endpoints |
|-----------------|-------------------------------|----------------------------------|
| `ROLE_ADMIN` | Full access across all 13 modules | Unrestricted (`hasRole('ADMIN')`) |
| `ROLE_INVENTORY_MANAGER` | Overview, Inventory, Operations, Insights, Agile | Products, Warehouses, Transfers, Suppliers, POs |
| `ROLE_WAREHOUSE_STAFF` | Stock adjustments, Transfers, Orders, Inbound PO Receiving | `/api/inventory/*`, `/api/orders/*/status`, `/api/purchase-orders/*/receive` |
| `ROLE_VIEWER` | Read-only dashboards and tables | `GET` requests only across all entities |

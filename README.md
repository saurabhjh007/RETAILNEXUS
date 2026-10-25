# RetailNexus — Enterprise Retail Inventory Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.3.1-blue.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.19-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

**RetailNexus** is an enterprise-grade multi-warehouse retail inventory management platform engineered for Indian retail organizations. It centralizes real-time stock balances across regional fulfillment hubs (Mumbai, Delhi, Bengaluru), coordinates atomic inter-warehouse transfers, automates supplier procurement and goods receipt, prevents overselling through database concurrency locks, and delivers audit-ready financial valuations in Indian Rupees (INR, ₹).

---

## 1. System Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React, Recharts, Axios, React Hook Form, Zod.
- **Backend:** Java 24 / Spring Boot 3.4.3, Spring Data JPA, Hibernate ORM, Spring Security (stateless JWT), Bean Validation, Spring Boot Actuator, Apache Commons CSV.
- **Database:** Native MySQL 8 running on port `3307` (`retailnexus_db`) with Flyway schema and seed migrations.
- **Testing:** JUnit 5, Mockito, AssertJ (Backend), Vitest & React Testing Library (Frontend).

---

## 2. Seed User Accounts & Roles (Quick-Fill Available on Login Page)

| Username | Password | Role Identifier | Access Scope |
|----------|----------|-----------------|--------------|
| **`admin`** | `admin123` | `ROLE_ADMIN` | Full super-admin privileges across all 13 modules |
| **`manager`** | `manager123` | `ROLE_INVENTORY_MANAGER` | Products, Warehouses, Transfers, Suppliers, POs, Sprints |
| **`staff`** | `staff123` | `ROLE_WAREHOUSE_STAFF` | Stock adjustments, Transfers, Orders, Inbound PO Receiving |
| **`viewer`** | `viewer123` | `ROLE_VIEWER` | Read-only dashboards, catalogs, movements, and reports |

---

## 3. Implemented Modules (100% Full-Stack Connected)

1. **Executive Dashboard & Analytics (`/`):** KPI cards (Valuation, Total SKUs, Low Stock, Pending Orders), Movement velocity area chart, Category distribution pie chart, Warehouse comparison bar chart, Low-stock alerts table, Recent orders feed.
2. **Product Catalog (`/products`):** Full SKU management, barcodes, cost and selling pricing, category taxonomy, active/inactive archiving, and search/filter.
3. **Multi-Warehouse Facilities (`/warehouses`):** Facilities in Mumbai, Delhi, Bengaluru with capacity meters, facility managers, and financial rollup summaries.
4. **Stock Levels (`/inventory`):** Comprehensive stock ledger tracking on-hand, reserved, and available stock (`onHand - reserved`) with physical count adjustment modal.
5. **Stock Transfers (`/transfers`):** Atomic inter-warehouse transfers debiting source and crediting destination in a single ACID transaction, with live source balance verification.
6. **Movements Ledger (`/movements`):** Immutable audit trail of every stock event (RECEIPT, DISPATCH, TRANSFER, ADJUSTMENT, RESERVATION, RELEASE).
7. **Low-Stock Alerts (`/alerts`):** Automated safety stock triggers with severity classifications (CRITICAL, HIGH, MEDIUM, LOW) and one-click staff acknowledgment.
8. **Customer Orders & Fulfillment (`/orders`):** Order pipeline (PENDING -> PROCESSING -> READY_TO_DISPATCH -> DISPATCHED -> DELIVERED) with live stock reservation and release upon cancellation.
9. **Suppliers Directory (`/suppliers`):** Vendor partners with GSTIN tax identifiers, contact details, active status toggles, and PO counts.
10. **Purchase Orders & Goods Receiving (`/purchase-orders`):** Multi-item PO lifecycle (DRAFT -> SUBMITTED -> APPROVED -> PARTIALLY_RECEIVED -> COMPLETED) with Goods Receipt modal and strict over-receiving prevention.
11. **Valuation Reports & CSV Export (`/reports`):** Cost capital vs. retail revenue metrics, gross margin spreads, top SKU bar chart, and streaming RFC-4180 CSV export.
12. **Users & Role-Based Access (`/users`):** Account provisioning with multiple role assignments and activation toggle.
13. **Agile Delivery Roadmap (`/agile`):** Interactive Scrum delivery dashboard tracking all 8 Epics and 15 Sprints with story points, velocity charts, and progress updating.

---

## 4. Running the Application Locally

### Prerequisites
- Java 21 or Java 24 installed
- Node.js 20+ installed
- MySQL 8 running on port `3307` with database `retailnexus_db`

### Step 1: Start MySQL Server
Ensure MySQL is active on port `3307`:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --datadir="C:\tools\mysqldb" --port=3307 --console
```

### Step 2: Start Spring Boot Backend
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*Backend runs on `http://localhost:8080`. Health check available at `http://localhost:8080/actuator/health`.*

### Step 3: Start React Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 5. Verified Test & Build Results

### Backend Tests (JUnit 5 + Mockito)
```powershell
cd backend
.\mvnw.cmd test
```
**Result:** `Tests run: 7, Failures: 0, Errors: 0, Skipped: 0 — BUILD SUCCESS`

### Frontend Tests (Vitest)
```powershell
cd frontend
npm test
```
**Result:** `Test Files: 1 passed, Tests: 6 passed — Duration: 2.79s`

### Frontend Production Build
```powershell
cd frontend
npm run build
```
**Result:** `dist/index.html (0.74 kB), dist/assets/index-*.js (913 kB) — built in 4.59s with zero errors`

---

## 6. Agile Capstone Documentation Index

Complete Agile documentation is available under [`docs/agile/`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile):
1. [`product-vision.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/product-vision.md)
2. [`stakeholders.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/stakeholders.md)
3. [`epics-and-user-stories.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/epics-and-user-stories.md)
4. [`product-backlog.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/product-backlog.md)
5. [`sprint-plan.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/sprint-plan.md)
6. [`acceptance-criteria.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/acceptance-criteria.md)
7. [`definition-of-ready.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/definition-of-ready.md)
8. [`definition-of-done.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/definition-of-done.md)
9. [`risk-register.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/risk-register.md)
10. [`test-strategy.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/test-strategy.md)
11. [`release-plan.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/release-plan.md)
12. [`sprint-reviews.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/sprint-reviews.md)
13. [`sprint-retrospectives.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/sprint-retrospectives.md)
14. [`traceability-matrix.md`](file:///c:/Users/saura/OneDrive/Desktop/RETAILNEXUS/docs/agile/traceability-matrix.md)

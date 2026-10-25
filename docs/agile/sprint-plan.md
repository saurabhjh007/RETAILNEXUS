# Sprint Plan & Execution Cadence (15 Sprints) — RetailNexus

This master sprint schedule records all **15 planned Scrum sprints** across the development lifecycle, matching the live database records in `agile_sprints`.

---

| Sprint | Sprint Name | Primary Objective / Sprint Goal | Points Planned | Points Done | Start Date | End Date | Status |
|:------:|-------------|---------------------------------|:--------------:|:-----------:|:----------:|:--------:|:------:|
| **Sprint 1** | Foundation & Security | Spring Boot 3.4 setup, MySQL connection on port 3307, JWT stateless security, 4 RBAC roles. | 25 | 25 | 2026-06-01 | 2026-06-14 | COMPLETED |
| **Sprint 2** | Database & App Shell | Flyway schema migrations, React Vite project scaffold, Tailwind dark navy sidebar layout. | 25 | 25 | 2026-06-15 | 2026-06-28 | COMPLETED |
| **Sprint 3** | Product Catalog | Hierarchical categories, product CRUD, SKU generation, pricing in INR, search & filters. | 24 | 24 | 2026-06-29 | 2026-07-12 | COMPLETED |
| **Sprint 4** | Warehouse Facilities | Multi-facility setup (Mumbai, Delhi, Bengaluru), facility managers, capacity utilization. | 22 | 22 | 2026-07-13 | 2026-07-26 | COMPLETED |
| **Sprint 5** | Core Inventory Ledger | Composite inventory tracking (`productId` + `warehouseId`), on-hand/reserved stock math, `@Version` lock. | 26 | 26 | 2026-07-27 | 2026-08-09 | COMPLETED |
| **Sprint 6** | Stock Adjustments | Physical count adjustments, negative stock DB constraints, adjustment movement logging. | 24 | 24 | 2026-08-10 | 2026-08-23 | COMPLETED |
| **Sprint 7** | Inter-Warehouse Transfers | Atomic inter-warehouse transfer transactions, source stock validation, transfer ledger. | 25 | 25 | 2026-08-24 | 2026-09-06 | COMPLETED |
| **Sprint 8** | Movement Audit Ledger | Immutable inventory movement history, filtering by movement type, warehouse, and date. | 23 | 23 | 2026-09-07 | 2026-09-20 | COMPLETED |
| **Sprint 9** | Low-Stock Alerts Engine | Automatic threshold breach alerts, multi-tier severity, one-click staff acknowledgment. | 22 | 22 | 2026-09-21 | 2026-10-04 | COMPLETED |
| **Sprint 10** | Supplier Management | Vendor directory, GSTIN tax validation, contact persons, vendor-PO relationship tracking. | 22 | 22 | 2026-10-05 | 2026-10-18 | COMPLETED |
| **Sprint 11** | Purchase Orders | Multi-item PO builder, landed cost pricing, status transitions (DRAFT -> SUBMITTED -> APPROVED). | 25 | 25 | 2026-10-19 | 2026-11-01 | COMPLETED |
| **Sprint 12** | Inbound Goods Receiving | Line-item receiving modal, over-receiving guards, real-time stock and valuation increments. | 26 | 26 | 2026-11-02 | 2026-11-15 | COMPLETED |
| **Sprint 13** | Customer Orders & Reservation | Customer order entry, immediate stock reservation, preventing overselling across channels. | 25 | 25 | 2026-11-16 | 2026-11-29 | COMPLETED |
| **Sprint 14** | Dispatch Pipeline | Multi-stage dispatch workflow, on-hand deduction, order cancellation reservation release. | 24 | 24 | 2026-11-30 | 2026-12-13 | COMPLETED |
| **Sprint 15** | Analytics & Compliance | Executive inventory valuation reports, RFC-4180 CSV export, performance audit, capstone wrap. | 22 | 22 | 2026-12-14 | 2026-12-27 | COMPLETED |

---

## Sprint Velocity Summary
- **Total Planned Story Points:** 360 Points
- **Total Delivered Story Points:** 360 Points
- **Average Team Velocity:** 24.0 Story Points / Sprint
- **Sprint Success Rate:** 100% Commitment Fulfillment

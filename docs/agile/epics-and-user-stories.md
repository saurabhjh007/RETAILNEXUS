# Epics & User Stories — RetailNexus

This document captures the **8 foundational Epics** and their decomposed Scrum User Stories across the RetailNexus product backlog.

---

## EPIC-01: Enterprise Architecture, RBAC & Core Framework
*Sprint Allocation: Sprint 1 – Sprint 2 | Story Points: 42*
- **US-0101:** As a System Administrator, I want stateless JWT-based authentication so that user sessions are secure and scalable across backend instances. *(8 pts)*
- **US-0102:** As a Security Officer, I want Role-Based Access Control (Admin, Inventory Manager, Warehouse Staff, Auditor) so that personnel only access permitted inventory operations. *(8 pts)*
- **US-0103:** As a DevOps Engineer, I want Flyway automated database migrations so that relational schema and seed datasets are versioned and reproducible. *(8 pts)*
- **US-0104:** As an Architect, I want centralized exception handling with standardized API response envelopes so that the frontend receives uniform error semantics. *(5 pts)*
- **US-0105:** As a Front-End Developer, I want a modern React 19 + Vite scaffold with Tailwind CSS, custom design tokens, and a Midnight Navy sidebar layout. *(13 pts)*

---

## EPIC-02: Product Catalog & Hierarchical Category Taxonomy
*Sprint Allocation: Sprint 3 | Story Points: 38*
- **US-0201:** As an Inventory Manager, I want to create and manage products with unique SKUs, barcodes, unit cost, and retail selling price in INR. *(8 pts)*
- **US-0202:** As an Inventory Manager, I want hierarchical product categories (e.g., Electronics, Fashion, Grocery) to classify inventory positions logically. *(5 pts)*
- **US-0203:** As a Floor Operator, I want instant full-text product search by SKU, barcode, and name with status filtering so that I can look up items quickly. *(8 pts)*
- **US-0204:** As an Operations Manager, I want configurable safety stock and reorder point thresholds per product so that low-stock triggers activate accurately. *(8 pts)*
- **US-0205:** As a Compliance Officer, I want product activation toggles to archive discontinued items without deleting historical ledger records. *(9 pts)*

---

## EPIC-03: Multi-Warehouse Facility Operations & Capacity
*Sprint Allocation: Sprint 4 | Story Points: 35*
- **US-0301:** As a Logistics Director, I want to define multi-location fulfillment facilities (Mumbai Central, Delhi North Hub, Bengaluru South Depot) with unique warehouse codes. *(8 pts)*
- **US-0302:** As an Operations Supervisor, I want to assign facility managers and phone/email contact credentials for each location. *(5 pts)*
- **US-0303:** As an Operations Manager, I want real-time warehouse capacity tracking and utilization gauges to optimize storage allocations. *(8 pts)*
- **US-0304:** As an Auditor, I want a consolidated rollup of total units on hand and financial valuation partitioned by individual warehouse facility. *(14 pts)*

---

## EPIC-04: Real-Time Inventory Engine & Optimistic Locking
*Sprint Allocation: Sprint 5 – Sprint 6 | Story Points: 52*
- **US-0401:** As a Database Architect, I want composite primary key inventory records (`product_id` + `warehouse_id`) with `@Version` optimistic locking to prevent concurrent overwrite collisions. *(13 pts)*
- **US-0402:** As an Inventory Controller, I want strict separation between `on_hand_quantity`, `reserved_quantity`, and calculated `available_stock` (`onHand - reserved`). *(13 pts)*
- **US-0403:** As an Auditor, I want database check constraints and service-level guards that prevent negative stock balances under all operating conditions. *(13 pts)*
- **US-0404:** As a Warehouse Floor Staff member, I want to perform manual physical count stock adjustments with mandatory adjustment reason codes. *(13 pts)*

---

## EPIC-05: Atomic Inter-Warehouse Transfers & Movement Ledger
*Sprint Allocation: Sprint 7 – Sprint 8 | Story Points: 45*
- **US-0501:** As a Logistics Coordinator, I want to execute atomic inter-warehouse transfers where stock is deducted from the source facility and credited to destination facility within a single ACID transaction. *(13 pts)*
- **US-0502:** As a Systems Safeguard, I want transfer requests to validate live available stock at the source warehouse before committing. *(8 pts)*
- **US-0503:** As an Auditor, I want an immutable `inventory_movements` ledger capturing every transaction type (RECEIPT, DISPATCH, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT, RESERVATION, RELEASE). *(13 pts)*
- **US-0504:** As an Operations Lead, I want a searchable movement ledger with filtering by movement type, warehouse, date range, and reference number. *(11 pts)*

---

## EPIC-06: Automated Threshold Triggers & Low-Stock Alerts
*Sprint Allocation: Sprint 9 | Story Points: 34*
- **US-0601:** As an Inventory Manager, I want real-time event triggers that generate alerts when available stock dips below safety reorder thresholds. *(8 pts)*
- **US-0602:** As a Warehouse Supervisor, I want alerts categorized by severity (CRITICAL, HIGH, MEDIUM, LOW) based on stock depletion rates. *(8 pts)*
- **US-0603:** As a Staff Member, I want one-click alert acknowledgment that logs the employee's username and timestamp for accountability. *(8 pts)*
- **US-0604:** As a Procurement Officer, I want unread alert badges in the top navigation header and quick restock recommendations. *(10 pts)*

---

## EPIC-07: Vendor Procurement, Inbound POs & Goods Receipt
*Sprint Allocation: Sprint 10 – Sprint 12 | Story Points: 58*
- **US-0701:** As a Procurement Specialist, I want a verified supplier vendor directory with company names, contact persons, phone numbers, and official GSTIN tax numbers. *(8 pts)*
- **US-0702:** As a Purchasing Officer, I want to generate multi-item Purchase Orders specifying destination warehouse, unit costs in INR, and expected delivery dates. *(13 pts)*
- **US-0703:** As an Approving Manager, I want a formal PO status lifecycle: DRAFT -> SUBMITTED -> APPROVED -> PARTIALLY_RECEIVED -> COMPLETED / CANCELLED. *(13 pts)*
- **US-0704:** As a Receiving Clerk, I want a Goods Receipt modal where I input actual received quantities with strict guards preventing over-receiving beyond ordered quantities. *(13 pts)*
- **US-0705:** As a Financial Accountant, I want goods receipt to recalculate inventory moving average cost and increment physical on-hand balances immediately. *(11 pts)*

---

## EPIC-08: Customer Order Fulfillment & Analytics Reporting
*Sprint Allocation: Sprint 13 – Sprint 15 | Story Points: 56*
- **US-0801:** As a Sales Fulfillment Coordinator, I want customer orders to immediately place stock into `reserved_quantity`, reducing `available_stock` without prematurely deducting physical `on_hand`. *(13 pts)*
- **US-0802:** As a Fulfillment Clerk, I want order dispatch workflows (PENDING -> PROCESSING -> READY_TO_DISPATCH -> DISPATCHED -> DELIVERED) that deduct on-hand and release reservation upon shipment. *(13 pts)*
- **US-0803:** As a Customer Service Agent, I want order cancellations to release reserved stock back into available inventory automatically. *(8 pts)*
- **US-0804:** As a Financial Director, I want real-time valuation reports comparing total invested cost capital against projected retail revenues and gross profit margins. *(11 pts)*
- **US-0805:** As a Compliance Auditor, I want streaming RFC-4180 CSV export of entire inventory ledger positions partitioned by facility. *(11 pts)*

# Release Plan & Deployment Milestones — RetailNexus

## 1. Release Roadmap (3 Major Releases)

```
[Sprint 1 - 4]              [Sprint 5 - 10]              [Sprint 11 - 15]
==================          ==================           ==================
Release 1.0 "Foundations"   Release 2.0 "Core Engine"    Release 3.0 "Enterprise"
- Security & JWT            - Concurrency Locks          - Purchase Orders & Receiving
- Database Migrations       - Atomic Transfers           - Customer Fulfillment
- Product Catalog           - Movement Audit Ledger      - Valuation & CSV Export
- Multi-Warehouse Hubs      - Low Stock Alerts           - Full Capstone Delivery
```

---

## 2. Release Milestone Matrix

### Release 1.0 (MVP Foundations) — Delivered End of Sprint 4
- **Version:** `v1.0.0`
- **Core Scope:**
  - Secure stateless JWT authentication with BCrypt hashing.
  - Multi-warehouse facility modeling (Mumbai, Delhi, Bengaluru).
  - Product catalog management with INR currency formatting and SKU indexing.
  - Role-based access control protecting routes and APIs.

### Release 2.0 (Transactional Engine) — Delivered End of Sprint 10
- **Version:** `v2.0.0`
- **Core Scope:**
  - Real-time inventory calculation: on-hand, reserved, and available stock.
  - JPA `@Version` optimistic locking to prevent overselling and race conditions.
  - Atomic inter-warehouse stock transfers with source validation.
  - Immutable inventory movements ledger recording all adjustments and transfers.
  - Automated low-stock alerts engine with multi-tier severity classifications.

### Release 3.0 (Enterprise Procurement & Fulfillment) — Delivered End of Sprint 15
- **Version:** `v3.0.0` (Current Capstone Production Release)
- **Core Scope:**
  - Complete supplier vendor directory with GSTIN tax validation.
  - Multi-item Purchase Orders with approval lifecycle and goods receipt modal.
  - Prevention of over-receiving beyond authorized PO commitments.
  - Customer order dispatch pipeline with live stock reservation and release.
  - Real-time inventory valuation reports comparing cost vs. retail capital.
  - Streaming RFC-4180 CSV export endpoint.
  - Interactive Agile Scrum Delivery dashboard documenting 8 epics and 15 sprints.

---

## 3. Environment & Deployment Configuration

| Environment | Host / Port | Database | Build Command | Status |
|-------------|-------------|----------|---------------|:------:|
| **Backend API** | `localhost:8080` | MySQL 8 on port `3307` (`retailnexus_db`) | `.\mvnw.cmd spring-boot:run` | **ACTIVE (UP)** |
| **Frontend Web** | `localhost:5173` | Proxies to `:8080/api` | `npm run dev` / `npm run build` | **ACTIVE (UP)** |
| **Database Server** | `127.0.0.1:3307` | Dedicated MySQL daemon | Native mysqld service | **ACTIVE (UP)** |

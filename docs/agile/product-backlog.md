# Product Backlog & Prioritization Matrix — RetailNexus

## 1. Backlog Prioritization Methodology (MoSCoW & WSJF)
User stories are prioritized using the **MoSCoW framework** (Must Have, Should Have, Could Have, Won't Have this release) and **Weighted Shortest Job First (WSJF)** based on Cost of Delay / Job Size.

| Story ID | Epic | User Story Summary | Points | MoSCoW | Priority | Sprint | Status |
|----------|------|--------------------|:------:|:------:|:--------:|:------:|:------:|
| **US-0101** | EPIC-01 | JWT Stateless Authentication & Token Rotation | 8 | MUST | P0 | Sprint 1 | DONE |
| **US-0102** | EPIC-01 | Role-Based Access Control (4 Roles) | 8 | MUST | P0 | Sprint 1 | DONE |
| **US-0103** | EPIC-01 | Flyway Automated Schema & Seed Migrations | 8 | MUST | P0 | Sprint 2 | DONE |
| **US-0104** | EPIC-01 | Global Exception Handling & Envelope DTOs | 5 | MUST | P1 | Sprint 2 | DONE |
| **US-0105** | EPIC-01 | React Vite App Shell & Navy Design Tokens | 13 | MUST | P0 | Sprint 2 | DONE |
| **US-0201** | EPIC-02 | Product CRUD with SKU & INR Pricing | 8 | MUST | P0 | Sprint 3 | DONE |
| **US-0202** | EPIC-02 | Category Taxonomy & Classification | 5 | SHOULD | P1 | Sprint 3 | DONE |
| **US-0203** | EPIC-02 | Dynamic Search & Real-time Filter Bar | 8 | MUST | P1 | Sprint 3 | DONE |
| **US-0204** | EPIC-02 | Safety Stock & Reorder Point Definitions | 8 | MUST | P0 | Sprint 3 | DONE |
| **US-0205** | EPIC-02 | Soft-Delete Product Archive Toggle | 9 | SHOULD | P2 | Sprint 3 | DONE |
| **US-0301** | EPIC-03 | Multi-Warehouse Network Definition | 8 | MUST | P0 | Sprint 4 | DONE |
| **US-0302** | EPIC-03 | Warehouse Contact & Facility Managers | 5 | SHOULD | P2 | Sprint 4 | DONE |
| **US-0303** | EPIC-03 | Facility Utilization & Storage Metrics | 8 | SHOULD | P1 | Sprint 4 | DONE |
| **US-0304** | EPIC-03 | Facility Rollup Valuation Summary Cards | 14 | MUST | P1 | Sprint 4 | DONE |
| **US-0401** | EPIC-04 | Composite Key Stock Records with `@Version` | 13 | MUST | P0 | Sprint 5 | DONE |
| **US-0402** | EPIC-04 | On-hand / Reserved / Available Calculations | 13 | MUST | P0 | Sprint 5 | DONE |
| **US-0403** | EPIC-04 | Database Negative Stock Constraint Guards | 13 | MUST | P0 | Sprint 6 | DONE |
| **US-0404** | EPIC-04 | Physical Stock Count Adjustment Ledger | 13 | MUST | P1 | Sprint 6 | DONE |
| **US-0501** | EPIC-05 | Atomic ACID Inter-Warehouse Stock Transfer | 13 | MUST | P0 | Sprint 7 | DONE |
| **US-0502** | EPIC-05 | Source Stock Sufficiency Verification | 8 | MUST | P0 | Sprint 7 | DONE |
| **US-0503** | EPIC-05 | Immutable Audit Inventory Movement Ledger | 13 | MUST | P0 | Sprint 8 | DONE |
| **US-0504** | EPIC-05 | Movement Ledger Multi-facet Filter Engine | 11 | SHOULD | P1 | Sprint 8 | DONE |
| **US-0601** | EPIC-06 | Automated Stock Threshold Breaches | 8 | MUST | P0 | Sprint 9 | DONE |
| **US-0602** | EPIC-06 | Multi-Tier Severity Classification Engine | 8 | SHOULD | P1 | Sprint 9 | DONE |
| **US-0603** | EPIC-06 | One-Click Alert Acknowledgment Log | 8 | MUST | P1 | Sprint 9 | DONE |
| **US-0604** | EPIC-06 | Header Alert Badge & Notification Counter | 10 | SHOULD | P2 | Sprint 9 | DONE |
| **US-0701** | EPIC-07 | Vendor Directory with GSTIN Validation | 8 | MUST | P1 | Sprint 10 | DONE |
| **US-0702** | EPIC-07 | Multi-Item Purchase Order Builder | 13 | MUST | P0 | Sprint 10 | DONE |
| **US-0703** | EPIC-07 | Purchase Order Approval Workflow State | 13 | MUST | P1 | Sprint 11 | DONE |
| **US-0704** | EPIC-07 | Goods Receipt Verification with Over-receive Guard | 13 | MUST | P0 | Sprint 12 | DONE |
| **US-0705** | EPIC-07 | Landed Cost Recalculation & Stock Increment | 11 | MUST | P0 | Sprint 12 | DONE |
| **US-0801** | EPIC-08 | Customer Order Stock Reservation Engine | 13 | MUST | P0 | Sprint 13 | DONE |
| **US-0802** | EPIC-08 | Multi-Stage Order Dispatch & Stock Deduction | 13 | MUST | P0 | Sprint 14 | DONE |
| **US-0803** | EPIC-08 | Order Cancellation Stock Release Engine | 8 | MUST | P1 | Sprint 14 | DONE |
| **US-0804** | EPIC-08 | Real-time Valuation & Profit Spread Analytics | 11 | MUST | P0 | Sprint 15 | DONE |
| **US-0805** | EPIC-08 | Streaming RFC-4180 CSV Export Endpoint | 11 | MUST | P0 | Sprint 15 | DONE |

## 2. Total Backlog Story Point Accounting
- **Total Backlog Items:** 36 User Stories
- **Total Story Points:** 360 Story Points
- **Status:** 100% Complete & Verified against Live Spring Boot & React Deployment

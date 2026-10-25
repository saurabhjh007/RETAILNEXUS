# Sprint Reviews & Stakeholder Feedback Logs — RetailNexus

This document records the formal **Sprint Review** ceremonies conducted at the end of each development milestone, summarizing software demonstrations, stakeholder feedback, and backlog adaptations.

---

## Sprint 1 & 2 Review: Architecture, Security & App Shell
- **Date:** 2026-06-28
- **Attendees:** Product Owner, Lead Architect, Lead UI Designer, Security Officer
- **Demonstration:**
  - Live login using BCrypt credentials (`admin/admin123`, `manager/manager123`).
  - Flyway migrations initializing 16 tables in `retailnexus_db` on MySQL port 3307.
  - Midnight Navy enterprise sidebar layout with responsive drawer navigation.
- **Feedback & Adaptations:**
  - *PO Feedback:* Ensure quick-fill credential chips are available on the login page for rapid stakeholder demonstration.
  - *Decision:* Implemented 4 quick-fill persona cards (Admin, Manager, Staff, Viewer) on the login interface.

---

## Sprint 3 & 4 Review: Products & Multi-Warehouse Hubs
- **Date:** 2026-07-26
- **Attendees:** Product Owner, Regional Logistics Manager, Financial Lead
- **Demonstration:**
  - Product catalog supporting Indian retail SKUs with INR pricing (`₹`).
  - Three regional fulfillment facilities: Mumbai Central, Delhi North Hub, and Bengaluru South Depot.
  - Live search bar and category filtering.
- **Feedback & Adaptations:**
  - *Logistics Lead:* Add facility storage capacity and manager contact info to warehouse cards.
  - *Decision:* Added capacity meters, manager phone, and email details to the facility cards.

---

## Sprint 5 & 6 Review: Real-Time Stock Math & Locking Engine
- **Date:** 2026-08-23
- **Attendees:** Product Owner, Lead Architect, Internal Auditor
- **Demonstration:**
  - On-hand, reserved, and available stock computation (`available = onHand - reserved`).
  - `@Version` optimistic locking preventing concurrent duplicate allocations.
  - Physical stock count adjustment modal with mandatory reason notes.
- **Feedback & Adaptations:**
  - *Auditor Feedback:* Ensure all manual count adjustments require a non-empty audit note.
  - *Decision:* Enforced client and server-side validation requiring detailed adjustment reasons.

---

## Sprint 7 & 8 Review: Inter-Warehouse Transfers & Audit Ledger
- **Date:** 2026-09-20
- **Attendees:** Regional Logistics Manager, Warehouse Supervisors
- **Demonstration:**
  - Atomic inter-warehouse transfers debiting source and crediting destination in one transaction.
  - Real-time client-side check verifying source warehouse available stock before initiating transfer.
  - Searchable, immutable movement audit history with filter chips.
- **Feedback & Adaptations:**
  - *Logistics Lead:* Make sure the transfer screen displays live available stock for the selected source facility.
  - *Decision:* Implemented automatic inventory balance lookup when source warehouse is selected.

---

## Sprint 9 & 10 Review: Low-Stock Alerts & Vendor Directory
- **Date:** 2026-10-18
- **Attendees:** Procurement Lead, Operations Lead
- **Demonstration:**
  - Automated low-stock alerts triggering when available stock drops below threshold.
  - Alert acknowledgment action recording timestamp and username.
  - Vendor directory with GSTIN numbers, contact persons, and active/inactive status toggles.
- **Feedback & Adaptations:**
  - *Procurement Lead:* Add GSTIN tax number to supplier records for GST compliance.
  - *Decision:* Added GSTIN validation and display across vendor directory tables.

---

## Sprint 11 & 12 Review: Purchase Orders & Goods Receiving
- **Date:** 2026-11-15
- **Attendees:** Head of Procurement, Warehouse Floor Staff, Lead Architect
- **Demonstration:**
  - Multi-item Purchase Order creation with calculated line totals.
  - Inbound goods receipt modal with item-by-item receipt inputs.
  - System blocking receipt quantities exceeding remaining ordered units.
- **Feedback & Adaptations:**
  - *Warehouse Floor:* Allow partial receiving when vendors deliver split shipments across multiple days.
  - *Decision:* Implemented status transition to `PARTIALLY_RECEIVED` until all line item quantities match ordered amounts.

---

## Sprint 13 – 15 Review: Fulfillment, Valuation & Capstone Signoff
- **Date:** 2026-12-27
- **Attendees:** Executive Sponsor (VP Supply Chain), Product Owner, Lead Architect, Financial Auditor
- **Demonstration:**
  - Customer order creation reserving stock immediately.
  - Multi-stage dispatch workflow releasing reservation and deducting physical stock upon shipment.
  - Executive valuation analytics comparing invested cost capital vs. retail revenues.
  - Real-time RFC-4180 CSV export downloading full inventory position snapshot.
  - Interactive Agile Delivery page presenting 8 epics, 15 sprints, and burndown chart.
- **Final Signoff:**
  - *Executive Sponsor:* "RetailNexus fulfills all enterprise requirements, eliminates overselling risk, and delivers a commercial-grade user experience. Accepted for production release."

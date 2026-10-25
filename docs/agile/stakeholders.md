# Stakeholders & Governance Matrix — RetailNexus

## 1. Stakeholder Register

| Stakeholder Name | Organization Role | Project Role | Responsibilities | Key Interests / Success Criteria |
|------------------|-------------------|--------------|------------------|----------------------------------|
| **Vikram Malhotra** | VP of Supply Chain | Executive Sponsor | Strategic oversight, budget approval, milestone signoff | Network fill rates >98%, inventory turnover improvement |
| **Pooja Iyer** | Head of Product | Product Owner (PO) | Backlog prioritization, user stories, acceptance criteria | On-time sprint deliveries, intuitive UX, business rule fidelity |
| **Saurabh Jha** | Lead Architect & Full Stack Lead | Scrum Master / Tech Lead | Architecture, Spring Boot backend, React frontend, database | High throughput, sub-100ms API latency, zero negative stock |
| **Rajesh Sharma** | Regional Logistics Manager | Key Stakeholder | Multi-warehouse operational workflows, transfer logic | Seamless inter-facility transfers, accurate warehouse capacity |
| **Ananya Sen** | Head of Procurement | Key Stakeholder | Vendor relationships, PO approvals, GSTIN compliance | Complete vendor directory, over-receiving prevention |
| **Deepak Verma** | Internal Audit Lead | Governance Officer | Financial compliance, audit logging, CSV export verification | Immutable movement history, accurate landed cost calculations |

## 2. RACI Matrix (Responsible, Accountable, Consulted, Informed)

| Capability / Workflow | Product Owner | Tech Lead / Dev | Warehouse Staff | Procurement Lead | Auditor |
|-----------------------|:-------------:|:---------------:|:---------------:|:----------------:|:-------:|
| Product Taxonomy & SKU Definition | A | R | C | C | I |
| Multi-Warehouse Capacity Configuration | A | R | C | I | I |
| Atomic Stock Transfers | C | R / A | R | I | I |
| Low Stock Threshold Triggers | A | R | I | C | I |
| Purchase Order Approval | C | R | I | A | I |
| Goods Receipt Validation | I | R | R / A | C | I |
| Customer Order Fulfillment | I | R | R / A | I | I |
| Inventory Valuation CSV Export | C | R | I | I | A |
| User Provisioning & RBAC | A | R | I | I | C |

## 3. Communication & Governance Cadence
- **Daily Scrum:** 15-minute standup at 09:30 IST (Blockers, sprint progress, daily goals).
- **Sprint Planning:** Bi-weekly on Mondays (Velocity calibration, story points estimation, sprint backlog commitment).
- **Sprint Review & Demo:** Bi-weekly on Fridays (Live software demonstration to stakeholders on running environment).
- **Sprint Retrospective:** Following sprint review (Continuous process improvement, technical debt review).

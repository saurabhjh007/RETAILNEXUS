# REST API Specification — RetailNexus

All endpoints respond with the standardized JSON envelope:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-10-25T20:30:00"
}
```

---

## 1. Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticates with username and password, returns JWT token, user info, and roles.

## 2. Products (`/api/products`)
- `GET /api/products`: Paginated search with `query`, `categoryId`, `active`, `page`, `size`.
- `GET /api/products/{id}`: Single product by ID.
- `GET /api/products/categories`: All product categories.
- `POST /api/products`: Create new product (Admin, Manager).
- `PUT /api/products/{id}`: Update product fields (Admin, Manager).
- `PATCH /api/products/{id}/toggle-active`: Toggle active state (Admin).

## 3. Warehouses (`/api/warehouses`)
- `GET /api/warehouses`: List all active warehouses.
- `GET /api/warehouses/{id}`: Single warehouse by ID.
- `GET /api/warehouses/{id}/summary`: Rollup summary (units on hand, total valuation).
- `POST /api/warehouses`: Create warehouse (Admin, Manager).
- `PUT /api/warehouses/{id}`: Update warehouse (Admin, Manager).

## 4. Inventory & Movements (`/api/inventory`)
- `GET /api/inventory/stock-levels`: Paginated stock levels across warehouses.
- `GET /api/inventory/{productId}/{warehouseId}`: Specific stock position with available stock.
- `POST /api/inventory/adjust`: Manual physical stock count adjustment.
- `POST /api/inventory/transfer`: Atomic inter-warehouse stock transfer.
- `GET /api/inventory/movements`: Immutable inventory movements audit log.

## 5. Alerts (`/api/alerts`)
- `GET /api/alerts`: Low-stock alerts with `acknowledged`, `severity`, `alertType` filters.
- `GET /api/alerts/unread-count`: Count of active unacknowledged alerts.
- `PATCH /api/alerts/{id}/acknowledge`: Mark alert as acknowledged.

## 6. Suppliers (`/api/suppliers`)
- `GET /api/suppliers`: Paginated supplier list with search.
- `GET /api/suppliers/active`: List of all active suppliers for dropdowns.
- `GET /api/suppliers/{id}`: Single supplier details.
- `POST /api/suppliers`: Create supplier (Admin, Manager).
- `PUT /api/suppliers/{id}`: Update supplier (Admin, Manager).
- `PATCH /api/suppliers/{id}/toggle-active`: Toggle supplier active state (Admin).

## 7. Purchase Orders (`/api/purchase-orders`)
- `GET /api/purchase-orders`: Paginated PO list with filters.
- `GET /api/purchase-orders/{id}`: PO details with line items.
- `POST /api/purchase-orders`: Create draft purchase order.
- `PATCH /api/purchase-orders/{id}/status`: Transition PO status (`SUBMITTED`, `APPROVED`, `CANCELLED`).
- `POST /api/purchase-orders/{id}/receive`: Receive inbound goods with over-receiving validation.

## 8. Customer Orders (`/api/orders`)
- `GET /api/orders`: Paginated customer orders list with filters.
- `GET /api/orders/{id}`: Order details with line items.
- `POST /api/orders`: Place order with automatic stock reservation.
- `PATCH /api/orders/{id}/status`: Transition fulfillment status (`PROCESSING`, `READY_TO_DISPATCH`, `DISPATCHED`, `DELIVERED`, `CANCELLED`).

## 9. Reports (`/api/reports`)
- `GET /api/reports/valuation`: Real-time valuation report (total cost, retail value, gross profit).
- `GET /api/reports/export/inventory-csv`: Streaming RFC-4180 CSV export of entire inventory ledger.

## 10. Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats`: Aggregated summary KPIs, movement velocity, category breakdown, warehouse comparison, low stock items, and recent orders.

## 11. Users & RBAC (`/api/users`)
- `GET /api/users`: List all system user accounts.
- `POST /api/users`: Provision user account with roles (Admin only).
- `PATCH /api/users/{id}/toggle-active`: Deactivate or activate user account (Admin only).

## 12. Agile Delivery (`/api/agile`)
- `GET /api/agile/sprints`: List all 15 planned Scrum sprints with goals and progress.
- `PATCH /api/agile/sprints/{sprintNumber}`: Update sprint progress and completed story points (Admin, Manager).

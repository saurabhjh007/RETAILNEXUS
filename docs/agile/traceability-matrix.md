# Requirements Traceability Matrix (RTM) — RetailNexus

This matrix maps every foundational business requirement from the Product Vision through Epics, User Stories, Database Tables, REST Endpoints, Frontend Pages, and Automated Test Cases.

---

| Requirement | Epic ID | User Story | Database Tables Involved | Backend REST Endpoint | Frontend Module / Route | Automated Test Coverage |
|-------------|:-------:|:----------:|:------------------------:|:---------------------:|:-----------------------:|:-----------------------:|
| **User Authentication** | EPIC-01 | US-0101 | `users`, `roles`, `user_roles` | `POST /api/auth/login` | `Login.jsx` (`/login`) | `AuthControllerTest` |
| **Role-Based Access** | EPIC-01 | US-0102 | `roles`, `user_roles` | `GET /api/users` | `Users.jsx` (`/users`) | `SecurityConfigTest` |
| **Product Catalog** | EPIC-02 | US-0201 | `products`, `categories` | `GET /api/products` | `Products.jsx` (`/products`) | `ProductServiceTest` |
| **Category Classification** | EPIC-02 | US-0202 | `categories` | `GET /api/products/categories` | `Products.jsx` (`/products`) | `ProductServiceTest` |
| **Multi-Warehouse Facilities** | EPIC-03 | US-0301 | `warehouses` | `GET /api/warehouses` | `Warehouses.jsx` (`/warehouses`) | `WarehouseServiceTest` |
| **Facility Capacity & Rollup** | EPIC-03 | US-0304 | `warehouses`, `inventories` | `GET /api/warehouses/{id}/summary` | `Warehouses.jsx` (`/warehouses`) | `WarehouseServiceTest` |
| **Core Stock Ledger Math** | EPIC-04 | US-0402 | `inventories` | `GET /api/inventory/stock-levels` | `StockLevels.jsx` (`/inventory`) | `InventoryServiceTest` |
| **Optimistic Lock & Negative Guard** | EPIC-04 | US-0401 | `inventories` (`version` col) | `POST /api/inventory/adjust` | `StockLevels.jsx` (`/inventory`) | `InventoryServiceTest.testAdjustStock_Success` |
| **Atomic Stock Transfer** | EPIC-05 | US-0501 | `inventories`, `inventory_movements` | `POST /api/inventory/transfer` | `StockTransfers.jsx` (`/transfers`) | `InventoryServiceTest.testStockTransfer_Success` |
| **Source Stock Sufficiency** | EPIC-05 | US-0502 | `inventories` | `POST /api/inventory/transfer` | `StockTransfers.jsx` (`/transfers`) | `InventoryServiceTest.testStockTransfer_InsufficientStock` |
| **Movement Audit Trail** | EPIC-05 | US-0503 | `inventory_movements` | `GET /api/inventory/movements` | `InventoryMovements.jsx` (`/movements`) | `InventoryServiceTest` |
| **Low-Stock Alerts** | EPIC-06 | US-0601 | `alerts` | `GET /api/alerts` | `LowStockAlerts.jsx` (`/alerts`) | `AlertServiceTest` |
| **Alert Acknowledgment** | EPIC-06 | US-0603 | `alerts` | `PATCH /api/alerts/{id}/acknowledge` | `LowStockAlerts.jsx` (`/alerts`) | `AlertServiceTest` |
| **Vendor Directory** | EPIC-07 | US-0701 | `suppliers` | `GET /api/suppliers` | `Suppliers.jsx` (`/suppliers`) | `SupplierServiceTest` |
| **Purchase Order Builder** | EPIC-07 | US-0702 | `purchase_orders`, `po_items` | `POST /api/purchase-orders` | `PurchaseOrders.jsx` (`/purchase-orders`) | `PurchaseOrderServiceTest` |
| **Goods Receipt & Cost Update** | EPIC-07 | US-0704 | `inventories`, `po_items`, `movements` | `POST /api/purchase-orders/{id}/receive` | `PurchaseOrders.jsx` (`/purchase-orders`) | `PurchaseOrderServiceTest.testReceiveGoods_Success` |
| **Over-Receiving Guard** | EPIC-07 | US-0704 | `purchase_orders`, `po_items` | `POST /api/purchase-orders/{id}/receive` | `PurchaseOrders.jsx` (`/purchase-orders`) | `PurchaseOrderServiceTest.testReceiveGoods_OverReceivingRejected` |
| **Customer Order Reservation** | EPIC-08 | US-0801 | `customer_orders`, `order_items`, `inventories` | `POST /api/orders` | `CustomerOrders.jsx` (`/orders`) | `CustomerOrderServiceTest` |
| **Fulfillment & Dispatch** | EPIC-08 | US-0802 | `customer_orders`, `inventories`, `movements` | `PATCH /api/orders/{id}/status` | `CustomerOrders.jsx` (`/orders`) | `CustomerOrderServiceTest` |
| **Valuation Analytics** | EPIC-08 | US-0804 | `inventories`, `products` | `GET /api/reports/valuation` | `Reports.jsx` (`/reports`) | `ReportServiceTest` |
| **Streaming RFC-4180 CSV** | EPIC-08 | US-0805 | `inventories`, `products`, `warehouses` | `GET /api/reports/export/inventory-csv` | `Reports.jsx` (`/reports`) | `ReportServiceTest` |
| **Agile Sprints & Delivery** | EPIC-08 | N/A | `agile_sprints` | `GET /api/agile/sprints` | `AgileDelivery.jsx` (`/agile`) | `AgileSprintServiceTest` |

# Acceptance Criteria Specification (Given-When-Then) — RetailNexus

This document specifies the standard Gherkin-format **Acceptance Criteria** for core transactional workflows in RetailNexus.

---

## 1. Feature: Inter-Warehouse Stock Transfer
```gherkin
Scenario: Successful atomic stock transfer between facilities
  Given product SKU "SKU-ELE-001" has 100 on-hand units in "Mumbai Central"
    And "Mumbai Central" has 0 reserved units (100 available)
  When warehouse staff initiates a transfer of 25 units to "Bengaluru South Depot"
  Then the system executes the transfer within a single ACID database transaction
    And "Mumbai Central" on-hand stock decreases to 75 units
    And "Bengaluru South Depot" on-hand stock increases by 25 units
    And two immutable movement ledger records are created:
      | Type         | Warehouse | Quantity |
      | TRANSFER_OUT | Mumbai    | -25      |
      | TRANSFER_IN  | Bengaluru | +25      |

Scenario: Reject transfer when requested quantity exceeds available stock
  Given product SKU "SKU-ELE-001" has 10 available units in "Mumbai Central"
  When staff attempts to transfer 15 units to "Delhi North Hub"
  Then the system rejects the transaction with HTTP 400 Bad Request
    And throws InsufficientStockException: "Available stock (10) is less than transfer quantity (15)"
    And no inventory balances are modified
    And no movement ledger records are inserted
```

---

## 2. Feature: Inbound Goods Receiving & Over-Receive Prevention
```gherkin
Scenario: Partial goods receipt against approved purchase order
  Given purchase order "PO-2026-0001" is in "APPROVED" status
    And line item "SKU-APP-001" has quantity ordered 50 and received 0
  When warehouse staff enters 20 units received at "Delhi North Hub"
  Then the line item received quantity updates to 20
    And the purchase order status transitions to "PARTIALLY_RECEIVED"
    And "Delhi North Hub" on-hand inventory increments by 20 units
    And an inventory movement record of type "PURCHASE_RECEIPT" is logged
    And the product cost price updates based on weighted average valuation

Scenario: Block over-receiving beyond purchase order authorization
  Given purchase order "PO-2026-0001" has 30 remaining units to receive for "SKU-APP-001"
  When staff submits a receipt quantity of 35 units
  Then the system aborts the receipt request
    And throws BusinessException: "Cannot receive 35 units; maximum allowable remaining is 30"
    And no inventory records are modified
```

---

## 3. Feature: Customer Order Reservation & Concurrency Lock
```gherkin
Scenario: Automatic stock reservation on customer order creation
  Given product "SKU-GRO-001" has 200 on-hand and 0 reserved in "Mumbai Central"
  When a customer places an order for 10 units fulfilled by "Mumbai Central"
  Then the order status is set to "PENDING"
    And "Mumbai Central" reserved stock increases to 10
    And "Mumbai Central" available stock decreases to 190 (200 on-hand - 10 reserved)
    And physical on-hand stock remains unchanged at 200 units until dispatch
    And an inventory movement record of type "RESERVATION" is logged

Scenario: Prevent overselling when concurrent requests exceed available stock
  Given product "SKU-GRO-001" has 5 available units
  When Order A requests 4 units and Order B requests 3 units concurrently
  Then the database optimistic lock (@Version) or pessimistic row lock enforces sequential processing
    And Order A reserves 4 units successfully (leaving 1 unit available)
    And Order B receives HTTP 400 "Insufficient available stock"
    And stock is not over-committed
```

---

## 4. Feature: Customer Order Dispatch & Physical Stock Deduction
```gherkin
Scenario: Order dispatch deducts physical stock and releases reservation
  Given order "ORD-2026-0001" is in "READY_TO_DISPATCH" status with 10 units reserved
    And "Mumbai Central" has 200 on-hand and 10 reserved units
  When fulfillment staff marks order status as "DISPATCHED"
  Then the order status becomes "DISPATCHED"
    And "Mumbai Central" on-hand stock decreases from 200 to 190
    And "Mumbai Central" reserved stock decreases from 10 to 0
    And available stock remains constant at 190
    And an inventory movement record of type "DISPATCH" is created
```

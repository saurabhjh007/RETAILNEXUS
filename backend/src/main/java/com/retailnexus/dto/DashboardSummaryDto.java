package com.retailnexus.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {
    private long totalActiveProducts;
    private long totalAvailableUnits;
    private BigDecimal inventoryValuation;
    private long lowStockItemsCount;
    private long outOfStockItemsCount;
    private long pendingOrdersCount;
    private long pendingPurchaseOrdersCount;

    private List<Map<String, Object>> warehouseComparison;
    private List<Map<String, Object>> stockByCategory;
    private List<Map<String, Object>> movementTrend;
    private List<InventoryDto> lowStockAlerts;
    private List<InventoryMovementDto> recentMovements;
    private List<CustomerOrderDto> recentOrders;

    public DashboardSummaryDto() {}

    public long getTotalActiveProducts() { return totalActiveProducts; }
    public void setTotalActiveProducts(long totalActiveProducts) { this.totalActiveProducts = totalActiveProducts; }

    public long getTotalAvailableUnits() { return totalAvailableUnits; }
    public void setTotalAvailableUnits(long totalAvailableUnits) { this.totalAvailableUnits = totalAvailableUnits; }

    public BigDecimal getInventoryValuation() { return inventoryValuation; }
    public void setInventoryValuation(BigDecimal inventoryValuation) { this.inventoryValuation = inventoryValuation; }

    public long getLowStockItemsCount() { return lowStockItemsCount; }
    public void setLowStockItemsCount(long lowStockItemsCount) { this.lowStockItemsCount = lowStockItemsCount; }

    public long getOutOfStockItemsCount() { return outOfStockItemsCount; }
    public void setOutOfStockItemsCount(long outOfStockItemsCount) { this.outOfStockItemsCount = outOfStockItemsCount; }

    public long getPendingOrdersCount() { return pendingOrdersCount; }
    public void setPendingOrdersCount(long pendingOrdersCount) { this.pendingOrdersCount = pendingOrdersCount; }

    public long getPendingPurchaseOrdersCount() { return pendingPurchaseOrdersCount; }
    public void setPendingPurchaseOrdersCount(long pendingPurchaseOrdersCount) { this.pendingPurchaseOrdersCount = pendingPurchaseOrdersCount; }

    public List<Map<String, Object>> getWarehouseComparison() { return warehouseComparison; }
    public void setWarehouseComparison(List<Map<String, Object>> warehouseComparison) { this.warehouseComparison = warehouseComparison; }

    public List<Map<String, Object>> getStockByCategory() { return stockByCategory; }
    public void setStockByCategory(List<Map<String, Object>> stockByCategory) { this.stockByCategory = stockByCategory; }

    public List<Map<String, Object>> getMovementTrend() { return movementTrend; }
    public void setMovementTrend(List<Map<String, Object>> movementTrend) { this.movementTrend = movementTrend; }

    public List<InventoryDto> getLowStockAlerts() { return lowStockAlerts; }
    public void setLowStockAlerts(List<InventoryDto> lowStockAlerts) { this.lowStockAlerts = lowStockAlerts; }

    public List<InventoryMovementDto> getRecentMovements() { return recentMovements; }
    public void setRecentMovements(List<InventoryMovementDto> recentMovements) { this.recentMovements = recentMovements; }

    public List<CustomerOrderDto> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<CustomerOrderDto> recentOrders) { this.recentOrders = recentOrders; }
}

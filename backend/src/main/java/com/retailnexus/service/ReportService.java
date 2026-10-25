package com.retailnexus.service;

import com.retailnexus.dto.InventoryDto;
import com.retailnexus.entity.Inventory;
import com.retailnexus.entity.Warehouse;
import com.retailnexus.repository.InventoryRepository;
import com.retailnexus.repository.WarehouseRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final InventoryRepository inventoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryService inventoryService;

    public ReportService(InventoryRepository inventoryRepository,
                         WarehouseRepository warehouseRepository,
                         InventoryService inventoryService) {
        this.inventoryRepository = inventoryRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInventoryValuationReport(Long warehouseId) {
        List<Inventory> inventories = warehouseId != null
            ? inventoryRepository.findByWarehouseId(warehouseId)
            : inventoryRepository.findAll();

        int totalUnits = 0;
        BigDecimal totalCostValuation = BigDecimal.ZERO;
        BigDecimal totalRetailValuation = BigDecimal.ZERO;

        for (Inventory inv : inventories) {
            int onHand = inv.getOnHandQuantity();
            totalUnits += onHand;

            BigDecimal cost = inv.getProduct().getCostPrice().multiply(BigDecimal.valueOf(onHand));
            BigDecimal retail = inv.getProduct().getSellingPrice().multiply(BigDecimal.valueOf(onHand));

            totalCostValuation = totalCostValuation.add(cost);
            totalRetailValuation = totalRetailValuation.add(retail);
        }

        BigDecimal potentialGrossProfit = totalRetailValuation.subtract(totalCostValuation);

        Map<String, Object> report = new HashMap<>();
        report.put("warehouseId", warehouseId);
        report.put("totalUnits", totalUnits);
        report.put("totalCostValuation", totalCostValuation);
        report.put("totalRetailValuation", totalRetailValuation);
        report.put("potentialGrossProfit", potentialGrossProfit);
        report.put("skuCount", inventories.size());

        return report;
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportInventoryCsv(Long warehouseId) {
        List<Inventory> inventories = warehouseId != null
            ? inventoryRepository.findByWarehouseId(warehouseId)
            : inventoryRepository.findAll();

        CSVFormat format = CSVFormat.DEFAULT.builder()
            .setHeader("SKU", "Product Name", "Category", "Warehouse", "On Hand", "Reserved", "Available", "Unit Cost (INR)", "Total Valuation (INR)", "Stock Status")
            .build();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8), format)) {

            for (Inventory inv : inventories) {
                InventoryDto dto = inventoryService.mapToDto(inv);
                printer.printRecord(
                    dto.getProductSku(),
                    dto.getProductName(),
                    dto.getCategoryName(),
                    dto.getWarehouseName(),
                    dto.getOnHandQuantity(),
                    dto.getReservedQuantity(),
                    dto.getAvailableQuantity(),
                    dto.getCostPrice(),
                    dto.getTotalValuation(),
                    dto.getStockStatus()
                );
            }

            printer.flush();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate inventory CSV export: " + e.getMessage(), e);
        }
    }
}

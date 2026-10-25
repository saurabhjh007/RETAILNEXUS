package com.retailnexus.service;

import com.retailnexus.dto.SupplierDto;
import com.retailnexus.dto.SupplierRequest;
import com.retailnexus.entity.Supplier;
import com.retailnexus.exception.InvalidOperationException;
import com.retailnexus.exception.ResourceNotFoundException;
import com.retailnexus.repository.PurchaseOrderRepository;
import com.retailnexus.repository.SupplierRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final AuditService auditService;

    public SupplierService(SupplierRepository supplierRepository,
                           PurchaseOrderRepository purchaseOrderRepository,
                           AuditService auditService) {
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<SupplierDto> getSuppliers(String query, Boolean active, Pageable pageable) {
        return supplierRepository.searchSuppliers(query, active, pageable)
            .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<SupplierDto> getAllActiveSuppliers() {
        return supplierRepository.findByActiveTrue().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierDto getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return mapToDto(supplier);
    }

    @Transactional
    public SupplierDto createSupplier(SupplierRequest request) {
        if (supplierRepository.existsByCode(request.getCode())) {
            throw new InvalidOperationException("Supplier with code '" + request.getCode() + "' already exists");
        }

        Supplier supplier = new Supplier();
        supplier.setCode(request.getCode().toUpperCase().trim());
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setGstin(request.getGstin());
        supplier.setActive(request.isActive());

        Supplier saved = supplierRepository.save(supplier);
        auditService.record("Supplier", saved.getCode(), "CREATE", "Created supplier: " + saved.getName());

        return mapToDto(saved);
    }

    @Transactional
    public SupplierDto updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        if (!supplier.getCode().equalsIgnoreCase(request.getCode().trim()) && supplierRepository.existsByCode(request.getCode())) {
            throw new InvalidOperationException("Supplier with code '" + request.getCode() + "' already exists");
        }

        supplier.setCode(request.getCode().toUpperCase().trim());
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setGstin(request.getGstin());
        supplier.setActive(request.isActive());

        Supplier updated = supplierRepository.save(supplier);
        auditService.record("Supplier", updated.getCode(), "UPDATE", "Updated supplier: " + updated.getName());

        return mapToDto(updated);
    }

    @Transactional
    public SupplierDto toggleSupplierActive(Long id) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        supplier.setActive(!supplier.isActive());
        Supplier updated = supplierRepository.save(supplier);

        auditService.record("Supplier", updated.getCode(), "TOGGLE_ACTIVE", "Active status changed to " + updated.isActive());
        return mapToDto(updated);
    }

    public SupplierDto mapToDto(Supplier supplier) {
        SupplierDto dto = new SupplierDto();
        dto.setId(supplier.getId());
        dto.setCode(supplier.getCode());
        dto.setName(supplier.getName());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setEmail(supplier.getEmail());
        dto.setPhone(supplier.getPhone());
        dto.setAddress(supplier.getAddress());
        dto.setCity(supplier.getCity());
        dto.setGstin(supplier.getGstin());
        dto.setActive(supplier.isActive());
        dto.setCreatedAt(supplier.getCreatedAt());

        int poCount = purchaseOrderRepository.findBySupplierIdOrderByOrderDateDesc(supplier.getId()).size();
        dto.setTotalOrdersCount(poCount);

        return dto;
    }
}

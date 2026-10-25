package com.retailnexus.dto;

import java.math.BigDecimal;

public class WarehouseDto {
    private Long id;
    private String code;
    private String name;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String managerName;
    private String contactEmail;
    private String contactPhone;
    private boolean active;
    private int totalProductsCount;
    private int totalUnits;
    private BigDecimal totalValuation;

    public WarehouseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public int getTotalProductsCount() { return totalProductsCount; }
    public void setTotalProductsCount(int totalProductsCount) { this.totalProductsCount = totalProductsCount; }

    public int getTotalUnits() { return totalUnits; }
    public void setTotalUnits(int totalUnits) { this.totalUnits = totalUnits; }

    public BigDecimal getTotalValuation() { return totalValuation; }
    public void setTotalValuation(BigDecimal totalValuation) { this.totalValuation = totalValuation; }
}

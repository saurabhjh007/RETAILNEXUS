package com.retailnexus.config;

import com.retailnexus.entity.*;
import com.retailnexus.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;

    public DataInitializer(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           ProductRepository productRepository,
                           WarehouseRepository warehouseRepository,
                           InventoryRepository inventoryRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("Initializing security roles and administrative users...");

        Role adminRole = getOrCreateRole("ROLE_ADMIN", "Full system administrator");
        Role managerRole = getOrCreateRole("ROLE_INVENTORY_MANAGER", "Inventory & Warehouse Manager");
        Role staffRole = getOrCreateRole("ROLE_WAREHOUSE_STAFF", "Warehouse Operations Staff");
        Role viewerRole = getOrCreateRole("ROLE_VIEWER", "Read-only Auditor");

        ensureUser("admin", "admin123", "Saurabh Jha (Administrator)", "admin@retailnexus.in", "+91 98201 12345", new HashSet<>(Set.of(adminRole, managerRole)));
        ensureUser("manager", "manager123", "Priya Sharma (Inventory Manager)", "manager@retailnexus.in", "+91 98111 23456", new HashSet<>(Set.of(managerRole)));
        ensureUser("staff", "staff123", "Rahul Verma (Warehouse Supervisor)", "staff@retailnexus.in", "+91 98333 34567", new HashSet<>(Set.of(staffRole)));
        ensureUser("viewer", "viewer123", "Ananya Patel (Operations Auditor)", "viewer@retailnexus.in", "+91 98444 45678", new HashSet<>(Set.of(viewerRole)));

        logger.info("Security credentials and roles verified successfully.");
    }

    private Role getOrCreateRole(String name, String description) {
        return roleRepository.findByName(name).orElseGet(() -> roleRepository.save(new Role(name, description)));
    }

    private void ensureUser(String username, String rawPassword, String fullName, String email, String phone, Set<Role> roles) {
        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRoles(roles);
            user.setActive(true);
            userRepository.save(user);
        } else {
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setFullName(fullName);
            user.setEmail(email);
            user.setPhone(phone);
            user.setActive(true);
            user.setRoles(roles);
            userRepository.save(user);
        }
    }
}

-- RetailNexus Seed Data Migration V2
-- Deterministic, Realistic Indian Retail Sample Data

-- 1. Insert Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'Full system administration, settings, and user access control'),
(2, 'ROLE_INVENTORY_MANAGER', 'Warehouse inventory, procurement, stock transfers, and reports'),
(3, 'ROLE_WAREHOUSE_STAFF', 'Stock receiving, order fulfillment, and physical adjustments'),
(4, 'ROLE_VIEWER', 'Read-only access to inventory metrics and reports')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 2. Insert Users (Password: admin123, manager123, staff123, viewer123)
-- BCrypt hashes generated using standard cost factor 10
INSERT INTO users (id, username, password, full_name, email, phone, active) VALUES
(1, 'admin', '$2a$10$e8w.p49wQyF0mG.5iYfX4eqD7n1/jCq0GjB3CgH8L4K5Z6Y7X8W9a', 'Saurabh Jha (Administrator)', 'admin@retailnexus.in', '+91 98201 12345', TRUE),
(2, 'manager', '$2a$10$k8w.p49wQyF0mG.5iYfX4eqD7n1/jCq0GjB3CgH8L4K5Z6Y7X8W9b', 'Priya Sharma (Inventory Manager)', 'manager@retailnexus.in', '+91 98111 23456', TRUE),
(3, 'staff', '$2a$10$m8w.p49wQyF0mG.5iYfX4eqD7n1/jCq0GjB3CgH8L4K5Z6Y7X8W9c', 'Rahul Verma (Warehouse Supervisor)', 'staff@retailnexus.in', '+91 98333 34567', TRUE),
(4, 'viewer', '$2a$10$n8w.p49wQyF0mG.5iYfX4eqD7n1/jCq0GjB3CgH8L4K5Z6Y7X8W9d', 'Ananya Patel (Operations Auditor)', 'viewer@retailnexus.in', '+91 98444 45678', TRUE)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- 3. Insert User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(1, 2),
(2, 2),
(3, 3),
(4, 4)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- 4. Insert Categories
INSERT INTO categories (id, name, code, description) VALUES
(1, 'Packaged Foods & Groceries', 'CAT-FOOD', 'Staples, packaged snacks, edible oils, spices, and breakfast cereals'),
(2, 'Electronics & Accessories', 'CAT-ELEC', 'Audio gear, charging accessories, power banks, and computer peripherals'),
(3, 'Household & Cleaning', 'CAT-HOU', 'Laundry detergents, surface cleaners, dishwash liquids, and paper products'),
(4, 'Personal Care & Wellness', 'CAT-PER', 'Soaps, haircare, oral hygiene, antiseptics, and health supplements'),
(5, 'Beverages & Refreshments', 'CAT-BEV', 'Premium teas, roasted coffees, fruit juices, and malt health drinks')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 5. Insert Warehouses (Major Indian Logistics Hubs)
INSERT INTO warehouses (id, code, name, address, city, state, postal_code, manager_name, contact_email, contact_phone, active) VALUES
(1, 'WH-MUM-01', 'Mumbai Western Hub', 'Bldg 4, Indian Logistics Park, Mankoli Naka, Bhiwandi', 'Mumbai', 'Maharashtra', '421302', 'Vikram Deshmukh', 'mumbai.hub@retailnexus.in', '+91 22 2847 1100', TRUE),
(2, 'WH-DEL-01', 'Delhi NCR Distribution Center', 'Plot 88, Sector 8, IMT Manesar, Gurugram', 'Delhi NCR', 'Haryana', '122051', 'Rajesh Kulkarni', 'delhi.dc@retailnexus.in', '+91 124 492 8800', TRUE),
(3, 'WH-BLR-01', 'Bengaluru South Fulfillment Center', 'Survey 42/1, KIADB Industrial Area, Hoodi, Whitefield', 'Bengaluru', 'Karnataka', '560066', 'Deepak Gowda', 'blr.fc@retailnexus.in', '+91 80 6712 5500', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 6. Insert Suppliers
INSERT INTO suppliers (id, code, name, contact_person, email, phone, address, city, gstin, active) VALUES
(1, 'SUP-TATA-01', 'Tata Consumer Products Supply Ltd', 'Arjun Saxena', 'orders.north@tataconsumer.com', '+91 11 4150 7800', 'Barakhamba Road, Connaught Place', 'New Delhi', '07AAACT2800Q1Z8', TRUE),
(2, 'SUP-HUL-02', 'Hindustan Unilever Distribution India', 'Meera Singhania', 'supplychain@hul.com', '+91 22 3983 0000', 'BD Sawant Marg, Chakala, Andheri East', 'Mumbai', '27AAACH2702H1Z1', TRUE),
(3, 'SUP-BOAT-03', 'Imagine Marketing (boAt) Logistics', 'Karan Mehta', 'b2b.fulfilment@boat-lifestyle.com', '+91 11 4055 9900', 'Okhla Industrial Area Phase III', 'New Delhi', '07AABCI4890K1ZW', TRUE),
(4, 'SUP-AWL-04', 'Adani Wilmar Edible Commodities', 'Nilesh Dave', 'distributors@adaniwilmar.in', '+91 79 2656 5555', 'Fortune House, Navrangpura', 'Ahmedabad', '24AAACA3421C1Z6', TRUE),
(5, 'SUP-DAB-05', 'Dabur India Wholesale Supply', 'Suresh Chandra', 'corporate.sales@dabur.com', '+91 120 398 2000', 'Kaushambi, Sahibabad', 'Ghaziabad', '09AAACD0125H1ZT', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 7. Insert 26 Realistic Retail Products
INSERT INTO products (id, sku, name, description, category_id, cost_price, selling_price, reorder_threshold, unit, barcode, active) VALUES
(1, 'SKU-FOOD-001', 'Tata Salt Vacuum Evaporated 1kg', 'Iodized crystal salt with essential minerals', 1, 21.00, 28.00, 25, 'Pack', '8901030010012', TRUE),
(2, 'SKU-FOOD-002', 'Fortune Sunlite Refined Sunflower Oil 1L', 'Enriched with Vitamin A and D for healthy cooking', 1, 108.00, 145.00, 20, 'Bottle', '8906007280015', TRUE),
(3, 'SKU-FOOD-003', 'Maggi 2-Minute Masala Noodles 280g', 'Classic Indian spiced instant wheat noodles 4-pack', 1, 42.00, 56.00, 30, 'Pack', '8901058852304', TRUE),
(4, 'SKU-FOOD-004', 'Aashirvaad Shudh Chakki Atta 5kg', '100% whole wheat flour with dietary fiber', 1, 195.00, 255.00, 15, 'Bag', '8901725181222', TRUE),
(5, 'SKU-FOOD-005', 'Haldirams Nagpur Aloo Bhujia 400g', 'Crispy spiced potato and chickpea flour savory snack', 1, 88.00, 115.00, 20, 'Pack', '8904004401123', TRUE),
(6, 'SKU-FOOD-006', 'Dabur 100% Pure Honey Squeezy 500g', 'Natural multiflora honey tested for purity', 1, 160.00, 220.00, 15, 'Bottle', '8901207010452', TRUE),
(7, 'SKU-FOOD-007', 'Amul Pure Cow Ghee Tin 1L', 'Traditional golden aromatic clarified butter', 1, 480.00, 610.00, 12, 'Tin', '8901262010101', TRUE),

(8, 'SKU-ELEC-001', 'boAt Bassheads 100 In-Ear Wired Earphones', 'Hawke-inspired wired earphones with 10mm dynamic drivers and mic', 2, 280.00, 399.00, 15, 'Unit', '8906080340112', TRUE),
(9, 'SKU-ELEC-002', 'boAt Rockerz 255 Pro+ Wireless Neckband', 'Fast charge Bluetooth neckband with 40h playtime and ASAP charge', 2, 850.00, 1299.00, 10, 'Unit', '8906080340229', TRUE),
(10, 'SKU-ELEC-003', 'Portronics Konnect CL Type-C to Lightning Cable 1.2m', 'Fast charging 20W PD braided data transfer cable', 2, 190.00, 349.00, 20, 'Unit', '8904144410123', TRUE),
(11, 'SKU-ELEC-004', 'Mi 10000mAh Power Bank 3i Dual Output', '18W fast charging portable battery pack with metallic finish', 2, 750.00, 1199.00, 8, 'Unit', '8904321200115', TRUE),
(12, 'SKU-ELEC-005', 'Logitech B100 USB Optical Wired Mouse', 'Ambidextrous office optical mouse 800 DPI', 2, 240.00, 375.00, 12, 'Unit', '5099206020110', TRUE),

(13, 'SKU-HOU-001', 'Surf Excel Easy Wash Detergent Powder 1kg', 'Advanced formula stain removal detergent powder', 3, 115.00, 148.00, 25, 'Pack', '8901030381013', TRUE),
(14, 'SKU-HOU-002', 'Vim Dishwash Gel Lemon 750ml Bottle', 'Power of 100 lemons degreasing liquid dishwash', 3, 135.00, 175.00, 20, 'Bottle', '8901030612100', TRUE),
(15, 'SKU-HOU-003', 'Lizol Disinfectant Surface Cleaner Citrus 1L', 'Triple action kills 99.9% germs floor disinfectant', 3, 155.00, 215.00, 15, 'Bottle', '8901396112015', TRUE),
(16, 'SKU-HOU-004', 'Harpic Power Plus Toilet Cleaner Original 1L', 'Thick blue liquid 10x max stain remover', 3, 142.00, 199.00, 18, 'Bottle', '8901396120119', TRUE),
(17, 'SKU-HOU-005', 'Godrej aer Pocket Bathroom Fragrance 10g', 'Slim gel air freshener card Morning Misty Meadows', 3, 42.00, 65.00, 25, 'Unit', '8901023020115', TRUE),

(18, 'SKU-PER-001', 'Dettol Antiseptic Disinfectant Liquid 550ml', 'First aid, medical, and personal hygiene antiseptic', 4, 160.00, 218.00, 20, 'Bottle', '8901396320113', TRUE),
(19, 'SKU-PER-002', 'Colgate Strong Teeth Dental Cream 200g', 'Amino Shakti formula calcium tooth paste', 4, 85.00, 120.00, 25, 'Pack', '8901314010115', TRUE),
(20, 'SKU-PER-003', 'Dove Deeply Nourishing Body Wash 250ml', 'NutriumMoisture rich hydrating bath gel', 4, 140.00, 199.00, 15, 'Bottle', '8901030710110', TRUE),
(21, 'SKU-PER-004', 'Parachute 100% Pure Coconut Hair Oil 500ml', 'Natural nourishing edible grade coconut oil', 4, 155.00, 210.00, 20, 'Bottle', '8901088010112', TRUE),
(22, 'SKU-PER-005', 'Himalaya Purifying Neem Face Wash 150ml', 'Herbal soap-free pimple control cleanser', 4, 125.00, 175.00, 15, 'Tube', '8901138810117', TRUE),

(23, 'SKU-BEV-001', 'Tata Tea Gold Assam Leaf Tea 500g', 'Gently rolled aromatic long leaf and CTC blend', 5, 230.00, 310.00, 20, 'Pack', '8901030020110', TRUE),
(24, 'SKU-BEV-002', 'Nescafe Classic Instant Coffee Glass Jar 100g', 'Rich dark roasted Arabica and Robusta granule coffee', 5, 215.00, 290.00, 15, 'Jar', '8901058860118', TRUE),
(25, 'SKU-BEV-003', 'Real Fruit Power Mixed Fruit Juice 1L', 'Preservative free multi-fruit nectar drink', 5, 92.00, 130.00, 20, 'Tetra', '8901207040114', TRUE),
(26, 'SKU-BEV-004', 'Red Label Natural Care Cardamom Ginger Tea 500g', 'Ayurvedic 5 herbs immunity boosting tea blend', 5, 245.00, 340.00, 15, 'Pack', '8901030030119', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 8. Insert Inventories across Warehouses (Normal, Low Stock, and Out of Stock)
INSERT INTO inventories (product_id, warehouse_id, on_hand_quantity, reserved_quantity, version) VALUES
-- Mumbai Hub (WH-MUM-01)
(1, 1, 140, 15, 0), -- Tata Salt: Available 125 (Normal)
(2, 1, 85, 10, 0),  -- Fortune Oil: Available 75 (Normal)
(3, 1, 28, 5, 0),   -- Maggi: Available 23 <= Threshold 30 (LOW STOCK ALERT!)
(4, 1, 45, 0, 0),   -- Aashirvaad Atta: Available 45 (Normal)
(5, 1, 12, 0, 0),   -- Haldirams: Available 12 <= Threshold 20 (LOW STOCK ALERT!)
(6, 1, 35, 4, 0),   -- Dabur Honey: Available 31 (Normal)
(7, 1, 24, 2, 0),   -- Amul Ghee: Available 22 (Normal)
(8, 1, 60, 8, 0),   -- boAt Bassheads: Available 52 (Normal)
(9, 1, 5, 0, 0),    -- boAt Rockerz: Available 5 <= Threshold 10 (LOW STOCK ALERT!)
(10, 1, 50, 0, 0),  -- Portronics Cable: Available 50 (Normal)
(11, 1, 0, 0, 0),   -- Mi Power Bank: Available 0 (OUT OF STOCK ALERT!)
(12, 1, 30, 2, 0),  -- Logitech Mouse: Available 28 (Normal)
(13, 1, 95, 12, 0), -- Surf Excel: Available 83 (Normal)
(14, 1, 70, 0, 0),  -- Vim Gel: Available 70 (Normal)
(15, 1, 55, 6, 0),  -- Lizol: Available 49 (Normal)
(16, 1, 40, 0, 0),  -- Harpic: Available 40 (Normal)
(17, 1, 18, 0, 0),  -- Godrej Aer: Available 18 <= Threshold 25 (LOW STOCK ALERT!)
(18, 1, 65, 5, 0),  -- Dettol: Available 60 (Normal)
(19, 1, 110, 15, 0),-- Colgate: Available 95 (Normal)
(20, 1, 45, 0, 0),  -- Dove: Available 45 (Normal)
(21, 1, 50, 0, 0),  -- Parachute: Available 50 (Normal)
(22, 1, 38, 3, 0),  -- Himalaya Face Wash: Available 35 (Normal)
(23, 1, 80, 10, 0), -- Tata Tea Gold: Available 70 (Normal)
(24, 1, 42, 0, 0),  -- Nescafe: Available 42 (Normal)
(25, 1, 65, 0, 0),  -- Real Juice: Available 65 (Normal)
(26, 1, 55, 5, 0),  -- Red Label: Available 50 (Normal)

-- Delhi NCR DC (WH-DEL-01)
(1, 2, 120, 10, 0),
(2, 2, 60, 5, 0),
(3, 2, 15, 0, 0),   -- Maggi: 15 <= 30 (LOW STOCK)
(4, 2, 35, 0, 0),
(8, 2, 45, 5, 0),
(9, 2, 20, 2, 0),
(11, 2, 15, 0, 0),
(13, 2, 80, 8, 0),
(15, 2, 40, 0, 0),
(18, 2, 50, 4, 0),
(19, 2, 85, 10, 0),
(23, 2, 70, 0, 0),
(24, 2, 30, 2, 0),

-- Bengaluru FC (WH-BLR-01)
(1, 3, 90, 0, 0),
(2, 3, 50, 0, 0),
(6, 3, 25, 2, 0),
(8, 3, 80, 12, 0),
(9, 3, 35, 4, 0),
(10, 3, 40, 0, 0),
(11, 3, 18, 0, 0),
(12, 3, 25, 0, 0),
(13, 3, 60, 0, 0),
(19, 3, 95, 0, 0),
(20, 3, 30, 0, 0),
(23, 3, 65, 5, 0)
ON DUPLICATE KEY UPDATE on_hand_quantity = VALUES(on_hand_quantity);

-- 9. Insert Sample Purchase Orders
INSERT INTO purchase_orders (id, order_number, supplier_id, destination_warehouse_id, order_date, expected_delivery_date, status, subtotal, tax_amount, total_amount, notes, created_by) VALUES
(1, 'PO-2026-0001', 1, 1, '2026-10-10', '2026-10-18', 'FULLY_RECEIVED', 44000.00, 2200.00, 46200.00, 'Festive grocery replenishment batch 1', 'Priya Sharma'),
(2, 'PO-2026-0002', 3, 1, '2026-10-15', '2026-10-25', 'PARTIALLY_RECEIVED', 85000.00, 15300.00, 100300.00, 'Audio accessory procurement for Q3', 'Priya Sharma'),
(3, 'PO-2026-0003', 2, 2, '2026-10-20', '2026-10-28', 'APPROVED', 62500.00, 11250.00, 73750.00, 'Bulk detergent and hygiene supplies for Delhi hub', 'Saurabh Jha'),
(4, 'PO-2026-0004', 4, 3, '2026-10-24', '2026-11-02', 'SUBMITTED', 54000.00, 2700.00, 56700.00, 'Edible oils restock for southern distribution', 'Priya Sharma')
ON DUPLICATE KEY UPDATE order_number = VALUES(order_number);

-- PO Items
INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity_ordered, quantity_received, unit_cost, total_cost) VALUES
(1, 1, 1, 1000, 1000, 21.00, 21000.00),
(2, 1, 23, 100, 100, 230.00, 23000.00),
(3, 2, 8, 200, 100, 280.00, 56000.00),
(4, 2, 9, 30, 0, 850.00, 25500.00),
(5, 3, 13, 300, 0, 115.00, 34500.00),
(6, 3, 18, 175, 0, 160.00, 28000.00),
(7, 4, 2, 500, 0, 108.00, 54000.00)
ON DUPLICATE KEY UPDATE quantity_ordered = VALUES(quantity_ordered);

-- 10. Insert Sample Customer Orders
INSERT INTO customer_orders (id, order_number, customer_name, customer_email, customer_phone, shipping_address, warehouse_id, order_date, status, subtotal, tax_amount, total_amount, notes) VALUES
(1, 'ORD-2026-0001', 'Reliance Smart Point BKC', 'procurement@reliancesmart.com', '+91 98200 44551', 'Plot C-30, G Block BKC, Bandra East, Mumbai', 1, '2026-10-22 10:30:00', 'DELIVERED', 18450.00, 922.50, 19372.50, 'Standard commercial dock delivery'),
(2, 'ORD-2026-0002', 'Vijay Electronics Express', 'orders@vijaysales.com', '+91 98199 88776', 'MG Road, Fort, Mumbai', 1, '2026-10-24 14:15:00', 'DISPATCHED', 16580.00, 2984.40, 19564.40, 'Urgent dispatched via BlueDart express air cargo'),
(3, 'ORD-2026-0003', 'Modern Bazaar Supermarket', 'store.lead@modernbazaar.in', '+91 98110 99887', 'Select Citywalk Mall, Saket, New Delhi', 2, '2026-10-25 09:45:00', 'PROCESSING', 12350.00, 1111.50, 13461.50, 'Packing in progress in Section B-14'),
(4, 'ORD-2026-0004', 'More Retail Store Indiranagar', 'ops@moreretail.in', '+91 98450 11223', '100 Feet Road, Indiranagar, Bengaluru', 3, '2026-10-25 11:20:00', 'CONFIRMED', 8920.00, 713.60, 9633.60, 'Stock reserved, awaiting picking wave')
ON DUPLICATE KEY UPDATE order_number = VALUES(order_number);

-- Customer Order Line Items
INSERT INTO customer_order_items (id, customer_order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 50, 28.00, 1400.00),
(2, 1, 2, 40, 145.00, 5800.00),
(3, 1, 13, 40, 148.00, 5920.00),
(4, 1, 23, 15, 310.00, 4650.00),
(5, 2, 8, 20, 399.00, 7980.00),
(6, 2, 9, 6, 1299.00, 7794.00),
(7, 3, 3, 50, 56.00, 2800.00),
(8, 3, 18, 25, 218.00, 5450.00),
(9, 4, 8, 12, 399.00, 4788.00),
(10, 4, 19, 30, 120.00, 3600.00)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

-- 11. Insert Inventory Movements
INSERT INTO inventory_movements (product_id, source_warehouse_id, destination_warehouse_id, movement_type, quantity, reference_id, notes, performed_by, created_at) VALUES
(1, NULL, 1, 'PURCHASE_RECEIPT', 1000, 'PO-2026-0001', 'Received full delivery batch from Tata Consumer', 'Rahul Verma', '2026-10-18 11:30:00'),
(23, NULL, 1, 'PURCHASE_RECEIPT', 100, 'PO-2026-0001', 'Received full delivery batch from Tata Consumer', 'Rahul Verma', '2026-10-18 11:45:00'),
(8, NULL, 1, 'PURCHASE_RECEIPT', 100, 'PO-2026-0002', 'Partial receipt: 100 of 200 units received in QC passed state', 'Rahul Verma', '2026-10-22 15:10:00'),
(1, 1, 3, 'STOCK_TRANSFER', 50, 'TRF-2026-001', 'Inter-hub rebalancing Mumbai to Bengaluru FC', 'Priya Sharma', '2026-10-23 14:00:00'),
(8, 1, NULL, 'ORDER_DISPATCH', 20, 'ORD-2026-0002', 'Dispatched to Vijay Electronics Express', 'Rahul Verma', '2026-10-24 16:20:00'),
(9, 1, NULL, 'ORDER_DISPATCH', 6, 'ORD-2026-0002', 'Dispatched to Vijay Electronics Express', 'Rahul Verma', '2026-10-24 16:20:00'),
(3, 1, NULL, 'MANUAL_ADJUSTMENT', -2, 'ADJ-2026-10', 'Cycle count discrepancy adjustment: damaged during unloading', 'Rahul Verma', '2026-10-25 10:15:00');

-- 12. Insert Active Alerts
INSERT INTO alerts (id, alert_type, severity, title, message, product_id, warehouse_id, acknowledged, created_at) VALUES
(1, 'OUT_OF_STOCK', 'CRITICAL', 'Out of Stock: Mi 10000mAh Power Bank 3i', 'Product SKU-ELEC-004 has 0 available units at Mumbai Western Hub.', 11, 1, FALSE, '2026-10-25 08:00:00'),
(2, 'LOW_STOCK', 'WARNING', 'Low Stock Alert: boAt Rockerz 255 Pro+', 'Current stock is 5 units, strictly below configured reorder threshold of 10 at Mumbai Western Hub.', 9, 1, FALSE, '2026-10-25 08:30:00'),
(3, 'LOW_STOCK', 'WARNING', 'Low Stock Alert: Maggi 2-Minute Masala Noodles', 'Current stock is 23 units, below reorder threshold of 30 at Mumbai Western Hub.', 3, 1, FALSE, '2026-10-25 09:00:00'),
(4, 'LOW_STOCK', 'WARNING', 'Low Stock Alert: Haldirams Aloo Bhujia 400g', 'Current stock is 12 units, below reorder threshold of 20 at Mumbai Western Hub.', 5, 1, FALSE, '2026-10-25 09:15:00')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- 13. Insert Agile Sprints (All 15 Sprints with Realistic Goals and Story Points)
INSERT INTO agile_sprints (sprint_number, name, goal, status, story_points_planned, story_points_completed, start_date, end_date) VALUES
(1, 'Sprint 1: Project Initiation & Requirements', 'Establish vision, stakeholder matrix, product backlog, and Agile governance model.', 'COMPLETED', 21, 21, '2026-06-01', '2026-06-12'),
(2, 'Sprint 2: Architecture & Foundation', 'Set up Spring Boot 3, MySQL schema, Vite/React project, and core UI design system.', 'COMPLETED', 34, 34, '2026-06-15', '2026-06-26'),
(3, 'Sprint 3: Identity & Access Management', 'Implement Spring Security, JWT authentication, user management, and RBAC roles.', 'COMPLETED', 26, 26, '2026-06-29', '2026-07-10'),
(4, 'Sprint 4: Product Catalog Core', 'Deliver complete Product entity CRUD, validation rules, category links, and SKU rules.', 'COMPLETED', 29, 29, '2026-07-13', '2026-07-24'),
(5, 'Sprint 5: Catalog Search & Attributes', 'Build fast multi-parameter search, category filters, price rules, and safe deactivation.', 'COMPLETED', 21, 21, '2026-07-27', '2026-08-07'),
(6, 'Sprint 6: Multi-Warehouse Management', 'Implement Warehouse entities, regional facilities, hub details, and contact tracking.', 'COMPLETED', 24, 24, '2026-08-10', '2026-08-21'),
(7, 'Sprint 7: Stock Tracking & Adjustments', 'Implement per-warehouse inventory, safe adjustments, and low-stock threshold logic.', 'COMPLETED', 34, 34, '2026-08-24', '2026-09-04'),
(8, 'Sprint 8: Atomic Stock Transfers & Ledger', 'Build atomic two-phase stock transfer workflow and immutable movement audit ledger.', 'COMPLETED', 34, 34, '2026-09-07', '2026-09-18'),
(9, 'Sprint 9: Supplier Directory & Management', 'Implement Supplier master data, GSTIN validation, vendor contacts, and performance history.', 'COMPLETED', 21, 21, '2026-09-21', '2026-10-02'),
(10, 'Sprint 10: Procurement & Purchase Orders', 'Build purchase order creation, line items calculation, approval flow, and PO lifecycle.', 'COMPLETED', 34, 34, '2026-10-05', '2026-10-16'),
(11, 'Sprint 11: Goods Receiving & Reconciliation', 'Implement atomic stock receiving, partial receipts, ledger logging, and over-receipt prevention.', 'COMPLETED', 29, 29, '2026-10-19', '2026-10-30'),
(12, 'Sprint 12: Customer Orders & Reservation', 'Deliver customer order creation, stock availability check, and atomic stock reservation.', 'COMPLETED', 34, 34, '2026-11-02', '2026-11-13'),
(13, 'Sprint 13: Order Fulfillment & Dashboard', 'Implement pick/pack/dispatch workflow, reservation deduction, and live executive dashboard.', 'COMPLETED', 34, 34, '2026-11-16', '2026-11-27'),
(14, 'Sprint 14: Analytics, CSV Exports & Testing', 'Implement valuation reports, CSV export streams, automated test suites, and audit logs.', 'IN_PROGRESS', 29, 24, '2026-11-30', '2026-12-11'),
(15, 'Sprint 15: UAT, Hardening & Capstone Release', 'Complete end-to-end UAT, final demonstration, release documentation, and project retrospective.', 'PLANNED', 21, 0, '2026-12-14', '2026-12-25')
ON DUPLICATE KEY UPDATE name = VALUES(name);

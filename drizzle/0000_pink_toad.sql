CREATE TABLE `categories` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`image_url` text,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`discount_type` varchar(30) NOT NULL,
	`discount_value` decimal(10,2) NOT NULL,
	`min_order_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`expiry_date` varchar(20) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `employee_shifts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`date` varchar(20) NOT NULL,
	`start_time` varchar(10) NOT NULL,
	`end_time` varchar(10) NOT NULL,
	`role` varchar(30) NOT NULL,
	`status` varchar(30) NOT NULL DEFAULT 'scheduled',
	CONSTRAINT `employee_shifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`description` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`date` varchar(20) NOT NULL,
	`created_by` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unit` varchar(30) NOT NULL,
	`reorder_level` decimal(10,2) NOT NULL,
	`cost_per_unit` decimal(10,2) NOT NULL,
	`supplier_id` int,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`category_id` int,
	`name` varchar(150) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`is_available` boolean NOT NULL DEFAULT true,
	`is_vegetarian` boolean NOT NULL DEFAULT false,
	`is_vegan` boolean NOT NULL DEFAULT false,
	`is_gluten_free` boolean NOT NULL DEFAULT false,
	`image_url` text,
	`spice_level` int NOT NULL DEFAULT 0,
	`preparation_time` int NOT NULL DEFAULT 15,
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order_id` int,
	`menu_item_id` int,
	`quantity` int NOT NULL,
	`unit_price` decimal(10,2) NOT NULL,
	`notes` text,
	`status` varchar(30) NOT NULL DEFAULT 'pending',
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`customer_id` int,
	`table_id` int,
	`order_type` varchar(30) NOT NULL DEFAULT 'dine-in',
	`status` varchar(30) NOT NULL DEFAULT 'pending',
	`total_amount` decimal(10,2) NOT NULL,
	`gst_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`final_amount` decimal(10,2) NOT NULL,
	`coupon_code` varchar(50),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order_id` int,
	`amount` decimal(10,2) NOT NULL,
	`payment_method` varchar(30) NOT NULL,
	`status` varchar(30) NOT NULL DEFAULT 'completed',
	`transaction_id` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`supplier_id` int,
	`item_name` varchar(150) NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`cost` decimal(10,2) NOT NULL,
	`status` varchar(30) NOT NULL DEFAULT 'ordered',
	`ordered_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchase_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`customer_id` int,
	`customer_name` varchar(100) NOT NULL,
	`customer_phone` varchar(20) NOT NULL,
	`table_id` int,
	`reservation_time` timestamp NOT NULL,
	`number_of_guests` int NOT NULL,
	`status` varchar(30) NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_tables` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`table_number` varchar(10) NOT NULL,
	`capacity` int NOT NULL,
	`status` varchar(30) NOT NULL DEFAULT 'available',
	`qr_code_url` text,
	CONSTRAINT `restaurant_tables_id` PRIMARY KEY(`id`),
	CONSTRAINT `restaurant_tables_table_number_unique` UNIQUE(`table_number`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`menu_item_id` int,
	`customer_name` varchar(100) NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`contact_person` varchar(100),
	`email` varchar(150),
	`phone` varchar(20),
	`address` text,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(150) NOT NULL,
	`password` varchar(255) NOT NULL DEFAULT '',
	`phone` varchar(20),
	`role` varchar(30) NOT NULL DEFAULT 'customer',
	`pin` varchar(6),
	`loyalty_points` int NOT NULL DEFAULT 0,
	`is_email_verified` boolean NOT NULL DEFAULT false,
	`email_verification_token` varchar(255),
	`email_verified_at` timestamp,
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `employee_shifts` ADD CONSTRAINT `employee_shifts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_supplier_id_suppliers_id_fk` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_menu_item_id_menu_items_id_fk` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_users_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_table_id_restaurant_tables_id_fk` FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_supplier_id_suppliers_id_fk` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_customer_id_users_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_table_id_restaurant_tables_id_fk` FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_menu_item_id_menu_items_id_fk` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE cascade ON UPDATE no action;
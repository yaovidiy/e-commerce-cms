CREATE TABLE `address` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`company` text,
	`address_1` text NOT NULL,
	`address_2` text,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`postal_code` text NOT NULL,
	`country` text DEFAULT 'Ukraine' NOT NULL,
	`phone` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `banner` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`image_id` text,
	`image_url` text,
	`link` text,
	`link_text` text,
	`position` text DEFAULT 'home_hero' NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`starts_at` integer,
	`ends_at` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`image_id`) REFERENCES `asset`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cart` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text,
	`user_id` text,
	`items` text NOT NULL,
	`subtotal` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `checkbox_receipt` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`payment_id` text,
	`receipt_id` text,
	`fiscal_code` text,
	`receipt_url` text,
	`status` text DEFAULT 'created' NOT NULL,
	`checkbox_data` text,
	`shift_id` text,
	`cash_register_id` text,
	`error_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payment_id`) REFERENCES `payment`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `checkbox_shift` (
	`id` text PRIMARY KEY NOT NULL,
	`shift_id` text NOT NULL,
	`cash_register_id` text NOT NULL,
	`status` text DEFAULT 'opened' NOT NULL,
	`opened_by` text NOT NULL,
	`closed_by` text,
	`balance` text,
	`opened_at` integer NOT NULL,
	`closed_at` integer,
	FOREIGN KEY (`opened_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`closed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `discount` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`type` text DEFAULT 'percentage' NOT NULL,
	`value` integer NOT NULL,
	`min_order_amount` integer,
	`max_uses_total` integer,
	`max_uses_per_customer` integer DEFAULT 1,
	`current_uses` integer DEFAULT 0 NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`applicable_products` text,
	`applicable_categories` text,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `email_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`from_email` text NOT NULL,
	`from_name` text NOT NULL,
	`reply_to_email` text,
	`enable_order_confirmation` integer DEFAULT true NOT NULL,
	`enable_order_shipped` integer DEFAULT true NOT NULL,
	`enable_order_delivered` integer DEFAULT true NOT NULL,
	`enable_order_cancelled` integer DEFAULT true NOT NULL,
	`enable_password_reset` integer DEFAULT true NOT NULL,
	`enable_welcome` integer DEFAULT true NOT NULL,
	`provider` text DEFAULT 'resend',
	`api_key` text,
	`smtp_host` text,
	`smtp_port` integer,
	`smtp_username` text,
	`smtp_password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`user_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`items` text NOT NULL,
	`shipping_address` text NOT NULL,
	`billing_address` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text,
	`customer_first_name` text NOT NULL,
	`customer_last_name` text NOT NULL,
	`subtotal` integer NOT NULL,
	`shipping_cost` integer DEFAULT 0 NOT NULL,
	`tax` integer DEFAULT 0 NOT NULL,
	`discount` integer DEFAULT 0 NOT NULL,
	`total` integer NOT NULL,
	`payment_method` text,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`shipping_method` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`shipped_at` integer,
	`delivered_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_item` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_name` text NOT NULL,
	`product_slug` text NOT NULL,
	`product_image` text,
	`price` integer NOT NULL,
	`quantity` integer NOT NULL,
	`subtotal` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `page` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text,
	`template` text DEFAULT 'default' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`published_at` integer
);
--> statement-breakpoint
CREATE TABLE `payment` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`provider` text DEFAULT 'cod' NOT NULL,
	`transaction_id` text,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'UAH' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`liqpay_data` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shipping_rate` (
	`id` text PRIMARY KEY NOT NULL,
	`zone_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price` integer NOT NULL,
	`min_order_amount` integer,
	`max_order_amount` integer,
	`estimated_days` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`zone_id`) REFERENCES `shipping_zone`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shipping_zone` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`countries` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_setting` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`type` text DEFAULT 'string' NOT NULL,
	`category` text DEFAULT 'general' NOT NULL,
	`label` text,
	`description` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wishlist` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`items` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `user` ADD `first_name` text;--> statement-breakpoint
ALTER TABLE `user` ADD `last_name` text;--> statement-breakpoint
ALTER TABLE `user` ADD `phone` text;--> statement-breakpoint
ALTER TABLE `user` ADD `marketing_opt_in` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `user` ADD `last_login_at` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `discount_code_unique` ON `discount` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `order_order_number_unique` ON `order` (`order_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `page_slug_unique` ON `page` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `wishlist_user_id_unique` ON `wishlist` (`user_id`);
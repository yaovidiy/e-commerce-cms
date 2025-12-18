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
CREATE TABLE `asset` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`original_filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`url` text NOT NULL,
	`thumbnail_url` text,
	`uploaded_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`uploaded_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `background_task` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`total_items` integer,
	`processed_items` integer DEFAULT 0,
	`error` text,
	`error_code` text,
	`result` text DEFAULT '{}',
	`metadata` text DEFAULT '{}',
	`created_at` integer NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`updated_at` integer NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
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
CREATE TABLE `blog` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`slug` text NOT NULL,
	`author_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `brand` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`logo` text,
	`is_visible` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
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
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`parent_id` text,
	`image` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `checkbox_receipt` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text,
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
CREATE TABLE `contact_phone` (
	`id` text PRIMARY KEY NOT NULL,
	`phone_number` text NOT NULL,
	`label` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
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
CREATE TABLE `mega_menu` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category_id` text,
	`categories` text DEFAULT '[]' NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `navigation_menu` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location` text DEFAULT 'header' NOT NULL,
	`type` text DEFAULT 'single' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `navigation_menu_item` (
	`id` text PRIMARY KEY NOT NULL,
	`menu_id` text NOT NULL,
	`label` text NOT NULL,
	`url` text NOT NULL,
	`parent_id` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`open_in_new_tab` integer DEFAULT false NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`icon` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`menu_id`) REFERENCES `navigation_menu`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notification_log` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`order_id` text,
	`user_id` text,
	`channel` text NOT NULL,
	`recipient` text NOT NULL,
	`subject` text,
	`content` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`error` text,
	`provider_id` text,
	`created_at` integer NOT NULL,
	`sent_at` integer,
	`failed_at` integer,
	FOREIGN KEY (`template_id`) REFERENCES `notification_template`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notification_template` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`channel` text NOT NULL,
	`event_type` text NOT NULL,
	`subject` text,
	`content` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`variables` text DEFAULT '[]' NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notification_variable` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`label` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`data_type` text NOT NULL,
	`example_value` text,
	`created_at` integer NOT NULL
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
CREATE TABLE `order_item_template` (
	`id` text PRIMARY KEY NOT NULL,
	`notification_template_id` text NOT NULL,
	`item_template` text NOT NULL,
	`item_separator` text DEFAULT '
' NOT NULL,
	`wrapper_template` text,
	`use_html_formatting` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`notification_template_id`) REFERENCES `notification_template`(`id`) ON UPDATE no action ON DELETE cascade
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
CREATE TABLE `product` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`slug` text NOT NULL,
	`price` integer NOT NULL,
	`compare_at_price` integer,
	`sku` text,
	`barcode` text,
	`quantity` integer DEFAULT 0 NOT NULL,
	`track_inventory` integer DEFAULT true NOT NULL,
	`low_stock_threshold` integer DEFAULT 10,
	`allow_backorders` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`category_id` text,
	`brand_id` text,
	`images` text,
	`variants` text,
	`seo_title` text,
	`seo_description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`brand_id`) REFERENCES `brand`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
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
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`first_name` text,
	`last_name` text,
	`phone` text,
	`marketing_opt_in` integer DEFAULT false,
	`last_login_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_notification` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`type` text DEFAULT 'info' NOT NULL,
	`task_id` text,
	`is_read` integer DEFAULT false NOT NULL,
	`read_at` integer,
	`action_url` text,
	`action_label` text,
	`metadata` text DEFAULT '{}',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `background_task`(`id`) ON UPDATE no action ON DELETE cascade
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
CREATE UNIQUE INDEX `blog_slug_unique` ON `blog` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `brand_slug_unique` ON `brand` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `category_slug_unique` ON `category` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `discount_code_unique` ON `discount` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `notification_template_code_unique` ON `notification_template` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `notification_variable_key_unique` ON `notification_variable` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `order_order_number_unique` ON `order` (`order_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `page_slug_unique` ON `page` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `product_slug_unique` ON `product` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `wishlist_user_id_unique` ON `wishlist` (`user_id`);
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
CREATE TABLE `navigation_menu` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location` text DEFAULT 'header' NOT NULL,
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
CREATE UNIQUE INDEX `notification_template_code_unique` ON `notification_template` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `notification_variable_key_unique` ON `notification_variable` (`key`);
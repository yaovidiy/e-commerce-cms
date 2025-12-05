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
ALTER TABLE `navigation_menu` ADD `type` text DEFAULT 'single' NOT NULL;
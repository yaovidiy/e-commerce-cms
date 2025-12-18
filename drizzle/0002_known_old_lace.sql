CREATE TABLE `product_tier` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`min_quantity` integer NOT NULL,
	`price` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `product` ADD `price_unit` text DEFAULT 'unit' NOT NULL;--> statement-breakpoint
ALTER TABLE `product` ADD `weight` integer;--> statement-breakpoint
ALTER TABLE `product` ADD `has_multiple_prices` integer DEFAULT 0 NOT NULL;
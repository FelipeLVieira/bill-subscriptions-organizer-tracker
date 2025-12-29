CREATE TABLE `billing_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subscription_id` integer,
	`date_paid` text NOT NULL,
	`amount_paid` real NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`billing_interval` text NOT NULL,
	`next_billing_date` text NOT NULL,
	`reminder_schema` text,
	`category_group` text,
	`notes` text,
	`active` integer DEFAULT true NOT NULL
);

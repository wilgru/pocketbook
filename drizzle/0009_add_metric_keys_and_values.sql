CREATE TABLE `metric_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`type` text NOT NULL,
	`pocketbook_id` text NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`pocketbook_id`) REFERENCES `pocketbooks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `metric_values` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`key_id` text NOT NULL,
	`note_id` text NOT NULL,
	`pocketbook_id` text NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`key_id`) REFERENCES `metric_keys`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pocketbook_id`) REFERENCES `pocketbooks`(`id`) ON UPDATE no action ON DELETE cascade
);
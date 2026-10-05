ALTER TABLE `tag_groups` ADD `layout` text DEFAULT 'list' NOT NULL;--> statement-breakpoint
ALTER TABLE `tag_groups` ADD `group_by` text;--> statement-breakpoint
ALTER TABLE `tag_groups` ADD `sort_by` text DEFAULT 'created' NOT NULL;--> statement-breakpoint
ALTER TABLE `tag_groups` ADD `sort_direction` text DEFAULT 'desc' NOT NULL;
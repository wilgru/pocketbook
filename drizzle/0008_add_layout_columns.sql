ALTER TABLE `pocketbooks` ADD `notes_layout` text DEFAULT 'list' NOT NULL;--> statement-breakpoint
ALTER TABLE `pocketbooks` ADD `bookmarked_layout` text DEFAULT 'list' NOT NULL;--> statement-breakpoint
ALTER TABLE `tags` ADD `layout` text DEFAULT 'list' NOT NULL;
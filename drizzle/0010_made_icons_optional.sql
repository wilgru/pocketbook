PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pocketbooks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`icon` text,
	`colour` text NOT NULL,
	`notes_layout` text DEFAULT 'list' NOT NULL,
	`notes_sort_by` text DEFAULT 'created' NOT NULL,
	`notes_sort_direction` text DEFAULT 'desc' NOT NULL,
	`notes_group_by` text,
	`bookmarked_layout` text DEFAULT 'list' NOT NULL,
	`bookmarked_sort_by` text DEFAULT 'created' NOT NULL,
	`bookmarked_sort_direction` text DEFAULT 'desc' NOT NULL,
	`bookmarked_group_by` text,
	`user` text,
	`created` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_pocketbooks`("id", "title", "icon", "colour", "notes_layout", "notes_sort_by", "notes_sort_direction", "notes_group_by", "bookmarked_layout", "bookmarked_sort_by", "bookmarked_sort_direction", "bookmarked_group_by", "user", "created", "updated") SELECT "id", "title", "icon", "colour", "notes_layout", "notes_sort_by", "notes_sort_direction", "notes_group_by", "bookmarked_layout", "bookmarked_sort_by", "bookmarked_sort_direction", "bookmarked_group_by", "user", "created", "updated" FROM `pocketbooks`;--> statement-breakpoint
DROP TABLE `pocketbooks`;--> statement-breakpoint
ALTER TABLE `__new_pocketbooks` RENAME TO `pocketbooks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`colour` text NOT NULL,
	`icon` text,
	`layout` text DEFAULT 'list' NOT NULL,
	`description` text,
	`group_by` text,
	`sort_by` text DEFAULT 'created' NOT NULL,
	`sort_direction` text DEFAULT 'desc' NOT NULL,
	`links` text DEFAULT '[]' NOT NULL,
	`tag_group` text,
	`pocketbook` text,
	`user` text,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`tag_group`) REFERENCES `tag_groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pocketbook`) REFERENCES `pocketbooks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tags`("id", "name", "colour", "icon", "layout", "description", "group_by", "sort_by", "sort_direction", "links", "tag_group", "pocketbook", "user", "created", "updated") SELECT "id", "name", "colour", "icon", "layout", "description", "group_by", "sort_by", "sort_direction", "links", "tag_group", "pocketbook", "user", "created", "updated" FROM `tags`;--> statement-breakpoint
DROP TABLE `tags`;--> statement-breakpoint
ALTER TABLE `__new_tags` RENAME TO `tags`;
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text DEFAULT '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}' NOT NULL,
	`tint` text,
	`is_waypoint` integer DEFAULT false NOT NULL,
	`pocketbook` text,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`pocketbook`) REFERENCES `pocketbooks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_comments`("id", "content", "tint", "is_waypoint", "pocketbook", "created", "updated") SELECT "id", "content", "tint", "is_waypoint", "pocketbook", "created", "updated" FROM `comments`;--> statement-breakpoint
DROP TABLE `comments`;--> statement-breakpoint
ALTER TABLE `__new_comments` RENAME TO `comments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`content` text DEFAULT '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":null,"format":"","indent":0,"textFormat":0,"textStyle":"","type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}' NOT NULL,
	`is_bookmarked` integer DEFAULT false NOT NULL,
	`pocketbook` text NOT NULL,
	`deleted` text,
	`links` text DEFAULT '[]' NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`pocketbook`) REFERENCES `pocketbooks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_notes`("id", "title", "content", "is_bookmarked", "pocketbook", "deleted", "links", "created", "updated") SELECT "id", "title", "content", "is_bookmarked", "pocketbook", "deleted", "links", "created", "updated" FROM `notes`;--> statement-breakpoint
DROP TABLE `notes`;--> statement-breakpoint
ALTER TABLE `__new_notes` RENAME TO `notes`;--> statement-breakpoint
CREATE TABLE `__new_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`colour` text NOT NULL,
	`icon` text,
	`layout` text DEFAULT 'list' NOT NULL,
	`description` text,
	`group_by` text,
	`group_by_tag_group_id` text,
	`sort_by` text DEFAULT 'created' NOT NULL,
	`sort_direction` text DEFAULT 'desc' NOT NULL,
	`links` text DEFAULT '[]' NOT NULL,
	`tag_group` text,
	`pocketbook` text NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`group_by_tag_group_id`) REFERENCES `tag_groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_group`) REFERENCES `tag_groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pocketbook`) REFERENCES `pocketbooks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tags`("id", "name", "colour", "icon", "layout", "description", "group_by", "group_by_tag_group_id", "sort_by", "sort_direction", "links", "tag_group", "pocketbook", "created", "updated") SELECT "id", "name", "colour", "icon", "layout", "description", "group_by", "group_by_tag_group_id", "sort_by", "sort_direction", "links", "tag_group", "pocketbook", "created", "updated" FROM `tags`;--> statement-breakpoint
DROP TABLE `tags`;--> statement-breakpoint
ALTER TABLE `__new_tags` RENAME TO `tags`;--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`link` text,
	`links` text DEFAULT '[]' NOT NULL,
	`is_important` integer DEFAULT false NOT NULL,
	`note` text,
	`blocked_comment` text,
	`due_date` text,
	`completed_date` text,
	`cancelled_date` text,
	`blocked_date` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`pocketbook` text NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`note`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pocketbook`) REFERENCES `pocketbooks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "title", "description", "link", "links", "is_important", "note", "blocked_comment", "due_date", "completed_date", "cancelled_date", "blocked_date", "sort_order", "pocketbook", "created", "updated") SELECT "id", "title", "description", "link", "links", "is_important", "note", "blocked_comment", "due_date", "completed_date", "cancelled_date", "blocked_date", "sort_order", "pocketbook", "created", "updated" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint
ALTER TABLE `pocketbooks` DROP COLUMN `user`;--> statement-breakpoint
ALTER TABLE `tag_groups` DROP COLUMN `user`;
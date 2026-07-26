ALTER TABLE `update_notes` RENAME TO `comment_notes`;--> statement-breakpoint
ALTER TABLE `updates` RENAME TO `comments`;--> statement-breakpoint
ALTER TABLE `comment_notes` RENAME COLUMN "update_id" TO "comment_id";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_comment_notes` (
	`comment_id` text NOT NULL,
	`note_id` text NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_comment_notes`("comment_id", "note_id") SELECT "comment_id", "note_id" FROM `comment_notes`;--> statement-breakpoint
DROP TABLE `comment_notes`;--> statement-breakpoint
ALTER TABLE `__new_comment_notes` RENAME TO `comment_notes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text,
	`tint` text,
	`is_waypoint` integer DEFAULT false NOT NULL,
	`pocketbook` text,
	`user` text,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`pocketbook`) REFERENCES `pocketbooks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_comments`("id", "content", "tint", "is_waypoint", "pocketbook", "user", "created", "updated") SELECT "id", "content", "tint", "is_waypoint", "pocketbook", "user", "created", "updated" FROM `comments`;--> statement-breakpoint
DROP TABLE `comments`;--> statement-breakpoint
ALTER TABLE `__new_comments` RENAME TO `comments`;
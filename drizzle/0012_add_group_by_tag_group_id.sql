ALTER TABLE `pocketbooks` ADD `notes_group_by_tag_group_id` text;--> statement-breakpoint
ALTER TABLE `pocketbooks` ADD `bookmarked_group_by_tag_group_id` text;--> statement-breakpoint
ALTER TABLE `tags` ADD `group_by_tag_group_id` text REFERENCES tag_groups(id);
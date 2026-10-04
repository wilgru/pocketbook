CREATE TABLE `credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`email` text,
	`secret_hash` text,
	`label` text,
	`prefix` text,
	`scopes` text,
	`attempts` integer,
	`created` text NOT NULL,
	`expires` text,
	`last_used` text,
	`revoked` text
);
--> statement-breakpoint
CREATE INDEX `credentials_type_secret_hash_idx` ON `credentials` (`type`,`secret_hash`);
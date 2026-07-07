CREATE TABLE `city_zones` (
	`id` text PRIMARY KEY NOT NULL,
	`state_id` text NOT NULL,
	`city_name` text NOT NULL,
	`zone_name` text NOT NULL,
	FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `states` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`update_frequency` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `states_slug_unique` ON `states` (`slug`);--> statement-breakpoint
CREATE TABLE `wages` (
	`id` text PRIMARY KEY NOT NULL,
	`state_id` text NOT NULL,
	`zone` text,
	`industry` text NOT NULL,
	`skill_level` text NOT NULL,
	`category` text,
	`basic_wage` real NOT NULL,
	`vda` real DEFAULT 0 NOT NULL,
	`hra` real DEFAULT 0 NOT NULL,
	`total_monthly` real GENERATED ALWAYS AS ((basic_wage + vda + hra)) VIRTUAL,
	`total_daily` real,
	`effective_from` integer NOT NULL,
	`notification_date` integer,
	`source_url` text,
	`pdf_url` text,
	`status` text DEFAULT 'pending_review',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE VIRTUAL TABLE `wages_fts` USING fts5(industry, skill_level, category, zone, content='wages', content_rowid='id');

PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_wages` (
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
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000),
	`updated_at` integer DEFAULT (strftime('%s', 'now') * 1000),
	FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_wages`("id", "state_id", "zone", "industry", "skill_level", "category", "basic_wage", "vda", "hra", "total_daily", "effective_from", "notification_date", "source_url", "pdf_url", "status", "created_at", "updated_at") SELECT "id", "state_id", "zone", "industry", "skill_level", "category", "basic_wage", "vda", "hra", "total_daily", "effective_from", "notification_date", "source_url", "pdf_url", "status", "created_at", "updated_at" FROM `wages`;--> statement-breakpoint
DROP TABLE `wages`;--> statement-breakpoint
ALTER TABLE `__new_wages` RENAME TO `wages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `states` ADD `wage_code_status` text DEFAULT 'Legacy';
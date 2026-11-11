CREATE TABLE `test_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`chat_id` text,
	`timestamp` integer NOT NULL,
	`code` text NOT NULL,
	`compile_success` integer NOT NULL,
	`compiler_output` text,
	`tests_passed` integer NOT NULL,
	`tests_total` integer NOT NULL,
	`test_details` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`name` text NOT NULL,
	`avatar` text DEFAULT '' NOT NULL,
	`username` text NOT NULL,
	`provider` text NOT NULL,
	`provider_id` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`neptun_code` text,
	`consent_given` integer DEFAULT false NOT NULL,
	`consent_given_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "name", "avatar", "username", "provider", "provider_id", "role", "neptun_code", "consent_given", "consent_given_at", "created_at") SELECT "id", "email", "name", "avatar", "username", "provider", "provider_id", "role", "neptun_code", "consent_given", "consent_given_at", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_provider_id_idx` ON `users` (`provider`,`provider_id`);
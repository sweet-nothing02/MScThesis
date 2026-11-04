ALTER TABLE `users` ADD `role` text DEFAULT 'student' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `neptun_code` text;--> statement-breakpoint
ALTER TABLE `users` ADD `consent_given` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `consent_given_at` integer;
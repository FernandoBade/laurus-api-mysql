ALTER TABLE `token` ADD `session_id` varchar(64);--> statement-breakpoint
ALTER TABLE `token` ADD `session_expires_at` timestamp;--> statement-breakpoint
ALTER TABLE `token` ADD `revoked_at` timestamp;--> statement-breakpoint
CREATE INDEX `token_session_id_idx` ON `token` (`session_id`);
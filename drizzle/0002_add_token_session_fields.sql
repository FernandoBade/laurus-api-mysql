ALTER TABLE `token` ADD COLUMN `session_id` varchar(64);
--> statement-breakpoint
ALTER TABLE `token` ADD COLUMN `session_expires_at` timestamp;
--> statement-breakpoint
ALTER TABLE `token` ADD COLUMN `revoked_at` timestamp;
--> statement-breakpoint
CREATE INDEX `token_session_id_idx` ON `token` (`session_id`);

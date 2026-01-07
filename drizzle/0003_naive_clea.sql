ALTER TABLE `token` MODIFY COLUMN `type` enum('refresh','email_verification','password_reset') NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `emailVerifiedAt` timestamp;
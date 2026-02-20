ALTER TABLE `user` MODIFY COLUMN `language` enum('en-US','es-ES','pt-BR') NOT NULL DEFAULT 'pt-BR';--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `dateFormat`;
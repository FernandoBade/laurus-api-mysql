ALTER TABLE `token` MODIFY COLUMN `type` ENUM('refresh', 'email_verification', 'password_reset') NOT NULL;

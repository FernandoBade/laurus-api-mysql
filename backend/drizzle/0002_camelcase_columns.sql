ALTER TABLE `account`
    CHANGE COLUMN `user_id` `userId` int NOT NULL;
--> statement-breakpoint
ALTER TABLE `category`
    CHANGE COLUMN `user_id` `userId` int NOT NULL;
--> statement-breakpoint
ALTER TABLE `credit_card`
    CHANGE COLUMN `user_id` `userId` int NOT NULL,
    CHANGE COLUMN `account_id` `accountId` int;
--> statement-breakpoint
ALTER TABLE `subcategory`
    CHANGE COLUMN `category_id` `categoryId` int NOT NULL;
--> statement-breakpoint
ALTER TABLE `tag`
    CHANGE COLUMN `user_id` `userId` int NOT NULL;
--> statement-breakpoint
DROP INDEX `tag_user_id_name_unique` ON `tag`;
--> statement-breakpoint
CREATE UNIQUE INDEX `tag_userId_name_unique` ON `tag` (`userId`, `name`);
--> statement-breakpoint
ALTER TABLE `transaction`
    CHANGE COLUMN `account_id` `accountId` int,
    CHANGE COLUMN `credit_card_id` `creditCardId` int,
    CHANGE COLUMN `category_id` `categoryId` int,
    CHANGE COLUMN `subcategory_id` `subcategoryId` int;
--> statement-breakpoint
ALTER TABLE `transaction_tag`
    CHANGE COLUMN `transaction_id` `transactionId` int NOT NULL,
    CHANGE COLUMN `tag_id` `tagId` int NOT NULL;
--> statement-breakpoint
DROP INDEX `transaction_tag_unique` ON `transaction_tag`;
--> statement-breakpoint
CREATE UNIQUE INDEX `transactionTag_unique` ON `transaction_tag` (`transactionId`, `tagId`);
--> statement-breakpoint
ALTER TABLE `log`
    CHANGE COLUMN `user_id` `userId` int;
--> statement-breakpoint
ALTER TABLE `token`
    CHANGE COLUMN `user_id` `userId` int NOT NULL,
    CHANGE COLUMN `token_hash` `tokenHash` varchar(64) NOT NULL,
    CHANGE COLUMN `session_id` `sessionId` varchar(64),
    CHANGE COLUMN `session_expires_at` `sessionExpiresAt` timestamp,
    CHANGE COLUMN `revoked_at` `revokedAt` timestamp,
    CHANGE COLUMN `expires_at` `expiresAt` timestamp NOT NULL,
    CHANGE COLUMN `created_at` `createdAt` timestamp NOT NULL DEFAULT (now()),
    CHANGE COLUMN `updated_at` `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;
--> statement-breakpoint
DROP INDEX `token_user_id_idx` ON `token`;
--> statement-breakpoint
DROP INDEX `token_session_id_idx` ON `token`;
--> statement-breakpoint
DROP INDEX `token_expires_at_idx` ON `token`;
--> statement-breakpoint
DROP INDEX `token_token_hash_unique` ON `token`;
--> statement-breakpoint
CREATE INDEX `token_userId_idx` ON `token` (`userId`);
--> statement-breakpoint
CREATE INDEX `token_sessionId_idx` ON `token` (`sessionId`);
--> statement-breakpoint
CREATE INDEX `token_expiresAt_idx` ON `token` (`expiresAt`);
--> statement-breakpoint
CREATE UNIQUE INDEX `token_tokenHash_unique` ON `token` (`tokenHash`);

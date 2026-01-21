RENAME TABLE `transaction_tag` TO `transactions__to__tags`;
--> statement-breakpoint
ALTER TABLE `transactions__to__tags`
    DROP INDEX `transactionTag_unique`;
--> statement-breakpoint
ALTER TABLE `transactions__to__tags`
    ADD CONSTRAINT `transactions__to__tags_pk` PRIMARY KEY (`transactionId`, `tagId`);
--> statement-breakpoint
ALTER TABLE `transactions__to__tags`
    ADD CONSTRAINT `transactions__to__tags_transactionId_fk` FOREIGN KEY (`transactionId`) REFERENCES `transaction` (`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `transactions__to__tags`
    ADD CONSTRAINT `transactions__to__tags_tagId_fk` FOREIGN KEY (`tagId`) REFERENCES `tag` (`id`) ON DELETE no action ON UPDATE no action;

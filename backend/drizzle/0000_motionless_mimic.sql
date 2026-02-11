CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(255),
	`lastName` varchar(255),
	`email` varchar(255) NOT NULL,
	`password` varchar(255),
	`birthDate` date,
	`phone` varchar(255),
	`avatarUrl` varchar(512),
	`theme` enum('dark','light') NOT NULL DEFAULT 'dark',
	`language` enum('en-US','es-ES','pt-BR') NOT NULL DEFAULT 'en-US',
	`dateFormat` enum('DD/MM/YYYY','MM/DD/YYYY') NOT NULL DEFAULT 'DD/MM/YYYY',
	`currency` enum('ARS','COP','BRL','EUR','USD') NOT NULL DEFAULT 'BRL',
	`profile` enum('starter','pro','master') NOT NULL DEFAULT 'starter',
	`hideValues` boolean NOT NULL DEFAULT false,
	`active` boolean NOT NULL DEFAULT true,
	`emailVerifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`institution` varchar(255),
	`type` enum('checking','payroll','savings','investment','loan','other') NOT NULL DEFAULT 'other',
	`observation` text,
	`balance` decimal(10,2) NOT NULL DEFAULT '0.00',
	`active` boolean NOT NULL DEFAULT true,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` int AUTO_INCREMENT NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`date` date NOT NULL,
	`transactionType` enum('income','expense') NOT NULL,
	`observation` text,
	`transactionSource` enum('account','creditCard') NOT NULL,
	`isInstallment` boolean NOT NULL DEFAULT false,
	`totalMonths` int,
	`isRecurring` boolean NOT NULL DEFAULT false,
	`paymentDay` int,
	`active` boolean NOT NULL DEFAULT true,
	`accountId` int,
	`creditCardId` int,
	`categoryId` int,
	`subcategoryId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transaction_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`type` enum('income','expense') NOT NULL,
	`color` enum('red','blue','green','purple','yellow','orange','pink','gray','cyan','indigo') NOT NULL DEFAULT 'purple',
	`active` boolean NOT NULL DEFAULT true,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `category_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subcategory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`active` boolean NOT NULL DEFAULT true,
	`categoryId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subcategory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_card` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`flag` enum('visa','mastercard','amex','elo','hipercard','discover','diners') NOT NULL,
	`observation` text,
	`balance` decimal(10,2) NOT NULL DEFAULT '0.00',
	`limit` decimal(10,2) NOT NULL DEFAULT '0.00',
	`active` boolean NOT NULL DEFAULT true,
	`userId` int NOT NULL,
	`accountId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credit_card_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tag` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tag_id` PRIMARY KEY(`id`),
	CONSTRAINT `tag_userId_name_unique` UNIQUE(`userId`,`name`)
);
--> statement-breakpoint
CREATE TABLE `transactions__to__tags` (
	`transactionId` int NOT NULL,
	`tagId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions__to__tags_pk` PRIMARY KEY(`transactionId`,`tagId`)
);
--> statement-breakpoint
CREATE TABLE `log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('alert','debug','error','success') NOT NULL,
	`operation` enum('create','delete','login','logout','update') NOT NULL DEFAULT 'create',
	`category` enum('account','auth','category','transaction','log','subcategory','user','creditCard','tag') NOT NULL DEFAULT 'log',
	`detail` text,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `token` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('refresh','emailVerification','passwordReset') NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`sessionId` varchar(64),
	`sessionExpiresAt` timestamp,
	`revokedAt` timestamp,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `token_id` PRIMARY KEY(`id`),
	CONSTRAINT `token_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
ALTER TABLE `transactions__to__tags` ADD CONSTRAINT `transactions__to__tags_transactionId_fk` FOREIGN KEY (`transactionId`) REFERENCES `transaction`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions__to__tags` ADD CONSTRAINT `transactions__to__tags_tagId_fk` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `token_userId_idx` ON `token` (`userId`);--> statement-breakpoint
CREATE INDEX `token_sessionId_idx` ON `token` (`sessionId`);--> statement-breakpoint
CREATE INDEX `token_expiresAt_idx` ON `token` (`expiresAt`);
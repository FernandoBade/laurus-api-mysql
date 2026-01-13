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
	`user_id` int NOT NULL,
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
	`account_id` int,
	`credit_card_id` int,
	`category_id` int,
	`subcategory_id` int,
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
	`user_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `category_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subcategory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`active` boolean NOT NULL DEFAULT true,
	`category_id` int NOT NULL,
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
	`user_id` int NOT NULL,
	`account_id` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credit_card_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tag` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tag_id` PRIMARY KEY(`id`),
	CONSTRAINT `tag_user_id_name_unique` UNIQUE(`user_id`,`name`)
);
--> statement-breakpoint
CREATE TABLE `transaction_tag` (
	`transaction_id` int NOT NULL,
	`tag_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transaction_tag_unique` UNIQUE(`transaction_id`,`tag_id`)
);
--> statement-breakpoint
CREATE TABLE `log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('alert','debug','error','success') NOT NULL,
	`operation` enum('create','delete','login','logout','update') NOT NULL DEFAULT 'create',
	`category` enum('account','auth','category','transaction','log','subcategory','user','creditCard','tag') NOT NULL DEFAULT 'log',
	`detail` text,
	`user_id` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `token` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` enum('refresh','email_verification','password_reset') NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`session_id` varchar(64),
	`session_expires_at` timestamp,
	`revoked_at` timestamp,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `token_id` PRIMARY KEY(`id`),
	CONSTRAINT `token_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE INDEX `token_user_id_idx` ON `token` (`user_id`);--> statement-breakpoint
CREATE INDEX `token_session_id_idx` ON `token` (`session_id`);--> statement-breakpoint
CREATE INDEX `token_expires_at_idx` ON `token` (`expires_at`);
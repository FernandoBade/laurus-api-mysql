ALTER TABLE `token`
    MODIFY COLUMN `type` ENUM(
        'refresh',
        'email_verification',
        'password_reset',
        'emailVerification',
        'passwordReset'
    ) NOT NULL;
--> statement-breakpoint
UPDATE `token`
SET `type` = 'emailVerification'
WHERE `type` = 'email_verification';
--> statement-breakpoint
UPDATE `token`
SET `type` = 'passwordReset'
WHERE `type` = 'password_reset';
--> statement-breakpoint
ALTER TABLE `token`
    MODIFY COLUMN `type` ENUM(
        'refresh',
        'emailVerification',
        'passwordReset'
    ) NOT NULL;
